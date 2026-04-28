import OpenAI from 'openai';
import { ClinicContext, PatientContext, ChatMessage, AgentResponse } from './types.js';
import { query } from '../lib/db.js';

const openai = new OpenAI();

export class SalesAgent {
  async handle(
    message: string,
    clinic: ClinicContext,
    patient: PatientContext,
    history: ChatMessage[]
  ): Promise<AgentResponse> {
    
    // Buscar promoções ativas para injetar no contexto
    let promotionsContext = '';
    try {
      const promoResult = await query(
        `SELECT title, description, discount_rules, valid_until FROM active_promotions 
         WHERE clinic_id = $1 AND is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW())`,
        [clinic.id]
      );
      
      if (promoResult.rows.length > 0) {
        promotionsContext = `\nPROMOÇÕES ATIVAS (Use apenas como argumento de fechamento/urgência se o cliente hesitar pelo preço):\n`;
        promoResult.rows.forEach(p => {
          promotionsContext += `- ${p.title}: ${p.description}. Regras: ${p.discount_rules}. Válido até: ${p.valid_until ? p.valid_until.toISOString().split('T')[0] : 'Indeterminado'}\n`;
        });
      }
    } catch (e) {
      console.error('Erro ao buscar promoções ativas', e);
    }

    const systemPrompt = `
Você é uma Especialista em Fechamento e Consultora de Vendas da clínica de nutrição "${clinic.name}".
O público-alvo são mulheres empreendedoras de 30 a 45 anos com rotina corrida, buscando resolver problemas como efeito sanfona, inchaço, falta de energia, SOP, endometriose ou compulsão noturna.

DIRETRIZES DE VENDAS (MÉTODO SMART & PUV):
1. **Regra Absoluta:** NUNCA informe o preço da consulta na primeira interação sobre valores.
2. **Sondagem da Dor:** Se o paciente perguntar o preço, você deve primeiramente acolher e sondar a dor. Exemplo: "Compreendo perfeitamente. Para que eu possa te passar os valores adequados, me conte rapidamente: quais são as suas maiores dificuldades hoje para atingir seu objetivo?".
3. **Proposta Única de Valor (PUV):** Antes de ancorar o valor, mostre os diferenciais (método focado na rotina, sem extremismos, acompanhamento contínuo).
4. **Fechamento e Controle de Agenda:** Aja como líder. NUNCA diga "Qual melhor horário para você?". Sempre ofereça duas opções. Exemplo: "Eu consigo te encaixar na terça às 14h ou na quinta às 09h. Qual prefere?".
5. **Tratamento de Objeções:** Se o cliente achar caro, seja empática, mostre o custo da inação (continuar com o mesmo problema). Se houver promoções ativas no contexto, utilize-as gerando escassez/urgência.
6. **Formatação:** Textos visualmente harmônicos, curtos, use quebras de linha para facilitar a leitura. Nunca envie "paredões de texto". NUNCA USE EMOJIS (apenas a pontuação padrão).

PORTFÓLIO DE SERVIÇOS E PREÇOS:
- Consulta Avulsa: R$ 200,00
- Checkup Nutricional Presencial: R$ 520,00
- Protocolos de Reprogramação Hormonal:
  * 3 meses: R$ 2.190,00
  * 6 meses: R$ 4.190,00
  * 12 meses: R$ 7.590,00

CONTEXTO DA CLÍNICA:
${clinic.prompt_context}
${promotionsContext}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // Usando gpt-4o para maior capacidade persuasiva
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ],
        temperature: 0.7, // Um pouco de criatividade para argumentação
      });

      return {
        content: completion.choices[0].message.content || 'Houve um erro processando sua resposta.',
        intent: 'sales'
      };
    } catch (error) {
      console.error('❌ Erro no SalesAgent:', error);
      return {
        content: 'No momento nosso sistema comercial está passando por atualizações. Posso pedir para um especialista humano te chamar?',
        intent: 'handoff',
        needs_action: true
      };
    }
  }
}
