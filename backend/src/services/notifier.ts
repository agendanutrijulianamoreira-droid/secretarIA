import { whatsappService } from './whatsapp.js';
import { ClinicContext } from '../agents/types.js';

export async function notifyHandoff(
  clinic: ClinicContext, 
  patientPhone: string, 
  patientName: string
) {
  if (!clinic.receptionist_phone) {
    console.warn(`⚠️ Clínica ${clinic.name} não tem telefone de recepcionista configurado.`);
    return;
  }

  const message = `⚠️ *SOLICITAÇÃO DE ATENDIMENTO HUMANO*\n\nPaciente: ${patientName} (${patientPhone})\nClínica: ${clinic.name}\n\nO paciente solicitou falar com um atendente ou o caso exige intervenção humana. Por favor, assuma o atendimento.`;

  // Usamos o número da clínica para enviar a notificação para a recepcionista
  // Nota: A recepcionista deve ter o número da clínica salvo para receber.
  // fromPhoneNumberId deve vir da configuração da clínica se for dinâmico
  const fromPhoneNumberId = clinic.config_json?.whatsapp_phone_number_id;

  if (!fromPhoneNumberId) {
    console.error(`❌ Phone Number ID não configurado para a clínica ${clinic.name}`);
    return;
  }

  await whatsappService.sendMessage(clinic.receptionist_phone, message, fromPhoneNumberId);
  console.log(`📢 Recepcionista da clínica ${clinic.name} notificada.`);
}
