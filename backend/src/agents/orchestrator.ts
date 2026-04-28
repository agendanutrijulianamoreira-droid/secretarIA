import { ManagerAgent } from './manager.js';
import { FAQAgent } from './faq.js';
import { SchedulingAgent } from './scheduling.js';
import { SalesAgent } from './sales.js';
import { ClinicContext, PatientContext, ChatMessage, AgentResponse } from './types.js';
import { query } from '../lib/db.js';
import { notifyHandoff } from '../services/notifier.js';

export class Orchestrator {
  private manager = new ManagerAgent();
  private faq = new FAQAgent();
  private scheduler = new SchedulingAgent();
  private sales = new SalesAgent();

  async processMessage(
    message: string,
    clinic: ClinicContext,
    patient: PatientContext
  ): Promise<AgentResponse> {
    
    // 1. Recuperar histórico recente (últimas 10 mensagens para economizar tokens)
    const historyResult = await query(
      'SELECT role, content FROM chat_messages WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 10',
      [patient.id]
    );
    const history: ChatMessage[] = historyResult.rows.reverse() as ChatMessage[];

    // 2. Classificar intenção com o Manager
    const { intent } = await this.manager.classifyIntent(message, clinic, history);

    // 3. Roteamento
    let response: AgentResponse;

    switch (intent) {
      case 'faq':
        response = await this.faq.handle(message, clinic, history);
        break;

      case 'scheduling':
        response = await this.scheduler.handle(message, clinic, patient, history);
        break;

      case 'sales':
        response = await this.sales.handle(message, clinic, patient, history);
        break;

      case 'billing':
        response = {
          content: 'Vou consultar suas informações financeiras e te envio os detalhes em instantes.',
          intent: 'billing'
        };
        break;

      case 'handoff':
        response = {
          content: 'Vou chamar um atendente humano para te ajudar com isso agora mesmo. Por favor, aguarde um momento.',
          intent: 'handoff',
          needs_action: true
        };
        // Notificar recepcionista de forma assíncrona
        notifyHandoff(clinic, patient.phone, patient.name).catch(console.error);
        break;

      default:
        response = await this.faq.handle(message, clinic, history);
    }

    // 4. Salvar resposta da IA no histórico
    await query(
      'INSERT INTO chat_messages (clinic_id, patient_id, role, content) VALUES ($1, $2, $3, $4)',
      [clinic.id, patient.id, 'assistant', response.content]
    );

    return response;
  }
}
