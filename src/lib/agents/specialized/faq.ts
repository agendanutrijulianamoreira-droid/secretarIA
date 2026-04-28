import { IAgent, AgentResponse, ClinicContext, PatientContext, ChatMessage } from '../types';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class FAQAgent implements IAgent {
    name = 'FAQ Specialist';

    async process(
        message: string, 
        context: { clinic: ClinicContext, patient: PatientContext, history: ChatMessage[] }
    ): Promise<AgentResponse> {
        const prompt = `
Você é a Secretária Virtual especialista em informações da clínica "${context.clinic.name}".
Sua função é responder dúvidas do paciente com base nos dados abaixo.

CONTEXTO DA CLÍNICA:
- Nome: ${context.clinic.name}
- Endereço: ${context.clinic.address}
- Horário de Funcionamento: ${JSON.stringify(context.clinic.operating_hours)}
- Especialidades: ${context.clinic.specialties.join(', ')}
- Tom de Voz: ${context.clinic.tone_of_voice}

DIRETRIZES:
- Seja cordial, profissional e empática.
- Se não souber a resposta, peça para o paciente aguardar que a recepção irá entrar em contato (não invente dados).
- Use emojis de forma moderada.
- Mantenha as respostas curtas e objetivas para WhatsApp.

MENSAGEM DO PACIENTE:
"${message}"
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: prompt },
                ...context.history.slice(-10).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: message }
            ]
        });

        return {
            content: response.choices[0].message.content || '',
            intent: 'faq'
        };
    }
}
