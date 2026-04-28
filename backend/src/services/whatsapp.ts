import axios from 'axios';

export class WhatsAppService {
  private baseUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
  private accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  async sendMessage(to: string, text: string, fromPhoneNumberId: string) {
    if (!this.accessToken) {
      console.error('❌ WhatsApp Access Token não configurado');
      return;
    }

    try {
      const url = `${this.baseUrl}/${fromPhoneNumberId}/messages`;
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Mensagem enviada para ${to}: ${response.status}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();
