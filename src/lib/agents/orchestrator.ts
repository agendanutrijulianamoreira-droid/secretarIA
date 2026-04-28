import { ManagerAgent } from './specialized/manager';
import { FAQAgent } from './specialized/faq';
import { ClinicContext, PatientContext, ChatMessage, AgentResponse } from './types';

export class Orchestrator {
    private manager = new ManagerAgent();
    private faq = new FAQAgent();
    // TODO: Implement and add Scheduling and Billing agents

    async handleMessage(
        message: string,
        context: { clinic: ClinicContext, patient: PatientContext, history: ChatMessage[] }
    ): Promise<AgentResponse> {
        // 1. O Gerente classifica a intenção
        const managerResult = await this.manager.process(message, context);

        // 2. Roteia para o agente especialista
        switch (managerResult.intent) {
            case 'faq':
                return await this.faq.process(message, context);
            
            case 'scheduling':
                // Temporariamente usando FAQ ou uma resposta padrão até implementar o SchedulingAgent
                return {
                    content: "Entendi que você gostaria de agendar uma consulta. Vou te transferir para o nosso especialista em agendamentos agora mesmo!",
                    intent: 'scheduling',
                    needs_action: true
                };

            case 'handoff':
                return {
                    content: "Entendi. Vou chamar um de nossos atendentes humanos para te ajudar agora mesmo. Por favor, aguarde um instante.",
                    intent: 'handoff',
                    needs_action: true
                };

            default:
                return await this.faq.process(message, context);
        }
    }
}
