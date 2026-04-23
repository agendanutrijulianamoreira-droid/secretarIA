import { db } from "./_lib/firebase.js";
import { handleCors } from "./_lib/cors.js";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const receivedToken = req.headers["asaas-access-token"];
  if (!expectedToken || !receivedToken || receivedToken !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { event, payment } = req.body;

    // Apenas intercepta o evento de pagamento confirmado
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const now = new Date().toISOString();
      const clientEmail = payment.customerEmail || payment.email || "";
      const clientName = payment.customerName || payment.name || "Cliente Asaas";
      const clientPhone = payment.customerPhone || payment.phone || "";

      // 1. Registrar Alerta no Dashboard Admin
      await db.collection("alerts").add({
        type: "SALE",
        title: "Nova Venda Aprovada! 🎉",
        message: `${clientName} acabou de assinar o plano. Valor: R$${payment.value}`,
        data: {
          email: clientEmail,
          phone: clientPhone,
          value: payment.value,
          paymentId: payment.id,
        },
        read: false,
        created_at: now,
      });

      // 2. Criar cliente provisionado na fila (setup_pending)
      // O admin precisará apenas clicar para gerar o acesso
      if (clientEmail) {
        // Verifica se o e-mail já existe
        const existing = await db.collection("clients").where("email", "==", clientEmail).get();
        if (existing.empty) {
          await db.collection("clients").add({
            name: clientName,
            phone: clientPhone,
            email: clientEmail,
            plan: "Pro", // Plano padrão ou mapeado pelo valor/subscription
            status: "setup", // Setup inicial
            msgs_today: 0,
            msgs_month: 0,
            capabilities: ["text", "audio"],
            n8n_status: "pending",
            created_at: now,
            updated_at: now,
            source: "asaas_checkout"
          });
        }
      }

      return res.status(200).json({ received: true });
    }

    // Outros eventos
    return res.status(200).json({ received: true, ignored: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
