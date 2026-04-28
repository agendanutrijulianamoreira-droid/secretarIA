import { Router } from 'express';
import { query } from '../lib/db.js';

const router = Router();

router.post('/', async (req, res) => {
  // Verifica token de segurança do Asaas
  const asaasToken = req.headers['asaas-access-token'];
  if (asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, payment } = req.body;

  console.log(`💰 Webhook Asaas: Evento ${event} para o pagamento ${payment.id}`);

  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    try {
      // Aqui você pode atualizar o status da clínica ou disparar uma mensagem de boas-vindas
      // Exemplo: Buscar clínica pelo e-mail do cliente ou ID externo
      console.log(`✅ Pagamento confirmado para ${payment.customerName}`);
      
      // TODO: Implementar lógica de ativação/notificação
    } catch (error) {
      console.error('❌ Erro no Webhook Asaas:', error);
    }
  }

  res.status(200).json({ received: true });
});

export default router;
