import { db, auth } from "./_lib/firebase.js";
import { handleCors } from "./_lib/cors.js";
import { sendWelcomeEmail } from "./_lib/email.js";
import crypto from "crypto";

// Mapa valor → plano
const VALUE_TO_PLAN = {
  197:  "Starter",
  497:  "Pro",
  997:  "Enterprise",
};

function generatePassword() {
  // Gera senha segura de 12 caracteres
  return crypto.randomBytes(6).toString("base64url").slice(0, 12);
}

function detectPlan(value) {
  const v = Math.round(Number(value));
  return VALUE_TO_PLAN[v] || "Pro";
}

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

    // Apenas intercepta pagamento confirmado
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      const now = new Date().toISOString();
      const clientEmail = (payment.customerEmail || payment.email || "").trim().toLowerCase();
      const clientName  = payment.customerName || payment.name || "Cliente";
      const clientPhone = payment.customerPhone || payment.phone || "";
      const plan        = detectPlan(payment.value);

      if (!clientEmail) {
        console.error("Webhook: e-mail do cliente ausente no payload");
        return res.status(200).json({ received: true, error: "no_email" });
      }

      // ── 1. Verificar se já existe ─────────────────────────────────────────
      const existing = await db.collection("clients").where("email", "==", clientEmail).get();
      if (!existing.empty) {
        console.log(`Cliente ${clientEmail} já existe. Ignorando duplicata.`);
        return res.status(200).json({ received: true, already_exists: true });
      }

      // ── 2. Criar usuário no Firebase Auth ─────────────────────────────────
      const password = generatePassword();
      let userRecord;
      try {
        userRecord = await auth.createUser({
          email: clientEmail,
          password,
          displayName: clientName,
        });
      } catch (authErr) {
        if (authErr.code === "auth/email-already-exists") {
          userRecord = await auth.getUserByEmail(clientEmail);
        } else {
          throw authErr;
        }
      }

      // ── 3. Criar documento /clients/{id} ──────────────────────────────────
      const clientRef = await db.collection("clients").add({
        name:         clientName,
        phone:        clientPhone,
        email:        clientEmail,
        plan,
        status:       "onboarding",   // NOVO: status de onboarding
        msgs_today:   0,
        msgs_month:   0,
        capabilities: ["text", "audio"],
        n8n_status:   "pending",
        briefing:     {},              // Será preenchido pelo OnboardingChat
        source:       "asaas_checkout",
        payment_id:   payment.id,
        uid:          userRecord.uid,
        created_at:   now,
        updated_at:   now,
      });

      // ── 4. Criar documento /users/{uid} (Role mapping) ────────────────────
      await db.collection("users").doc(userRecord.uid).set({
        role:      "client",
        client_id: clientRef.id,
        email:     clientEmail,
        name:      clientName,
        plan,
        created_at: now,
      });

      // ── 5. Registrar alerta no admin ──────────────────────────────────────
      await db.collection("alerts").add({
        type:    "SALE",
        title:   "Nova Venda + Conta Criada! 🎉",
        message: `${clientName} assinou o plano ${plan} (R$${payment.value}). Conta provisionada automaticamente.`,
        data: {
          email:     clientEmail,
          phone:     clientPhone,
          value:     payment.value,
          paymentId: payment.id,
          clientId:  clientRef.id,
          plan,
        },
        read:       false,
        created_at: now,
      });

      // ── 6. Enviar e-mail de boas-vindas ───────────────────────────────────
      await sendWelcomeEmail(clientEmail, clientName, password, plan);

      console.log(`✅ Cliente provisionado: ${clientEmail} (${plan}) → uid:${userRecord.uid} doc:${clientRef.id}`);
      return res.status(200).json({ received: true, provisioned: true, clientId: clientRef.id });
    }

    // Outros eventos do Asaas
    return res.status(200).json({ received: true, ignored: true });

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
