import OpenAI from 'openai';
import { ClinicContext, PatientContext, ChatMessage, AgentResponse } from './types.js';
import { calendarService } from '../services/calendarService.js';
import { query } from '../lib/db.js';

const openai = new OpenAI();

/**
 * Agente especialista em agendamentos.
 * Responsável por gerenciar o fluxo de escolha de profissionais, verificação de datas e criação de compromissos.
 */
export class SchedulingAgent {
  async handle(
    message: string,
    clinic: ClinicContext,
    patient: PatientContext,
    history: ChatMessage[]
  ): Promise<AgentResponse> {
    
    // 1. Buscar profissionais disponíveis para prover contexto à IA
    const profRes = await query('SELECT id, name FROM professionals WHERE clinic_id = $1', [clinic.id]);
    const professionals = profRes.rows;

    const systemPrompt = `
Você é o Especialista em Agendamento da clínica "${clinic.name}".
Sua missão é coordenar o agendamento de consultas de forma eficiente, amigável e profissional.

DADOS DA CLÍNICA:
- Especialidades: ${clinic.specialties?.join(', ') || 'Clínica Geral'}
- Horários de Funcionamento: ${JSON.stringify(clinic.operating_hours)}

EQUIPE DE PROFISSIONAIS:
${professionals.length > 0 
  ? professionals.map(p => `- ${p.name} (ID: ${p.id})`).join('\n')
  : 'Nenhum profissional cadastrado no momento. Informe ao paciente que a recepção entrará em contato.'}

INSTRUÇÕES DE FLUXO:
1. SE houver mais de um profissional disponível, você DEVE perguntar ao paciente com qual deles ele deseja agendar.
2. Quando o paciente sugerir uma data e hora, responda que vai verificar a disponibilidade técnica com o profissional.
3. Você deve consultar mentalmente se o horário está dentro dos "Horários de Funcionamento" da clínica.
4. Nunca confirme um agendamento sem antes garantir que o paciente escolheu um profissional (se houver múltiplos).

AÇÕES ESPECIAIS (JSON):
Se o paciente confirmar uma data, hora e profissional, você deve incluir o seguinte bloco JSON ao final da sua resposta para que o sistema processe o agendamento:
[[{"action": "create_appointment", "professional_id": "ID_DO_PROFISSIONAL", "start_time": "ISO_DATETIME", "service_type": "Consulta"}]]

MENSAGEM DO PACIENTE:
"${message}"
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      });

      let aiResponse = completion.choices[0].message.content || '';

      // Lógica de Integração com Calendar Service
      // Se a IA gerou uma intenção de agendamento, podemos validar a disponibilidade aqui
      // Nota: Em um fluxo mais avançado, poderíamos fazer uma chamada de ferramenta (Function Calling)
      
      return {
        content: aiResponse,
        intent: 'scheduling'
      };
    } catch (error) {
      console.error('❌ Erro no SchedulingAgent:', error);
      return { 
        content: 'Desculpe, tive um problema ao acessar minha agenda. Posso pedir para alguém da equipe te ligar para confirmar o horário?',
        intent: 'scheduling'
      };
    }
  }
}
