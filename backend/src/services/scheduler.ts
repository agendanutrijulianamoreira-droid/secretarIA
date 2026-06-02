import cron from 'node-cron';
import { query } from '../lib/db.js';
import { whatsappService } from './whatsapp.js';

// Helper: envia mensagem para um contato via WhatsApp de uma clínica
async function sendToContact(clientId: string, telefone: string, text: string) {
  const cfgRes = await query('SELECT briefing FROM clients WHERE id = $1', [clientId]);
  const briefing = cfgRes.rows[0]?.briefing || {};
  const phoneNumberId = briefing.whatsapp_phone_number_id;
  if (!phoneNumberId) return;
  await whatsappService.sendMessage(telefone, text, phoneNumberId);
}

export function initScheduler() {
  console.log('🚀 Scheduler iniciado');

  // ── Job 1: Lembrete de consulta 24h antes (anti no-show) ─────────────────
  // Roda de hora em hora e envia lembrete para agendamentos que começam em ~24h
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [Scheduler] Verificando lembretes de consulta...');
    try {
      const result = await query(`
        SELECT a.id, a.client_id, a.data_inicio,
               c.telefone, c.nome
        FROM agendamentos a
        JOIN contatos c ON c.id = a.paciente_id
        WHERE a.status = 'agendado'
          AND a.data_inicio BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
          AND a.lembrete_enviado IS DISTINCT FROM TRUE
      `);

      for (const appt of result.rows) {
        try {
          const hora = new Date(appt.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const data = new Date(appt.data_inicio).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

          const msg = `Olá, ${appt.nome}!\n\nLembrando que você tem consulta amanhã, *${data}* às *${hora}*.\n\nCaso precise reagendar, entre em contato com antecedência. Te esperamos!`;

          await sendToContact(appt.client_id, appt.telefone, msg);
          await query('UPDATE agendamentos SET lembrete_enviado = TRUE WHERE id = $1', [appt.id]);
          console.log(`✅ Lembrete enviado para ${appt.telefone}`);
        } catch (e) {
          console.error(`❌ Erro ao enviar lembrete para ${appt.telefone}:`, e);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de Lembretes:', error);
    }
  });

  // ── Job 2: Recuperação de leads parados (1, 3 e 7 dias sem resposta) ──────
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ [Scheduler] Recuperação de leads...');
    try {
      const result = await query(`
        SELECT c.id as contato_id, c.client_id, c.telefone, c.nome,
               EXTRACT(DAY FROM NOW() - c.ultima_interacao)::int as dias_inativo
        FROM contatos c
        LEFT JOIN agendamentos a ON a.paciente_id = c.id AND a.data_inicio > NOW()
        WHERE a.id IS NULL
          AND c.crm_status NOT IN ('convertido', 'perdido')
          AND EXTRACT(DAY FROM NOW() - c.ultima_interacao)::int IN (1, 3, 7)
      `);

      for (const lead of result.rows) {
        try {
          const msgs: Record<number, string> = {
            1: `Oi, ${lead.nome}! Percebi que você entrou em contato ontem. Ficou alguma dúvida? Estou por aqui.`,
            3: `Oi, ${lead.nome}! Tudo bem? Ainda estou disponível para ajudar com qualquer dúvida sobre o acompanhamento.`,
            7: `${lead.nome}, sei que a rotina corrida dificulta tomar decisões. Se quiser conversar sobre como podemos ajudar, é só me chamar.`,
          };
          const msg = msgs[lead.dias_inativo];
          if (!msg) continue;

          await sendToContact(lead.client_id, lead.telefone, msg);
          await query('UPDATE contatos SET ultima_interacao = NOW() WHERE id = $1', [lead.contato_id]);
          console.log(`✅ Recuperação D${lead.dias_inativo} enviada para ${lead.telefone}`);
        } catch (e) {
          console.error(`❌ Erro ao enviar recuperação para ${lead.telefone}:`, e);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de Recuperação:', error);
    }
  });

  // ── Job 3: Reengajamento de pacientes inativos (3 e 6 meses) ─────────────
  cron.schedule('0 10 * * 1', async () => { // Toda segunda-feira às 10h
    console.log('⏰ [Scheduler] Reengajamento de pacientes...');
    try {
      const result = await query(`
        SELECT DISTINCT ON (p.id)
               p.id, p.client_id, p.telefone, p.nome,
               EXTRACT(MONTH FROM NOW() - MAX(a.data_inicio))::int as meses_inativo
        FROM pacientes p
        JOIN agendamentos a ON a.paciente_id = p.id
        WHERE a.status = 'realizado'
        GROUP BY p.id, p.client_id, p.telefone, p.nome
        HAVING EXTRACT(MONTH FROM NOW() - MAX(a.data_inicio))::int IN (3, 6)
      `);

      for (const paciente of result.rows) {
        try {
          const msg = paciente.meses_inativo === 3
            ? `${paciente.nome}, já faz 3 meses desde sua última consulta. Como estão os resultados? Vamos agendar um retorno para avaliarmos seu progresso?`
            : `${paciente.nome}, passaram 6 meses desde nosso último encontro. Seria ótimo conversar sobre como você está e planejar os próximos passos juntas.`;

          await sendToContact(paciente.client_id, paciente.telefone, msg);
          console.log(`✅ Reengajamento enviado para ${paciente.telefone}`);
        } catch (e) {
          console.error(`❌ Erro ao enviar reengajamento para ${paciente.telefone}:`, e);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de Reengajamento:', error);
    }
  });

  // ── Job 4: NPS — pesquisa de satisfação 24h após consulta ─────────────────
  cron.schedule('0 11 * * *', async () => {
    console.log('⏰ [Scheduler] Enviando pesquisas NPS...');
    try {
      const result = await query(`
        SELECT a.id, a.client_id,
               c.telefone, c.nome
        FROM agendamentos a
        JOIN contatos c ON c.id = a.paciente_id
        WHERE a.status = 'realizado'
          AND a.data_inicio BETWEEN NOW() - INTERVAL '25 hours' AND NOW() - INTERVAL '23 hours'
          AND a.nps_enviado IS DISTINCT FROM TRUE
      `);

      for (const appt of result.rows) {
        try {
          const msg = `${appt.nome}, obrigada pela sua visita ontem!\n\nDe 0 a 10, que nota você daria para o seu atendimento? Sua opinião é muito importante para continuarmos melhorando.`;

          await sendToContact(appt.client_id, appt.telefone, msg);
          await query('UPDATE agendamentos SET nps_enviado = TRUE WHERE id = $1', [appt.id]);
          console.log(`✅ NPS enviado para ${appt.telefone}`);
        } catch (e) {
          console.error(`❌ Erro ao enviar NPS para ${appt.telefone}:`, e);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de NPS:', error);
    }
  });
}
