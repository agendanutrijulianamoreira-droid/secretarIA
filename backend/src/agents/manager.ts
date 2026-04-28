import OpenAI from 'openai';
import { AgentIntent, ClinicContext, ChatMessage } from './types.js';

const openai = new OpenAI();

export class ManagerAgent {
  async classifyIntent(
    message: string, 
    clinic: ClinicContext, 
    history: ChatMessage[]
  ): Promise<{ intent: AgentIntent; reasoning: string }> {
    const prompt = `
Você é o Gerente Geral da clínica "${clinic.name}".
Sua única função é analisar a mensagem do paciente e classificar a intenção em uma das categorias abaixo.

CATEGORIAS:
1. "faq": Dúvidas gerais sobre a clínica, localização ou procedimentos NÃO relacionados a fechamento de vendas.
2. "scheduling": Pedidos de agendamento diretos, consulta de horários disponíveis, reagendamento ou cancelamento.
3. "billing": Dúvidas financeiras de pacientes já ativos (boletos, comprovantes, notas fiscais).
4. "sales": O paciente quer saber o preço da consulta, como funciona o acompanhamento, ou demonstra intenção de compra/contratação de pacotes.
5. "handoff": O paciente quer falar com um humano, está irritado, ou o caso é urgente/complexo.

CONTEXTO DA CLÍNICA:
${clinic.prompt_context}

RESPONDA APENAS EM JSON:
{
  "intent": "faq" | "scheduling" | "billing" | "sales" | "handoff",
  "reasoning": "Breve motivo da escolha"
}

MENSAGEM DO PACIENTE:
"${message}"
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          ...history.map(m => ({ role: m.role, content: m.content }))
        ],
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        intent: result.intent || 'faq',
        reasoning: result.reasoning || ''
      };
    } catch (error) {
      console.error('❌ Erro no ManagerAgent:', error);
      return { intent: 'faq', reasoning: 'Erro no processamento' };
    }
  }
}
