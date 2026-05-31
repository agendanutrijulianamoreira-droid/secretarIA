import OpenAI from 'openai';
import { ClinicContext, PatientContext, ChatMessage, AgentResponse } from './types.js';
import { calendarService } from '../services/calendarService.js';
import { query } from '../lib/db.js';

export class SchedulingAgent {
  private get openai() {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async handle(
    message: string,
    clinic: ClinicContext,
    patient: PatientContext,
    history: ChatMessage[]
  ): Promise<AgentResponse> {

    // Buscar profissionais cadastrados
    const profRes = await query(
      'SELECT id, name FROM professionals WHERE client_id = $1 AND ativo = TRUE',
      [clinic.id]
    );
    const professionals: { id: string; name: string }[] = profRes.rows;

    // Verificar se há data/hora mencionada na mensagem para checar disponibilidade real
    let availabilityContext = '';
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/;
    const dateMatch = message.match(datePattern);

    if (dateMatch && professionals.length > 0) {
      try {
        const day   = dateMatch[1].padStart(2, '0');
        const month = dateMatch[2].padStart(2, '0');
        const year  = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : new Date().getFullYear().toString();
        const dateStr = `${year}-${month}-${day}`;

        // Checa disponibilidade do primeiro profissional (ou do único)
        const targetProfessional = professionals[0];
        const availability = await calendarService.checkAvailability(targetProfessional.id, dateStr);

        const busyFormatted = availability.busy_slots.map((s: any) => {
          const start = new Date(s.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const end   = new Date(s.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          return `${start}–${end}`;
        }).join(', ');

        availabilityContext = busyFormatted
          ? `\nCONSULTA DE AGENDA PARA ${day}/${month}:\nHorários JÁ OCUPADOS: ${busyFormatted}\nApenas ofereça horários FORA desses blocos.`
          : `\nCONSULTA DE AGENDA PARA ${day}/${month}:\nAgenda completamente LIVRE nesse dia.`;
      } catch {
        // Calendário não configurado — segue sem contexto de disponibilidade
      }
    }

    const systemPrompt = `
Você é a Especialista em Agendamento da clínica "${clinic.name}".
Coordene o agendamento de consultas de forma eficiente e profissional.

CLÍNICA:
${clinic.prompt_context}
Horários de funcionamento: ${clinic.operating_hours}
${availabilityContext}

PROFISSIONAIS DISPONÍVEIS:
${professionals.length > 0
  ? professionals.map(p => `- ${p.name} (ID: ${p.id})`).join('\n')
  : 'Nenhum profissional cadastrado. Informe que a recepção entrará em contato.'}

REGRAS:
1. Se houver mais de um profissional, pergunte com qual o paciente quer agendar.
2. Nunca ofereça horários que estejam nos blocos OCUPADOS acima.
3. Proponha sempre dois horários alternativos — nunca pergunte "qual prefere?" abertamente.
4. Ao confirmar: profissional + data + hora devem estar definidos.
5. Quando tudo estiver confirmado, inclua o bloco JSON ao final da mensagem:
[[{"action":"create_appointment","professional_id":"ID","start_time":"ISO_DATETIME","service_type":"Consulta"}]]
`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ]
      });

      const aiResponse = completion.choices[0].message.content || '';

      return { content: aiResponse, intent: 'scheduling' };
    } catch (error) {
      console.error('❌ Erro no SchedulingAgent:', error);
      return {
        content: 'Tive um problema ao verificar a agenda. Posso pedir para alguém da equipe te ligar para confirmar o horário?',
        intent: 'scheduling'
      };
    }
  }
}
