import { Router } from 'express';
import { query } from '../lib/db.js';
import { Orchestrator } from '../agents/orchestrator.js';
import { whatsappService } from '../services/whatsapp.js';

const router = Router();

// Verificação do Webhook (exigido pela Meta)
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ WhatsApp Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Recebimento de Mensagens
router.post('/', async (req, res) => {
  // Responde 200 OK imediatamente para evitar timeout do WhatsApp
  res.status(200).send('EVENT_RECEIVED');

  try {
    const { entry } = req.body;
    if (!entry || !entry[0].changes || !entry[0].changes[0].value.messages) return;

    const change = entry[0].changes[0].value;
    const message = change.messages[0];
    const metadata = change.metadata;

    const patientPhone = message.from;
    const destinationPhone = metadata.display_phone_number; // Número da clínica
    const text = message.text?.body;

    if (!text) return;

    console.log(`📩 Mensagem recebida de ${patientPhone} para a clínica ${destinationPhone}: ${text}`);

    // 1. Identificar a clínica no banco
    const clinicResult = await query(
      'SELECT * FROM clients WHERE phone = $1',
      [destinationPhone]
    );

    if (clinicResult.rows.length === 0) {
      console.error(`❌ Clínica não encontrada para o número ${destinationPhone}`);
      return;
    }

    // Monta o ClinicContext a partir da tabela clients
    const raw = clinicResult.rows[0];
    const briefing = raw.briefing || {};
    const clinic = {
      id:                raw.id,
      name:              raw.name,
      whatsapp_number:   raw.phone,
      receptionist_phone: briefing.escalation_number || '',
      config_json:       { whatsapp_phone_number_id: raw.config_json?.whatsapp_phone_number_id },
      prompt_context:    [
        briefing.description || '',
        `Horários: ${briefing.business_hours || ''}`,
        `Tom de voz: ${briefing.ai_tone || ''}`,
        `Nome da IA: ${briefing.ai_name || 'Assistente'}`,
        briefing.restrictions ? `Restrições: ${briefing.restrictions}` : '',
        briefing.promotions  ? `Promoções: ${briefing.promotions}` : '',
      ].filter(Boolean).join('\n'),
      specialties:       raw.capabilities || [],
      operating_hours:   briefing.business_hours || '',
      pode_falar_preco:  briefing.ia_fala_preco || false,
    };

    // 2. Identificar ou criar o contato (lead)
    let patient;
    const patientResult = await query(
      'SELECT * FROM contatos WHERE client_id = $1 AND telefone = $2',
      [clinic.id, patientPhone]
    );

    if (patientResult.rows.length === 0) {
      const newPatientResult = await query(
        'INSERT INTO contatos (client_id, telefone, nome, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [clinic.id, patientPhone, 'Paciente Novo']
      );
      patient = newPatientResult.rows[0];
    } else {
      patient = patientResult.rows[0];
    }

    // Adapta para o formato esperado pelos agentes
    patient = { id: patient.id, phone: patient.telefone, name: patient.nome, clinic_id: clinic.id };

    // 3. Salvar a mensagem no histórico
    await query(
      'INSERT INTO chat_messages (client_id, telefone, role, content, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [clinic.id, patientPhone, 'user', text]
    );

    // 4. Processar com Orquestrador Multi-Agente
    const orchestrator = new Orchestrator();
    const response = await orchestrator.processMessage(text, clinic, patient);

    // 5. Detectar e executar ações automáticas (ex: Agendamento)
    if (response.content.includes('[[') && response.content.includes(']]')) {
      try {
        const actionMatch = response.content.match(/\[\[(.*?)\]\]/);
        if (actionMatch) {
          const actions = JSON.parse(actionMatch[1]);
          for (const action of actions) {
            if (action.action === 'create_appointment') {
              const { calendarService } = await import('../services/calendarService.js');
              await calendarService.createAppointment({
                clinic_id: clinic.id,
                professional_id: action.professional_id,
                patient_id: patient.id,
                patient_name: patient.name,
                start_time: action.start_time,
                end_time: new Date(new Date(action.start_time).getTime() + 60 * 60 * 1000).toISOString(), // +1h default
                service_type: action.service_type || 'Consulta'
              });
              console.log('📅 Agendamento criado automaticamente via IA');
            }
          }
          // Limpa o JSON da resposta para não enviar ao paciente
          response.content = response.content.replace(/\[\[.*?\]\]/g, '').trim();
        }
      } catch (err) {
        console.error('❌ Erro ao processar ação da IA:', err);
      }
    }

    // 6. Enviar resposta via WhatsApp
    console.log(`🤖 IA Respondeu para ${patientPhone}: ${response.content}`);
    const fromPhoneNumberId = clinic.config_json?.whatsapp_phone_number_id;
    if (fromPhoneNumberId) {
      await whatsappService.sendMessage(patientPhone, response.content, fromPhoneNumberId);
    }

    console.log(`✅ Mensagem processada para a clínica ${clinic.name}`);

  } catch (error) {
    console.error('❌ Erro no Webhook WhatsApp:', error);
  }
});

export default router;
