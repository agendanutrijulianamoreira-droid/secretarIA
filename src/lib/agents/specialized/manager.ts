import { IAgent, AgentResponse, ClinicContext, PatientContext, ChatMessage } from '../types';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class ManagerAgent implements IAgent {
    name = 'General Manager';

    async process(
        message: string, 
        context: { clinic: ClinicContext, patient: PatientContext, history: ChatMessage[] }
    ): Promise<AgentResponse> {
        const prompt = `
Você é o Gerente Geral da clínica "${context.clinic.name}".
Sua função é analisar a mensagem do paciente e decidir qual é a intenção dele.

DADOS DA CLÍNICA:
- Especialidades: ${context.clinic.specialties.join(', ')}
- Tom de Voz: ${context.clinic.tone_of_voice}

REGRAS DE ROTEAMENTO:
1. FAQ: Dúvidas sobre horários, localização, procedimentos, preços ou informações gerais.
2. SCHEDULING: Pedidos de agendamento, reagendamento ou cancelamento de consultas.
3. BILLING: Dúvidas sobre pagamentos, boletos, notas fiscais ou pendências financeiras.
4. HANDOFF: Quando o paciente está frustrado, pede para falar com um humano, ou quando o caso é complexo demais para IA.

RESPONDA APENAS EM JSON:
{
  "intent": "faq" | "scheduling" | "billing" | "handoff" | "unknown",
  "reasoning": "Breve explicação da sua decisão",
  "suggested_response": "Uma resposta curta inicial se necessário"
}

MENSAGEM DO PACIENTE:
"${message}"
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: prompt },
                ...context.history.slice(-5).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: message }
            ],
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');

        return {
            content: result.suggested_response || '',
            intent: result.intent
        };
    }
}
