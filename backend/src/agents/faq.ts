import OpenAI from 'openai';
import { ClinicContext, ChatMessage, AgentResponse } from './types.js';

const openai = new OpenAI();

export class FAQAgent {
  async handle(
    message: string, 
    clinic: ClinicContext, 
    history: ChatMessage[]
  ): Promise<AgentResponse> {
    const prompt = `
Você é a Secretária Virtual da clínica "${clinic.name}".
Sua função é responder dúvidas dos pacientes com base nas informações oficiais da clínica.

DADOS DA CLÍNICA:
${clinic.prompt_context}
Configurações Adicionais: ${JSON.stringify(clinic.config_json)}

DIRETRIZES:
- Use o Tom de Voz: ${clinic.prompt_context}
- Seja direta, profissional e empática.
- Se não souber a informação, oriente o paciente a aguardar que a recepção entrará em contato.
- Não invente dados (horários, preços ou serviços) que não estejam no contexto.

MENSAGEM DO PACIENTE:
"${message}"
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      });

      return {
        content: response.choices[0].message.content || '',
        intent: 'faq'
      };
    } catch (error) {
      console.error('❌ Erro no FAQAgent:', error);
      return { content: 'Desculpe, tive um problema técnico. Um atendente humano já vai te ajudar.' };
    }
  }
}
