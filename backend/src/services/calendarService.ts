import { google } from 'googleapis';
import { query } from '../lib/db.js';

/**
 * Serviço de integração com Google Calendar e gestão de agenda local.
 * Utiliza Service Account para autenticação.
 */

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Configuração da autenticação via JWT (Service Account)
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  SCOPES
);

const calendar = google.calendar({ version: 'v3', auth });

export const calendarService = {
  /**
   * Cria um agendamento no banco local e sincroniza com o Google Calendar do profissional.
   */
  async createAppointment(data: {
    clinic_id: string;
    professional_id: string;
    patient_id: string;
    patient_name: string;
    start_time: string;
    end_time: string;
    service_type: string;
  }) {
    // 1. Buscar o e-mail do calendário do profissional
    const profRes = await query('SELECT google_calendar_email FROM professionals WHERE id = $1', [data.professional_id]);
    const calendarId = profRes.rows[0]?.google_calendar_email;

    if (!calendarId) {
      throw new Error('Profissional não possui um Google Calendar configurado.');
    }

    // 2. Criar evento no Google Calendar
    const event = {
      summary: `Agendamento: ${data.patient_name} (${data.service_type})`,
      description: `Agendamento via SecretarIA para o paciente ${data.patient_name}`,
      start: { dateTime: data.start_time },
      end: { dateTime: data.end_time },
      status: 'confirmed'
    };

    try {
      const googleEvent = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      // 3. Salvar no banco de dados local
      const res = await query(
        `INSERT INTO appointments (clinic_id, professional_id, patient_id, google_event_id, start_time, end_time, status, service_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [data.clinic_id, data.professional_id, data.patient_id, googleEvent.data.id, data.start_time, data.end_time, 'scheduled', data.service_type]
      );

      return res.rows[0];
    } catch (error: any) {
      console.error('Erro ao criar agendamento no Google Calendar:', error);
      throw new Error(`Falha na sincronização com Google: ${error.message}`);
    }
  },

  /**
   * Cancela um agendamento localmente e remove do Google Calendar.
   */
  async cancelAppointment(appointmentId: string) {
    // 1. Buscar detalhes do agendamento e do profissional
    const res = await query(
      `SELECT a.*, p.google_calendar_email 
       FROM appointments a 
       JOIN professionals p ON a.professional_id = p.id 
       WHERE a.id = $1`, 
      [appointmentId]
    );
    const appointment = res.rows[0];

    if (!appointment) {
      throw new Error('Agendamento não encontrado.');
    }

    // 2. Remover do Google Calendar se houver um event_id
    if (appointment.google_event_id) {
      try {
        await calendar.events.delete({
          calendarId: appointment.google_calendar_email,
          eventId: appointment.google_event_id,
        });
      } catch (error) {
        console.warn('Aviso: Não foi possível deletar no Google Calendar (pode já ter sido removido).', error);
      }
    }

    // 3. Atualizar status local para 'cancelled'
    await query('UPDATE appointments SET status = $1 WHERE id = $2', ['cancelled', appointmentId]);
    
    return { success: true };
  },

  /**
   * Verifica a disponibilidade de um profissional cruzando dados locais e do Google (FreeBusy).
   */
  async checkAvailability(professionalId: string, date: string) {
    // 1. Buscar e-mail do calendário e horários de funcionamento da clínica
    const res = await query(
      `SELECT p.google_calendar_email, c.operating_hours 
       FROM professionals p 
       JOIN clinics c ON p.clinic_id = c.id 
       WHERE p.id = $1`, 
      [professionalId]
    );
    
    if (res.rows.length === 0) {
      throw new Error('Profissional ou clínica não encontrados.');
    }

    const { google_calendar_email, operating_hours } = res.rows[0];

    // 2. Definir o intervalo de tempo para a consulta (o dia todo)
    const timeMin = new Date(date);
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(date);
    timeMax.setHours(23, 59, 59, 999);

    // 3. Consultar a API FreeBusy do Google
    try {
      const freeBusy = await calendar.freebusy.query({
        requestBody: {
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: google_calendar_email }],
        },
      });

      const busySlots = freeBusy.data.calendars?.[google_calendar_email]?.busy || [];

      // Retornamos os horários ocupados e as regras da clínica para o Agente decidir
      return {
        date,
        professional_id: professionalId,
        operating_hours,
        busy_slots: busySlots.map((slot: any) => ({
          start: slot.start,
          end: slot.end
        }))
      };
    } catch (error: any) {
      console.error('Erro ao consultar FreeBusy:', error);
      throw new Error('Falha ao verificar disponibilidade no Google.');
    }
  }
};
