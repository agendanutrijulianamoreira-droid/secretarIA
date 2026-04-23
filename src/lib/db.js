/**
 * SecretarIA — Camada de acesso ao Firestore
 * Todas as operações de banco passam por aqui.
 *
 * Estrutura de coleções:
 *   /clients/{clienteId}
 *   /clients/{clienteId}/contatos/{id}          — CRM 1: leads
 *   /clients/{clienteId}/pacientes/{id}          — CRM 2: pacientes ativos
 *   /clients/{clienteId}/whatsapp_numbers/{id}   — números WhatsApp conectados
 *   /clients/{clienteId}/servicos/{id}           — serviços e tabela de preços
 *   /clients/{clienteId}/vendas/{id}             — vendas registradas
 *   /clients/{clienteId}/campanhas/{id}          — campanhas de mensagem
 *   /clients/{clienteId}/ia_aprendizados/{id}    — o que a IA aprendeu
 *   /clients/{clienteId}/chat_messages/{id}      — histórico IA-lead
 *   /clients/{clienteId}/invoices/{id}           — cobranças do plano
 *   /clients/{clienteId}/portal_messages/{id}    — canal admin-cliente
 *   /clients/{clienteId}/agendamentos/{id}       — agendamentos
 *   /n8n_fluxos/{clienteId}                     — status fluxos n8n
 *   /tokens/{clienteId}                          — tokens API
 *   /alerts                                      — alertas de venda
 */

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment,
} from "firebase/firestore";
import { db } from "./firebase";

// ── helpers ────────────────────────────────────────────────────────────────
const col  = (...path) => collection(db, ...path);
const ref  = (...path) => doc(db, ...path);
const now  = () => serverTimestamp();
const toJS = (snap) => snap.exists() ? { id: snap.id, ...snap.data() } : null;
const listToJS = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() }));

// ── CLIENTES ───────────────────────────────────────────────────────────────
export const Clientes = {
  async list() {
    const snap = await getDocs(col("clients"));
    return listToJS(snap);
  },

  async get(id) {
    return toJS(await getDoc(ref("clients", id)));
  },

  async create(data) {
    const docRef = await addDoc(col("clients"), {
      ...data,
      status:     "setup",
      msgs_today:  0,
      msgs_month:  0,
      created_at:  now(),
      updated_at:  now(),
      email:       data.email || "",
    });
    return docRef.id;
  },

  async update(id, data) {
    await updateDoc(ref("clients", id), { ...data, updated_at: now() });
  },

  async updateBriefing(id, briefing, plan) {
    await updateDoc(ref("clients", id), { briefing, plan, updated_at: now() });
  },

  onList(callback) {
    return onSnapshot(col("clients"), snap => callback(listToJS(snap)));
  },
};

// ── CONTATOS (CRM 1 — Leads) ──────────────────────────────────────────────
export const Contatos = {
  _col: (clienteId) => col("clients", clienteId, "contatos"),

  async get(clienteId, telefone) {
    const q = query(this._col(clienteId), where("telefone", "==", telefone));
    const snap = await getDocs(q);
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  async upsert(clienteId, telefone, nome) {
    const existing = await this.get(clienteId, telefone);
    if (existing) return existing;
    const docRef = await addDoc(this._col(clienteId), {
      telefone, nome,
      atendimento_ia:    "ativo",
      ia_nome:           "",         // nome customizado da IA para este lead
      crm_status:        "novo",
      crm_notes:         "",
      ultima_interacao:  now(),
      total_mensagens:   0,
      created_at:        now(),
    });
    return docRef.id;
  },

  async setPause(clienteId, contatoId, paused) {
    await updateDoc(ref("clients", clienteId, "contatos", contatoId), {
      atendimento_ia: paused ? "pausado" : "ativo",
      updated_at: now(),
    });
  },

  async updateCRM(clienteId, contatoId, data) {
    await updateDoc(ref("clients", clienteId, "contatos", contatoId), {
      ...data,
      updated_at: now(),
    });
  },

  async convertToPaciente(clienteId, contatoId) {
    const contato = toJS(await getDoc(ref("clients", clienteId, "contatos", contatoId)));
    if (!contato) return;
    await Pacientes.create(clienteId, {
      nome: contato.nome,
      telefone: contato.telefone,
      origem: "lead_convertido",
      contato_id: contatoId,
    });
    await updateDoc(ref("clients", clienteId, "contatos", contatoId), {
      crm_status: "convertido",
      updated_at: now(),
    });
  },

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("ultima_interacao", "desc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("ultima_interacao", "desc"));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── PACIENTES (CRM 2 — Pacientes Ativos) ─────────────────────────────────
export const Pacientes = {
  _col: (clienteId) => col("clients", clienteId, "pacientes"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async get(clienteId, pacienteId) {
    return toJS(await getDoc(ref("clients", clienteId, "pacientes", pacienteId)));
  },

  async create(clienteId, data) {
    const docRef = await addDoc(this._col(clienteId), {
      nome: "",
      telefone: "",
      email: "",
      data_nascimento: "",
      observacoes: "",
      ativo: true,
      origem: "manual",
      contato_id: null,
      created_at: now(),
      updated_at: now(),
      ...data,
    });
    return docRef.id;
  },

  async update(clienteId, pacienteId, data) {
    await updateDoc(ref("clients", clienteId, "pacientes", pacienteId), {
      ...data,
      updated_at: now(),
    });
  },

  async delete(clienteId, pacienteId) {
    await deleteDoc(ref("clients", clienteId, "pacientes", pacienteId));
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── CAMPANHAS (mensagens automáticas para pacientes) ──────────────────────
export const Campanhas = {
  _col: (clienteId) => col("clients", clienteId, "campanhas"),

  TIPOS: {
    aniversario:           { label: "🎂 Aniversário",             cor: "#EC4899" },
    acompanhamento:        { label: "💊 Acompanhamento",           cor: "#6366F1" },
    lembrete_consulta:     { label: "📅 Lembrete de Consulta",    cor: "#0EA5E9" },
    oferta:                { label: "📣 Oferta / Promoção",        cor: "#F59E0B" },
    informativo:           { label: "📋 Informativo",              cor: "#8B5CF6" },
    checkin:               { label: "✅ Check-in",                 cor: "#10B981" },
    satisfacao:            { label: "⭐ Pesquisa de Satisfação",   cor: "#F97316" },
    boas_vindas:           { label: "👋 Boas-Vindas",              cor: "#2EB67D" },
  },

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async create(clienteId, data) {
    const docRef = await addDoc(this._col(clienteId), {
      tipo: "",
      titulo: "",
      mensagem: "",
      pacientes_alvo: [], // IDs dos pacientes ou "todos"
      status: "rascunho",  // rascunho | agendada | enviando | concluida | cancelada
      agendada_para: null,
      enviados: 0,
      falhas: 0,
      created_at: now(),
      updated_at: now(),
      ...data,
    });
    return docRef.id;
  },

  async update(clienteId, campanhaId, data) {
    await updateDoc(ref("clients", clienteId, "campanhas", campanhaId), {
      ...data,
      updated_at: now(),
    });
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── WHATSAPP NUMBERS ──────────────────────────────────────────────────────
export const WhatsAppNumbers = {
  _col: (clienteId) => col("clients", clienteId, "whatsapp_numbers"),

  async list(clienteId) {
    const snap = await getDocs(this._col(clienteId));
    return listToJS(snap);
  },

  async add(clienteId, data) {
    const docRef = await addDoc(this._col(clienteId), {
      numero: "",
      nome_display: "",     // nome do número (ex: "Atendimento Principal")
      ia_nome: "",          // nome da IA neste número (ex: "Ana")
      ia_funcao: "",        // função da IA (ex: "Recepcionista", "Comercial")
      status: "pendente",   // pendente | ativo | inativo | erro
      waba_id: "",          // WhatsApp Business Account ID
      phone_number_id: "",  // Phone Number ID da API Oficial
      cobrado_extra: false,
      created_at: now(),
      updated_at: now(),
      ...data,
    });
    return docRef.id;
  },

  async update(clienteId, numId, data) {
    await updateDoc(ref("clients", clienteId, "whatsapp_numbers", numId), {
      ...data,
      updated_at: now(),
    });
  },

  async delete(clienteId, numId) {
    await deleteDoc(ref("clients", clienteId, "whatsapp_numbers", numId));
  },

  onList(clienteId, callback) {
    return onSnapshot(this._col(clienteId), snap => callback(listToJS(snap)));
  },
};

// ── SERVIÇOS ──────────────────────────────────────────────────────────────
export const Servicos = {
  _col: (clienteId) => col("clients", clienteId, "servicos"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "asc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async create(clienteId, data) {
    const docRef = await addDoc(this._col(clienteId), {
      nome: "",
      descricao: "",
      preco: 0,
      duracao_minutos: 60,
      ativo: true,
      created_at: now(),
      updated_at: now(),
      ...data,
    });
    return docRef.id;
  },

  async update(clienteId, servicoId, data) {
    await updateDoc(ref("clients", clienteId, "servicos", servicoId), {
      ...data,
      updated_at: now(),
    });
  },

  async delete(clienteId, servicoId) {
    await deleteDoc(ref("clients", clienteId, "servicos", servicoId));
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("created_at", "asc"));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── VENDAS ────────────────────────────────────────────────────────────────
export const Vendas = {
  _col: (clienteId) => col("clients", clienteId, "vendas"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async create(clienteId, data) {
    const docRef = await addDoc(this._col(clienteId), {
      paciente_nome: "",
      paciente_id: null,
      servico_nome: "",
      servico_id: null,
      valor: 0,
      forma_pagamento: "",  // pix | cartao | dinheiro | boleto
      status: "pendente",   // pendente | confirmado | cancelado
      observacoes: "",
      created_at: now(),
      updated_at: now(),
      ...data,
    });
    return docRef.id;
  },

  async update(clienteId, vendaId, data) {
    await updateDoc(ref("clients", clienteId, "vendas", vendaId), {
      ...data,
      updated_at: now(),
    });
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── IA APRENDIZADOS ───────────────────────────────────────────────────────
export const IAAprendizados = {
  _col: (clienteId) => col("clients", clienteId, "ia_aprendizados"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"), limit(50));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async create(clienteId, data) {
    const docRef = await addDoc(this._col(clienteId), {
      tipo: "conversa",       // conversa | correcao | manual
      resumo: "",
      aprendizado: "",
      status: "pendente",     // pendente | aprovado | rejeitado
      telefone_origem: "",
      created_at: now(),
      ...data,
    });
    return docRef.id;
  },

  async aprovar(clienteId, id) {
    await updateDoc(ref("clients", clienteId, "ia_aprendizados", id), {
      status: "aprovado",
      aprovado_at: now(),
    });
  },

  async rejeitar(clienteId, id) {
    await updateDoc(ref("clients", clienteId, "ia_aprendizados", id), {
      status: "rejeitado",
    });
  },

  async corrigir(clienteId, id, novoAprendizado) {
    await updateDoc(ref("clients", clienteId, "ia_aprendizados", id), {
      aprendizado: novoAprendizado,
      status: "aprovado",
      corrigido: true,
      updated_at: now(),
    });
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"), limit(50));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── CHAT MESSAGES ──────────────────────────────────────────────────────────
export const ChatMessages = {
  _col: (clienteId) => col("clients", clienteId, "chat_messages"),

  async add(clienteId, data) {
    await addDoc(this._col(clienteId), { ...data, created_at: now() });
    await updateDoc(ref("clients", clienteId), {
      msgs_today: increment(1),
      msgs_month: increment(1),
    });
  },

  async list(clienteId, telefone, limitN = 50) {
    const q = query(
      this._col(clienteId),
      where("telefone", "==", telefone),
      orderBy("created_at", "desc"),
      limit(limitN)
    );
    const snap = await getDocs(q);
    return listToJS(snap).reverse();
  },

  onList(clienteId, telefone, callback) {
    const q = query(
      this._col(clienteId),
      where("telefone", "==", telefone),
      orderBy("created_at", "asc"),
      limit(100)
    );
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },

  onListAll(clienteId, callback) {
    const q = query(
      this._col(clienteId),
      orderBy("created_at", "desc"),
      limit(100)
    );
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── INVOICES ───────────────────────────────────────────────────────────────
export const Invoices = {
  _col: (clienteId) => col("clients", clienteId, "invoices"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async add(clienteId, data) {
    return await addDoc(this._col(clienteId), { ...data, created_at: now() });
  },

  async updateStatus(clienteId, invoiceId, status) {
    await updateDoc(ref("clients", clienteId, "invoices", invoiceId), {
      status,
      paid_at: status === "pago" ? now() : null,
    });
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },
};

// ── PORTAL MESSAGES ────────────────────────────────────────────────────────
export const PortalMessages = {
  _col: (clienteId) => col("clients", clienteId, "portal_messages"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "asc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async send(clienteId, text, from_role = "client") {
    return await addDoc(this._col(clienteId), {
      text, from_role, read: false, created_at: now(),
    });
  },

  onList(clienteId, callback) {
    const q = query(this._col(clienteId), orderBy("created_at", "asc"));
    return onSnapshot(q, snap => callback(listToJS(snap)));
  },

  async markRead(clienteId, msgId) {
    await updateDoc(ref("clients", clienteId, "portal_messages", msgId), { read: true });
  },
};

// ── AGENDAMENTOS ───────────────────────────────────────────────────────────
export const Agendamentos = {
  _col: (clienteId) => col("clients", clienteId, "agendamentos"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("data_inicio", "asc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async add(clienteId, data) {
    return await addDoc(this._col(clienteId), { ...data, created_at: now() });
  },
};

// ── N8N FLUXOS ─────────────────────────────────────────────────────────────
export const N8nFluxos = {
  async get(clienteId) {
    return toJS(await getDoc(ref("n8n_fluxos", clienteId)));
  },

  async update(clienteId, data) {
    const docRef = ref("n8n_fluxos", clienteId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, { ...data, updated_at: now() });
    } else {
      const { setDoc } = await import("firebase/firestore");
      await setDoc(docRef, { ...data, created_at: now(), updated_at: now() });
    }
  },

  onList(callback) {
    return onSnapshot(col("n8n_fluxos"), snap => callback(listToJS(snap)));
  },
};

// ── TOKENS ─────────────────────────────────────────────────────────────────
export const Tokens = {
  async get(clienteId) {
    return toJS(await getDoc(ref("tokens", clienteId)));
  },

  async update(clienteId, data) {
    const docRef = ref("tokens", clienteId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      await updateDoc(docRef, { ...data, updated_at: now() });
    } else {
      const { setDoc } = await import("firebase/firestore");
      await setDoc(docRef, {
        openai_key: "",
        waba_token: "",
        waba_verify_token: "",
        ...data,
        created_at: now(),
        updated_at: now(),
      });
    }
  },

  onList(callback) {
    return onSnapshot(col("tokens"), snap => callback(listToJS(snap)));
  },
};

// ── ALERTS (Notificações) ──────────────────────────────────────────────────
export const Alerts = {
  onList(cb) {
    const q = query(col("alerts"), orderBy("created_at", "desc"), limit(20));
    return onSnapshot(q, (snap) => cb(listToJS(snap)), err => {
      console.error("Alerts onList error:", err);
      cb([]);
    });
  },
  async markRead(id) {
    await updateDoc(ref("alerts", id), { read: true });
  }
};
