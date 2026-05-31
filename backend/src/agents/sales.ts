import OpenAI from 'openai';
import { ClinicContext, PatientContext, ChatMessage, AgentResponse } from './types.js';
import { query } from '../lib/db.js';

export class SalesAgent {
  private get openai() {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async handle(
    message: string,
    clinic: ClinicContext,
    patient: PatientContext,
    history: ChatMessage[]
  ): Promise<AgentResponse> {

    // Puxar serviços e preços do banco
    let servicosContext = '';
    try {
      const svcResult = await query(
        'SELECT nome, descricao, preco, duracao_minutos FROM servicos WHERE client_id = $1 AND ativo = TRUE ORDER BY preco ASC',
        [clinic.id]
      );
      if (svcResult.rows.length > 0) {
        servicosContext = '\nSERVIÇOS E VALORES:\n' + svcResult.rows.map((s: any) =>
          `- ${s.nome}: R$ ${Number(s.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${s.duracao_minutos ? ` (${s.duracao_minutos} min)` : ''}${s.descricao ? ` — ${s.descricao}` : ''}`
        ).join('\n');
      }
    } catch (e) {
      console.error('Erro ao buscar serviços:', e);
    }

    // Promoções ativas (tabela opcional)
    let promotionsContext = '';
    try {
      const promoResult = await query(
        `SELECT titulo, descricao FROM campanhas
         WHERE client_id = $1 AND status = 'ativa' AND (agendada_para IS NULL OR agendada_para > NOW())
         LIMIT 3`,
        [clinic.id]
      );
      if (promoResult.rows.length > 0) {
        promotionsContext = '\nPROMOÇÕES ATIVAS (use como gatilho de urgência se o paciente hesitar):\n' +
          promoResult.rows.map((p: any) => `- ${p.titulo}: ${p.descricao}`).join('\n');
      }
    } catch {
      // Tabela pode não existir ainda
    }

    const systemPrompt = `
Você é a Especialista Comercial da clínica "${clinic.name}".
Seu objetivo é converter o interesse do paciente em consulta agendada.

CONTEXTO DA CLÍNICA:
${clinic.prompt_context}
${servicosContext}
${promotionsContext}

MÉTODO DE VENDAS:
1. NUNCA informe o preço na primeira mensagem sobre valores. Primeiro sonde a dor do paciente.
   → Exemplo de sondagem: "Para te indicar a melhor opção, me conta rapidinho: qual é sua maior dificuldade hoje?"
2. Antes do preço, mostre o diferencial: método personalizado, sem extremismos, acompanhamento contínuo.
3. Ao falar de valor, contextualize o investimento (meses de acompanhamento, resultado esperado).
4. Fechamento com duas opções de horário — nunca pergunta aberta.
   → "Consigo te encaixar na terça às 14h ou na quinta às 10h. Qual prefere?"
5. Se o paciente achar caro: acolha, mostre o custo de não tratar o problema, use promoção se houver.
6. Texto curto, com quebras de linha. Sem "paredões". Sem emojis.

MENSAGEM DO PACIENTE:
"${message}"
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      });

      return {
        content: completion.choices[0].message.content || '',
        intent: 'sales'
      };
    } catch (error) {
      console.error('❌ Erro no SalesAgent:', error);
      return {
        content: 'No momento estou com uma dificuldade técnica. Posso pedir para um especialista da clínica entrar em contato com você?',
        intent: 'handoff',
        needs_action: true
      };
    }
  }
}
