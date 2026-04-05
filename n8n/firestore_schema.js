/**
 * SecretarIA — Estrutura de Coleções Firestore
 *
 * Execute no Firebase Console → Firestore → Rules
 * ou use como referência para criar os documentos iniciais.
 */

// ── ESTRUTURA ────────────────────────────────────────────────────────────────
//
// /clientes/{clienteId}
// /clientes/{clienteId}/contatos/{contatoId}
// /clientes/{clienteId}/chat_messages/{msgId}
// /clientes/{clienteId}/invoices/{invoiceId}
// /clientes/{clienteId}/portal_messages/{msgId}
// /clientes/{clienteId}/agendamentos/{agendId}
//

// ── EXEMPLO DE DOCUMENTO: clientes/{id} ──────────────────────────────────────
const exemploCliente = {
  // Identificação
  name:              "Clínica Bella Saúde",
  phone:             "+55 11 9 9999-0001",
  avatar:            "BS",
  color:             "#6366F1",

  // Plano & status
  plan:              "Pro",           // Starter | Pro | Enterprise
  status:            "active",        // active | paused | setup

  // Meta WhatsApp Official API
  waba_id:           "123456789",     // WhatsApp Business Account ID
  phone_number_id:   "987654321",     // ID do número no Meta
  meta_token:        "EAAx...",       // Token permanente da Meta API

  // n8n
  n8n_url:           "https://n8n.seudominio.com/webhook/abc123",
  n8n_status:        "online",        // online | offline | pending

  // Google Calendar
  calendar_email:    "agenda@clinica.com",

  // Capacidades ativas
  capabilities:      ["text", "audio", "image", "file"],

  // Briefing completo (gerado pelo Briefing Wizard)
  briefing: {
    segment:          "Saúde / Clínica",
    description:      "Clínica de saúde integrativa com foco em medicina preventiva.",
    site:             "bellasaude.com.br",
    instagram:        "@clinicabellasaude",
    ai_name:          "Ana",
    ai_tone:          "Acolhedora e profissional",
    ai_goal:          "Agendamentos",
    business_hours:   "Seg–Sex 8h–18h | Sáb 8h–12h",
    escalation_trigger: "Urgências, exames de alto custo, reclamações",
    escalation_number:  "+55 11 9 8888-0000",
    services: [
      { name: "Consulta Clínica Geral", price: "R$ 180" },
      { name: "Consulta Nutricional",   price: "R$ 220" },
    ],
    faqs: [
      { q: "Vocês atendem convênios?", a: "Atendemos Unimed e Bradesco Saúde." },
    ],
    restrictions: "Nunca confirmar diagnóstico. Não citar concorrentes.",
    promotions:   "10% off em check-up para novos pacientes em abril.",
  },

  // Métricas (atualizadas por trigger no app ou Cloud Function)
  msgs_today:  0,
  msgs_month:  0,

  // Timestamps
  created_at:  "Timestamp",
  updated_at:  "Timestamp",
};

// ── EXEMPLO: clientes/{id}/contatos/{contatoId} ───────────────────────────────
const exemploContato = {
  telefone:          "5511999990001",
  nome:              "Maria Silva",
  email:             null,
  atendimento_ia:    "ativo",         // ativo | pause
  ultima_interacao:  "Timestamp",
  total_mensagens:   42,
  tags:              [],
  created_at:        "Timestamp",
};

// ── EXEMPLO: clientes/{id}/chat_messages/{msgId} ──────────────────────────────
const exemploMensagem = {
  telefone:    "5511999990001",
  papel:       "user",              // user | assistant | system
  mensagem:    "Olá, quero agendar uma consulta",
  resposta:    "Olá! Posso te ajudar com o agendamento...",
  agent_name:  "Ana",
  tipo_msg:    "text",              // text | audio | image | document
  wamid:       "wamid.xxxxx",
  escalado:    false,
  created_at:  "Timestamp",
};

// ── EXEMPLO: clientes/{id}/invoices/{invoiceId} ───────────────────────────────
const exemploInvoice = {
  asaas_id:     "pay_xxxxx",
  descricao:    "Mensalidade Abril/2026",
  amount:       397.00,
  status:       "pendente",           // pago | pendente | vencido | cancelado
  due_date:     "2026-04-05",
  payment_link: "https://www.asaas.com/c/xxxxx",
  paid_at:      null,
  created_at:   "Timestamp",
};

// ── EXEMPLO: clientes/{id}/portal_messages/{msgId} ────────────────────────────
const exemploPortalMsg = {
  from_role:  "client",             // client | admin
  text:       "Preciso adicionar um número de transferência novo.",
  read:       false,
  created_at: "Timestamp",
};

// ── REGRAS DE SEGURANÇA (Firebase Console → Firestore → Rules) ────────────────
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admin (você) — acesso total via service account (n8n, server)
    // Autenticação via Firebase Admin SDK bypassa estas regras

    // Clientes — leitura/escrita só para admins autenticados
    match /clientes/{clienteId} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;

      // Sub-coleções — cliente autenticado acessa só os próprios dados
      match /contatos/{doc} {
        allow read, write: if request.auth != null;
      }
      match /chat_messages/{doc} {
        allow read: if request.auth != null;
        allow write: if false; // só o n8n escreve (via Admin SDK)
      }
      match /invoices/{doc} {
        allow read: if request.auth != null;
        allow write: if false; // só o backend escreve
      }
      match /portal_messages/{doc} {
        allow read, write: if request.auth != null;
      }
      match /agendamentos/{doc} {
        allow read: if request.auth != null;
        allow write: if false; // só o n8n (Google Calendar tool)
      }
    }
  }
}
`;

// ── ÍNDICES COMPOSTOS (Firebase Console → Firestore → Indexes) ───────────────
const indicesNecessarios = [
  {
    collection: "chat_messages",
    fields: [
      { field: "telefone",   order: "ASCENDING"  },
      { field: "created_at", order: "DESCENDING" },
    ],
  },
  {
    collection: "portal_messages",
    fields: [
      { field: "read",       order: "ASCENDING" },
      { field: "created_at", order: "ASCENDING" },
    ],
  },
];

module.exports = { exemploCliente, exemploContato, exemploMensagem,
  exemploInvoice, exemploPortalMsg, firestoreRules, indicesNecessarios };
