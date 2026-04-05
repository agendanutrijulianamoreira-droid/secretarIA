/**
 * SecretarIA — Camada de acesso ao Firestore
 * Todas as operações de banco passam por aqui.
 *
 * Estrutura de coleções:
 *   /clientes/{clienteId}
 *   /clientes/{clienteId}/contatos/{telefone}
 *   /clientes/{clienteId}/chat_messages/{msgId}
 *   /clientes/{clienteId}/invoices/{invoiceId}
 *   /clientes/{clienteId}/portal_messages/{msgId}
 *   /clientes/{clienteId}/agendamentos/{agendId}
 */

import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment, Timestamp,
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
    const snap = await getDocs(col("clientes"));
    return listToJS(snap);
  },

  async get(id) {
    return toJS(await getDoc(ref("clientes", id)));
  },

  async create(data) {
    const docRef = await addDoc(col("clientes"), {
      ...data,
      status:     "setup",
      msgs_today:  0,
      msgs_month:  0,
      created_at:  now(),
      updated_at:  now(),
    });
    return docRef.id;
  },

  async update(id, data) {
    await updateDoc(ref("clientes", id), { ...data, updated_at: now() });
  },

  async updateBriefing(id, briefing, plan) {
    await updateDoc(ref("clientes", id), { briefing, plan, updated_at: now() });
  },

  onList(callback) {
    return onSnapshot(col("clientes"), snap => callback(listToJS(snap)));
  },
};

// ── CONTATOS ───────────────────────────────────────────────────────────────
export const Contatos = {
  _col: (clienteId) => col("clientes", clienteId, "contatos"),

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
      ultima_interacao:  now(),
      total_mensagens:   0,
      created_at:        now(),
    });
    return docRef.id;
  },

  async setPause(clienteId, telefone, paused) {
    const contato = await this.get(clienteId, telefone);
    if (contato) {
      await updateDoc(ref("clientes", clienteId, "contatos", contato.id), {
        atendimento_ia: paused ? "pause" : "ativo",
      });
    }
  },

  async list(clienteId) {
    const snap = await getDocs(this._col(clienteId));
    return listToJS(snap);
  },
};

// ── CHAT MESSAGES ──────────────────────────────────────────────────────────
export const ChatMessages = {
  _col: (clienteId) => col("clientes", clienteId, "chat_messages"),

  async add(clienteId, data) {
    await addDoc(this._col(clienteId), { ...data, created_at: now() });
    // incrementa contador no cliente
    await updateDoc(ref("clientes", clienteId), {
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
  _col: (clienteId) => col("clientes", clienteId, "invoices"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async add(clienteId, data) {
    return await addDoc(this._col(clienteId), { ...data, created_at: now() });
  },

  async updateStatus(clienteId, invoiceId, status) {
    await updateDoc(ref("clientes", clienteId, "invoices", invoiceId), {
      status,
      paid_at: status === "pago" ? now() : null,
    });
  },
};

// ── PORTAL MESSAGES ────────────────────────────────────────────────────────
export const PortalMessages = {
  _col: (clienteId) => col("clientes", clienteId, "portal_messages"),

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
    await updateDoc(ref("clientes", clienteId, "portal_messages", msgId), { read: true });
  },
};

// ── AGENDAMENTOS ───────────────────────────────────────────────────────────
export const Agendamentos = {
  _col: (clienteId) => col("clientes", clienteId, "agendamentos"),

  async list(clienteId) {
    const q = query(this._col(clienteId), orderBy("data_inicio", "asc"));
    const snap = await getDocs(q);
    return listToJS(snap);
  },

  async add(clienteId, data) {
    return await addDoc(this._col(clienteId), { ...data, created_at: now() });
  },
};
