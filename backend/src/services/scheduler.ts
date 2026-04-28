import cron from 'node-cron';
import { query } from '../lib/db.js';
import { whatsappService } from './whatsapp.js';

export function initScheduler() {
  console.log('🚀 Inicializando Motor de Agendamento (Scheduler)...');

  // Roda a cada minuto para testes (ou usar '0 9 * * *' para diário às 09:00)
  // Como estamos testando o fluxo, vamos manter a cada hora no exemplo ou minuto para dev
  // O usuário pediu "jobs que rodam diariamente", mas "para que se houver falha, o loop continue"
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Iniciando Jobs de Marketing e Follow-up...');

    // ---------------------------------------------------------
    // 1. RECUPERAÇÃO DE VENDAS (Leads estagnados há 1, 3 ou 7 dias)
    // ---------------------------------------------------------
    try {
      console.log('🔍 Checando leads para recuperação...');
      // Pegar pacientes que não têm agendamentos futuros e a última interação foi há 1, 3 ou 7 dias
      // Simplificação do status "em negociação" usando ausência de appointments
      const leadsResult = await query(
        `SELECT p.id as patient_id, p.phone, p.name, p.clinic_id, c.config_json,
         EXTRACT(DAY FROM NOW() - p.last_interaction) as days_inactive
         FROM patients p
         JOIN clinics c ON p.clinic_id = c.id
         LEFT JOIN appointments a ON a.patient_id = p.id AND a.start_time > NOW()
         WHERE a.id IS NULL 
         AND EXTRACT(DAY FROM NOW() - p.last_interaction) IN (1, 3, 7)`
      );

      for (const lead of leadsResult.rows) {
        try {
          const days = Math.floor(lead.days_inactive);
          // Buscar template 'recovery'
          const tmplResult = await query(
            `SELECT content_text FROM message_templates WHERE clinic_id = $1 AND type = 'recovery'`,
            [lead.clinic_id]
          );
          
          let message = `Olá ${lead.name || ''}, percebi que paramos de nos falar há alguns dias. Ficou alguma dúvida sobre o acompanhamento?`;
          if (tmplResult.rows.length > 0) {
            message = tmplResult.rows[0].content_text.replace('{{nome}}', lead.name || '');
          }

          const fromPhoneNumberId = lead.config_json?.whatsapp_phone_number_id;
          if (fromPhoneNumberId) {
            await whatsappService.sendMessage(lead.phone, message, fromPhoneNumberId);
            
            // Registrar follow-up
            await query(
              `INSERT INTO lead_followups (clinic_id, patient_id, followup_stage, status, sent_at)
               VALUES ($1, $2, $3, 'sent', NOW())`,
              [lead.clinic_id, lead.patient_id, days]
            );
            console.log(`✅ Recuperação enviada para lead ${lead.phone} (Dia ${days})`);
          }
        } catch (e) {
          console.error(`❌ Erro ao enviar recuperação para lead ${lead.phone}:`, e);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de Recuperação de Leads:', error);
    }

    // ---------------------------------------------------------
    // 2. REENGAJAMENTO (Pacientes inativos há 3 ou 6 meses)
    // ---------------------------------------------------------
    try {
      console.log('🔍 Checando pacientes para reengajamento...');
      const reengageResult = await query(
        `SELECT a.patient_id, p.phone, p.name, p.clinic_id, c.config_json,
         EXTRACT(MONTH FROM NOW() - MAX(a.start_time)) as months_inactive
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN clinics c ON a.clinic_id = c.id
         WHERE a.status = 'completed'
         GROUP BY a.patient_id, p.phone, p.name, p.clinic_id, c.config_json
         HAVING EXTRACT(MONTH FROM NOW() - MAX(a.start_time)) IN (3, 6)`
      );

      for (const patient of reengageResult.rows) {
        try {
          // Checar se já enviou reengajamento recente para evitar spam
          const lastFollowup = await query(
            `SELECT id FROM lead_followups WHERE patient_id = $1 AND followup_stage = 90 AND sent_at > NOW() - INTERVAL '30 days'`,
            [patient.patient_id]
          );
          
          if (lastFollowup.rows.length === 0) {
            const tmplResult = await query(
              `SELECT content_text FROM message_templates WHERE clinic_id = $1 AND type = 'reengagement'`,
              [patient.clinic_id]
            );
            
            let message = `Olá ${patient.name || ''}, já faz um tempo desde nossa última consulta! Como estão seus resultados? Vamos agendar um retorno?`;
            if (tmplResult.rows.length > 0) {
              message = tmplResult.rows[0].content_text.replace('{{nome}}', patient.name || '');
            }

            const fromPhoneNumberId = patient.config_json?.whatsapp_phone_number_id;
            if (fromPhoneNumberId) {
              await whatsappService.sendMessage(patient.phone, message, fromPhoneNumberId);
              
              await query(
                `INSERT INTO lead_followups (clinic_id, patient_id, followup_stage, status, sent_at)
                 VALUES ($1, $2, 90, 'sent', NOW())`, // 90 = código genérico para reengajamento
                [patient.clinic_id, patient.patient_id]
              );
              console.log(`✅ Reengajamento enviado para ${patient.phone}`);
            }
          }
        } catch (e) {
          console.error(`❌ Erro ao enviar reengajamento para ${patient.phone}:`, e);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de Reengajamento:', error);
    }

    // ---------------------------------------------------------
    // 3. NPS / FEEDBACK (24 horas após consulta)
    // ---------------------------------------------------------
    try {
      console.log('🔍 Checando consultas recentes para NPS...');
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterdayStart = new Date(yesterday).setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterday).setHours(23, 59, 59, 999);

      const npsResult = await query(
        `SELECT a.id as appointment_id, a.patient_id, p.phone, p.name, p.clinic_id, c.config_json
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN clinics c ON a.clinic_id = c.id
         WHERE a.status = 'completed'
         AND a.start_time BETWEEN $1 AND $2`,
        [new Date(yesterdayStart), new Date(yesterdayEnd)]
      );

      for (const appt of npsResult.rows) {
        try {
          const tmplResult = await query(
            `SELECT content_text FROM message_templates WHERE clinic_id = $1 AND type = 'nps'`,
            [appt.clinic_id]
          );
          
          let message = `Olá ${appt.name || ''}, como foi seu atendimento ontem? De 0 a 10, que nota você daria para a nossa clínica?`;
          if (tmplResult.rows.length > 0) {
            message = tmplResult.rows[0].content_text.replace('{{nome}}', appt.name || '');
          }

          const fromPhoneNumberId = appt.config_json?.whatsapp_phone_number_id;
          if (fromPhoneNumberId) {
            await whatsappService.sendMessage(appt.phone, message, fromPhoneNumberId);
            
            await query(
              `INSERT INTO lead_followups (clinic_id, patient_id, followup_stage, status, sent_at)
               VALUES ($1, $2, 24, 'sent', NOW())`, // 24 = código genérico para NPS 24h
              [appt.clinic_id, appt.patient_id]
            );
            console.log(`✅ Pesquisa NPS enviada para ${appt.phone}`);
          }
        } catch (e) {
          console.error(`❌ Erro ao enviar NPS para ${appt.phone}:`, e);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de NPS:', error);
    }
  });
}
