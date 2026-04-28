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
      'SELECT * FROM clinics WHERE whatsapp_number = $1',
      [destinationPhone]
    );

    if (clinicResult.rows.length === 0) {
      console.error(`❌ Clínica não encontrada para o número ${destinationPhone}`);
      return;
    }

    const clinic = clinicResult.rows[0];

    // 2. Identificar ou criar o paciente
    let patient;
    const patientResult = await query(
      'SELECT * FROM patients WHERE clinic_id = $1 AND phone = $2',
      [clinic.id, patientPhone]
    );

    if (patientResult.rows.length === 0) {
      // Criar novo paciente
      const newPatientResult = await query(
        'INSERT INTO patients (clinic_id, phone, name) VALUES ($1, $2, $3) RETURNING *',
        [clinic.id, patientPhone, 'Paciente Novo']
      );
      patient = newPatientResult.rows[0];
    } else {
      patient = patientResult.rows[0];
    }

    // 3. Salvar a mensagem no histórico
    await query(
      'INSERT INTO chat_messages (clinic_id, patient_id, role, content) VALUES ($1, $2, $3, $4)',
      [clinic.id, patient.id, 'user', text]
    );

    // 4. Processar com Orquestrador Multi-Agente
    const orchestrator = new Orchestrator();
    const response = await orchestrator.processMessage(text, clinic, patient);

    // 5. Enviar resposta via WhatsApp
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
