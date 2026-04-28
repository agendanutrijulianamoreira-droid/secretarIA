import cron from 'node-cron';
import { query } from '../lib/db.js';
import { whatsappService } from './whatsapp.js';

export function initScheduler() {
  // Roda a cada minuto
  cron.schedule('* * * * *', async () => {
    console.log('⏰ Rodando job de lembretes...');

    try {
      // Buscar agendamentos para daqui a exatamente 24 horas (exemplo)
      // que ainda não enviaram lembrete
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowStart = new Date(tomorrow.setSeconds(0, 0));
      const tomorrowEnd = new Date(tomorrow.setSeconds(59, 999));

      const appointmentsResult = await query(
        `SELECT a.*, p.phone as patient_phone, p.name as patient_name, c.name as clinic_name, c.config_json
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN clinics c ON a.clinic_id = c.id
         WHERE a.start_time BETWEEN $1 AND $2 
         AND a.status = 'scheduled' 
         AND a.reminder_sent = FALSE`,
        [tomorrowStart, tomorrowEnd]
      );

      for (const appt of appointmentsResult.rows) {
        const message = `Olá ${appt.patient_name}! Passando para lembrar da sua consulta na ${appt.clinic_name} amanhã às ${new Date(appt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Podemos confirmar?`;
        
        const fromPhoneNumberId = appt.config_json?.whatsapp_phone_number_id;
        
        if (fromPhoneNumberId) {
          await whatsappService.sendMessage(appt.patient_phone, message, fromPhoneNumberId);
          
          // Marcar como enviado
          await query('UPDATE appointments SET reminder_sent = TRUE WHERE id = $1', [appt.id]);
          console.log(`✅ Lembrete enviado para ${appt.patient_phone}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro no Job de Lembretes:', error);
    }
  });
}
