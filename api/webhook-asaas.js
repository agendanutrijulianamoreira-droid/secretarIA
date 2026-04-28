import { db, auth } from "./_lib/firebase.js";
import { handleCors } from "./_lib/cors.js";
import { sendPasswordResetEmail } from "./_lib/email.js";

const VALUE_TO_PLAN = { 197: "Starter", 497: "Pro", 997: "Enterprise" };

function detectPlan(value) {
  return VALUE_TO_PLAN[Math.round(Number(value))] || "Pro";
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const receivedToken = req.headers["asaas-access-token"];
  if (!expectedToken || !receivedToken || receivedToken !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { event, payment } = req.body;

    if (event !== "PAYMENT_CONFIRMED" && event !== "PAYMENT_RECEIVED") {
      return res.status(200).json({ received: true, ignored: true });
    }

    const now = new Date().toISOString();
    const clientEmail = (payment.customerEmail || payment.email || "").trim().toLowerCase();
    const clientName  = payment.customerName || payment.name || "Cliente";
    const clientPhone = payment.customerPhone || payment.phone || "";
    const plan        = payment.externalReference
      ? payment.externalReference.charAt(0).toUpperCase() + payment.externalReference.slice(1)
      : detectPlan(payment.value);

    if (!clientEmail) {
      return res.status(200).json({ received: true, error: "no_email" });
    }

    // Já existe?
    const existing = await db.collection("clients").where("email", "==", clientEmail).get();
    if (!existing.empty) {
      return res.status(200).json({ received: true, already_exists: true });
    }

    // 1. Criar user no Firebase Auth (sem senha — o cliente define via reset)
    let userRecord;
    try {
      userRecord = await auth.createUser({ email: clientEmail, displayName: clientName });
    } catch (e) {
      if (e.code === "auth/email-already-exists") {
        userRecord = await auth.getUserByEmail(clientEmail);
      } else throw e;
    }

    // 2. Criar /clients/{id}
    const clientRef = await db.collection("clients").add({
      name: clientName, phone: clientPhone, email: clientEmail,
      plan, status: "onboarding", msgs_today: 0, msgs_month: 0,
      capabilities: ["text", "audio"], n8n_status: "pending",
      briefing: {}, source: "asaas_checkout", payment_id: payment.id,
      uid: userRecord.uid, created_at: now, updated_at: now,
    });

    // 3. Criar /users/{uid}
    await db.collection("users").doc(userRecord.uid).set({
      role: "client", client_id: clientRef.id,
      email: clientEmail, name: clientName, plan, created_at: now,
    });

    // 4. Alerta pro admin
    await db.collection("alerts").add({
      type: "SALE", title: "Nova Venda + Conta Criada! 🎉",
      message: `${clientName} assinou ${plan} (R$${payment.value}). Conta provisionada.`,
      data: { email: clientEmail, phone: clientPhone, value: payment.value, paymentId: payment.id, clientId: clientRef.id, plan },
      read: false, created_at: now,
    });

    // 5. Enviar e-mail de definição de senha (Firebase Auth)
    await sendPasswordResetEmail(clientEmail);

    console.log(`✅ ${clientEmail} → ${plan} → uid:${userRecord.uid}`);
    return res.status(200).json({ received: true, provisioned: true, clientId: clientRef.id });

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
