/**
 * SecretarIA — Camada de acesso ao Firestore
 * Todas as operações de banco passam por aqui.
 *
 * Estrutura de coleções:
 *   /clients/{clienteId}
 *   /clients/{clienteId}/contatos/{telefone}
 *   /clients/{clienteId}/chat_messages/{msgId}
 *   /clients/{clienteId}/invoices/{invoiceId}
 *   /clients/{clienteId}/portal_messages/{msgId}
 *   /clients/{clienteId}/agendamentos/{agendId}
 */

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
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
      email:       data.email || "", // E-mail para acesso ao portal
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

// ── CONTATOS ───────────────────────────────────────────────────────────────
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
      crm_status:        "novo",
      crm_notes:         "",
      ultima_interacao:  now(),
      total_mensagens:   0,
      created_at:        now(),
    });
    return docRef.id;
  },

  async setPause(clienteId, telefone, paused) {
    const contato = await this.get(clienteId, telefone);
    if (contato) {
      await updateDoc(ref("clients", clienteId, "contatos", contato.id), {
        atendimento_ia: paused ? "pause" : "ativo",
      });
    }
  },

  async updateCRM(clienteId, contatoId, data) {
    await updateDoc(ref("clients", clienteId, "contatos", contatoId), {
      ...data,
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

// ── CHAT MESSAGES ──────────────────────────────────────────────────────────
export const ChatMessages = {
  _col: (clienteId) => col("clients", clienteId, "chat_messages"),

  async add(clienteId, data) {
    await addDoc(this._col(clienteId), { ...data, created_at: now() });
    // incrementa contador no cliente
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
