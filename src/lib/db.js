/**
 * SecretarIA — Camada de acesso ao Supabase
 * Substitui completamente o Firebase/Firestore.
 *
 * Tabelas principais:
 *   clients, contatos, pacientes, servicos, vendas,
 *   campanhas, ia_aprendizados, chat_messages,
 *   invoices, portal_messages, agendamentos,
 *   n8n_fluxos, tokens, alerts
 */

import { supabase } from "./supabase";

const now = () => new Date().toISOString();

// Helper: converte erro do Supabase em exceção legível
function check(error, label = "") {
  if (error) throw new Error(`[${label}] ${error.message}`);
}

// Helper: inscreve em mudanças de uma tabela e chama callback com dados frescos
function onTable(table, fetchFn, callback, filter = null) {
  const channelName = `${table}-${Math.random()}`;
  const ch = supabase.channel(channelName);

  const evt = { event: "*", schema: "public", table };
  if (filter) evt.filter = filter;

  ch.on("postgres_changes", evt, async () => {
    const data = await fetchFn();
    callback(data);
  }).subscribe();

  // Busca inicial
  fetchFn().then(callback);

  return () => supabase.removeChannel(ch);
}

// ── CLIENTES ───────────────────────────────────────────────────────────────
export const Clientes = {
  async list() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    check(error, "Clientes.list");
    return data || [];
  },

  async getByEmail(email) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    check(error, "Clientes.getByEmail");
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();
    check(error, "Clientes.get");
    return data;
  },

  async create(data) {
    const { data: row, error } = await supabase
      .from("clients")
      .insert({
        ...data,
        status:      data.status     || "setup",
        msgs_today:  0,
        msgs_month:  0,
        created_at:  now(),
        updated_at:  now(),
        email:       data.email || "",
      })
      .select("id")
      .single();
    check(error, "Clientes.create");
    return row.id;
  },

  async update(id, data) {
    const { error } = await supabase
      .from("clients")
      .update({ ...data, updated_at: now() })
      .eq("id", id);
    check(error, "Clientes.update");
  },

  async updateBriefing(id, briefing, plan) {
    const { error } = await supabase
      .from("clients")
      .update({ briefing, plan, updated_at: now() })
      .eq("id", id);
    check(error, "Clientes.updateBriefing");
  },

  onList(callback) {
    return onTable("clients", () => this.list(), callback);
  },

  onMyClient(email, callback) {
    return onTable(
      "clients",
      () => this.getByEmail(email),
      callback,
      `email=eq.${email}`
    );
  },
};

// ── CONTATOS (CRM 1 — Leads) ──────────────────────────────────────────────
export const Contatos = {
  async get(clienteId, telefone) {
    const { data, error } = await supabase
      .from("contatos")
      .select("*")
      .eq("client_id", clienteId)
      .eq("telefone", telefone)
      .maybeSingle();
    check(error, "Contatos.get");
    return data;
  },

  async upsert(clienteId, telefone, nome) {
    const existing = await this.get(clienteId, telefone);
    if (existing) return existing;
    const { data, error } = await supabase
      .from("contatos")
      .insert({
        client_id:        clienteId,
        telefone,
        nome,
        atendimento_ia:   "ativo",
        ia_nome:          "",
        crm_status:       "novo",
        crm_notes:        "",
        ultima_interacao: now(),
        total_mensagens:  0,
        created_at:       now(),
      })
      .select("id")
      .single();
    check(error, "Contatos.upsert");
    return data.id;
  },

  async setPause(clienteId, contatoId, paused) {
    const { error } = await supabase
      .from("contatos")
      .update({ atendimento_ia: paused ? "pausado" : "ativo", updated_at: now() })
      .eq("id", contatoId)
      .eq("client_id", clienteId);
    check(error, "Contatos.setPause");
  },

  async updateCRM(clienteId, contatoId, data) {
    const { error } = await supabase
      .from("contatos")
      .update({ ...data, updated_at: now() })
      .eq("id", contatoId)
      .eq("client_id", clienteId);
    check(error, "Contatos.updateCRM");
  },

  async convertToPaciente(clienteId, contatoId) {
    const { data: contato } = await supabase
      .from("contatos").select("*").eq("id", contatoId).single();
    if (!contato) return;
    await Pacientes.create(clienteId, {
      nome: contato.nome,
      telefone: contato.telefone,
      origem: "lead_convertido",
      contato_id: contatoId,
    });
    await this.updateCRM(clienteId, contatoId, { crm_status: "convertido" });
  },

  async list(clienteId) {
    const { data, error } = await supabase
      .from("contatos")
      .select("*")
      .eq("client_id", clienteId)
      .order("ultima_interacao", { ascending: false });
    check(error, "Contatos.list");
    return data || [];
  },

  onList(clienteId, callback) {
    return onTable(
      "contatos",
      () => this.list(clienteId),
      callback,
      `client_id=eq.${clienteId}`
    );
  },
};

// ── PACIENTES (CRM 2) ─────────────────────────────────────────────────────
export const Pacientes = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("client_id", clienteId)
      .order("created_at", { ascending: false });
    check(error, "Pacientes.list");
    return data || [];
  },

  async get(clienteId, pacienteId) {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .eq("id", pacienteId)
      .eq("client_id", clienteId)
      .single();
    check(error, "Pacientes.get");
    return data;
  },

  async create(clienteId, data) {
    const { data: row, error } = await supabase
      .from("pacientes")
      .insert({ client_id: clienteId, nome: "", telefone: "", email: "", data_nascimento: "", observacoes: "", ativo: true, origem: "manual", contato_id: null, created_at: now(), updated_at: now(), ...data })
      .select("id").single();
    check(error, "Pacientes.create");
    return row.id;
  },

  async update(clienteId, pacienteId, data) {
    const { error } = await supabase
      .from("pacientes")
      .update({ ...data, updated_at: now() })
      .eq("id", pacienteId).eq("client_id", clienteId);
    check(error, "Pacientes.update");
  },

  async delete(clienteId, pacienteId) {
    const { error } = await supabase
      .from("pacientes").delete()
      .eq("id", pacienteId).eq("client_id", clienteId);
    check(error, "Pacientes.delete");
  },

  onList(clienteId, callback) {
    return onTable("pacientes", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },
};

// ── CAMPANHAS ─────────────────────────────────────────────────────────────
export const Campanhas = {
  TIPOS: {
    aniversario:       { label: "🎂 Aniversário",           cor: "#EC4899" },
    acompanhamento:    { label: "💊 Acompanhamento",         cor: "#6366F1" },
    lembrete_consulta: { label: "📅 Lembrete de Consulta",  cor: "#0EA5E9" },
    oferta:            { label: "📣 Oferta / Promoção",      cor: "#F59E0B" },
    informativo:       { label: "📋 Informativo",            cor: "#8B5CF6" },
    checkin:           { label: "✅ Check-in",               cor: "#10B981" },
    satisfacao:        { label: "⭐ Pesquisa de Satisfação", cor: "#F97316" },
    boas_vindas:       { label: "👋 Boas-Vindas",            cor: "#2EB67D" },
  },

  async list(clienteId) {
    const { data, error } = await supabase
      .from("campanhas")
      .select("*")
      .eq("client_id", clienteId)
      .order("created_at", { ascending: false });
    check(error, "Campanhas.list");
    return data || [];
  },

  async create(clienteId, data) {
    const { data: row, error } = await supabase
      .from("campanhas")
      .insert({ client_id: clienteId, tipo: "", titulo: "", mensagem: "", pacientes_alvo: [], status: "rascunho", agendada_para: null, enviados: 0, falhas: 0, created_at: now(), updated_at: now(), ...data })
      .select("id").single();
    check(error, "Campanhas.create");
    return row.id;
  },

  async update(clienteId, campanhaId, data) {
    const { error } = await supabase
      .from("campanhas")
      .update({ ...data, updated_at: now() })
      .eq("id", campanhaId).eq("client_id", clienteId);
    check(error, "Campanhas.update");
  },

  onList(clienteId, callback) {
    return onTable("campanhas", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },
};

// ── WHATSAPP NUMBERS ──────────────────────────────────────────────────────
export const WhatsAppNumbers = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .select("*")
      .eq("client_id", clienteId);
    check(error, "WhatsAppNumbers.list");
    return data || [];
  },

  async add(clienteId, data) {
    const { data: row, error } = await supabase
      .from("whatsapp_numbers")
      .insert({ client_id: clienteId, numero: "", nome_display: "", ia_nome: "", ia_funcao: "", status: "pendente", cobrado_extra: false, created_at: now(), updated_at: now(), ...data })
      .select("id").single();
    check(error, "WhatsAppNumbers.add");
    return row.id;
  },

  async update(clienteId, numId, data) {
    const { error } = await supabase
      .from("whatsapp_numbers")
      .update({ ...data, updated_at: now() })
      .eq("id", numId).eq("client_id", clienteId);
    check(error, "WhatsAppNumbers.update");
  },

  async delete(clienteId, numId) {
    const { error } = await supabase
      .from("whatsapp_numbers").delete()
      .eq("id", numId).eq("client_id", clienteId);
    check(error, "WhatsAppNumbers.delete");
  },

  onList(clienteId, callback) {
    return onTable("whatsapp_numbers", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },
};

// ── SERVIÇOS ──────────────────────────────────────────────────────────────
export const Servicos = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .eq("client_id", clienteId)
      .order("created_at", { ascending: true });
    check(error, "Servicos.list");
    return data || [];
  },

  async create(clienteId, data) {
    const { data: row, error } = await supabase
      .from("servicos")
      .insert({ client_id: clienteId, nome: "", descricao: "", preco: 0, duracao_minutos: 60, ativo: true, created_at: now(), updated_at: now(), ...data })
      .select("id").single();
    check(error, "Servicos.create");
    return row.id;
  },

  async update(clienteId, servicoId, data) {
    const { error } = await supabase
      .from("servicos")
      .update({ ...data, updated_at: now() })
      .eq("id", servicoId).eq("client_id", clienteId);
    check(error, "Servicos.update");
  },

  async delete(clienteId, servicoId) {
    const { error } = await supabase
      .from("servicos").delete()
      .eq("id", servicoId).eq("client_id", clienteId);
    check(error, "Servicos.delete");
  },

  onList(clienteId, callback) {
    return onTable("servicos", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },
};

// ── VENDAS ────────────────────────────────────────────────────────────────
export const Vendas = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("vendas")
      .select("*")
      .eq("client_id", clienteId)
      .order("created_at", { ascending: false });
    check(error, "Vendas.list");
    return data || [];
  },

  async create(clienteId, data) {
    const { data: row, error } = await supabase
      .from("vendas")
      .insert({ client_id: clienteId, paciente_nome: "", paciente_id: null, servico_nome: "", servico_id: null, valor: 0, forma_pagamento: "", status: "pendente", observacoes: "", created_at: now(), updated_at: now(), ...data })
      .select("id").single();
    check(error, "Vendas.create");
    return row.id;
  },

  async update(clienteId, vendaId, data) {
    const { error } = await supabase
      .from("vendas")
      .update({ ...data, updated_at: now() })
      .eq("id", vendaId).eq("client_id", clienteId);
    check(error, "Vendas.update");
  },

  onList(clienteId, callback) {
    return onTable("vendas", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },
};

// ── IA APRENDIZADOS ───────────────────────────────────────────────────────
export const IAAprendizados = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("ia_aprendizados")
      .select("*")
      .eq("client_id", clienteId)
      .order("created_at", { ascending: false })
      .limit(50);
    check(error, "IAAprendizados.list");
    return data || [];
  },

  async create(clienteId, data) {
    const { data: row, error } = await supabase
      .from("ia_aprendizados")
      .insert({ client_id: clienteId, tipo: "conversa", resumo: "", aprendizado: "", status: "pendente", telefone_origem: "", created_at: now(), ...data })
      .select("id").single();
    check(error, "IAAprendizados.create");
    return row.id;
  },

  async aprovar(clienteId, id) {
    const { error } = await supabase.from("ia_aprendizados").update({ status: "aprovado", aprovado_at: now() }).eq("id", id).eq("client_id", clienteId);
    check(error, "IAAprendizados.aprovar");
  },

  async rejeitar(clienteId, id) {
    const { error } = await supabase.from("ia_aprendizados").update({ status: "rejeitado" }).eq("id", id).eq("client_id", clienteId);
    check(error, "IAAprendizados.rejeitar");
  },

  async corrigir(clienteId, id, novoAprendizado) {
    const { error } = await supabase.from("ia_aprendizados").update({ aprendizado: novoAprendizado, status: "aprovado", corrigido: true, updated_at: now() }).eq("id", id).eq("client_id", clienteId);
    check(error, "IAAprendizados.corrigir");
  },

  onList(clienteId, callback) {
    return onTable("ia_aprendizados", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },
};

// ── CHAT MESSAGES ──────────────────────────────────────────────────────────
export const ChatMessages = {
  async add(clienteId, data) {
    const { error } = await supabase
      .from("chat_messages")
      .insert({ client_id: clienteId, ...data, created_at: now() });
    check(error, "ChatMessages.add");
    // Incrementa contadores
    await supabase.rpc("increment_msgs", { p_client_id: clienteId }).catch(() => {});
  },

  async list(clienteId, telefone, limitN = 50) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("client_id", clienteId)
      .eq("telefone", telefone)
      .order("created_at", { ascending: false })
      .limit(limitN);
    check(error, "ChatMessages.list");
    return (data || []).reverse();
  },

  onList(clienteId, telefone, callback) {
    return onTable("chat_messages", () => this.list(clienteId, telefone), callback, `client_id=eq.${clienteId}`);
  },

  onListAll(clienteId, callback) {
    const fetchAll = async () => {
      const { data } = await supabase.from("chat_messages").select("*").eq("client_id", clienteId).order("created_at", { ascending: false }).limit(100);
      return data || [];
    };
    return onTable("chat_messages", fetchAll, callback, `client_id=eq.${clienteId}`);
  },
};

// ── INVOICES ───────────────────────────────────────────────────────────────
export const Invoices = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", clienteId)
      .order("created_at", { ascending: false });
    check(error, "Invoices.list");
    return data || [];
  },

  async add(clienteId, data) {
    const { data: row, error } = await supabase
      .from("invoices")
      .insert({ client_id: clienteId, ...data, created_at: now() })
      .select("id").single();
    check(error, "Invoices.add");
    return row;
  },

  async updateStatus(clienteId, invoiceId, status) {
    const { error } = await supabase
      .from("invoices")
      .update({ status, paid_at: status === "pago" ? now() : null })
      .eq("id", invoiceId).eq("client_id", clienteId);
    check(error, "Invoices.updateStatus");
  },

  onList(clienteId, callback) {
    return onTable("invoices", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },
};

// ── PORTAL MESSAGES ────────────────────────────────────────────────────────
export const PortalMessages = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("portal_messages")
      .select("*")
      .eq("client_id", clienteId)
      .order("created_at", { ascending: true });
    check(error, "PortalMessages.list");
    return data || [];
  },

  async send(clienteId, text, from_role = "client") {
    const { error } = await supabase
      .from("portal_messages")
      .insert({ client_id: clienteId, text, from_role, read: false, created_at: now() });
    check(error, "PortalMessages.send");
  },

  onList(clienteId, callback) {
    return onTable("portal_messages", () => this.list(clienteId), callback, `client_id=eq.${clienteId}`);
  },

  async markRead(clienteId, msgId) {
    const { error } = await supabase
      .from("portal_messages").update({ read: true })
      .eq("id", msgId).eq("client_id", clienteId);
    check(error, "PortalMessages.markRead");
  },
};

// ── AGENDAMENTOS ───────────────────────────────────────────────────────────
export const Agendamentos = {
  async list(clienteId) {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("client_id", clienteId)
      .order("data_inicio", { ascending: true });
    check(error, "Agendamentos.list");
    return data || [];
  },

  async add(clienteId, data) {
    const { data: row, error } = await supabase
      .from("agendamentos")
      .insert({ client_id: clienteId, ...data, created_at: now() })
      .select("id").single();
    check(error, "Agendamentos.add");
    return row;
  },
};

// ── N8N FLUXOS ─────────────────────────────────────────────────────────────
export const N8nFluxos = {
  async get(clienteId) {
    const { data } = await supabase.from("n8n_fluxos").select("*").eq("client_id", clienteId).maybeSingle();
    return data;
  },

  async update(clienteId, data) {
    const existing = await this.get(clienteId);
    if (existing) {
      await supabase.from("n8n_fluxos").update({ ...data, updated_at: now() }).eq("client_id", clienteId);
    } else {
      await supabase.from("n8n_fluxos").insert({ client_id: clienteId, ...data, created_at: now(), updated_at: now() });
    }
  },

  onList(callback) {
    return onTable("n8n_fluxos", async () => {
      const { data } = await supabase.from("n8n_fluxos").select("*");
      return data || [];
    }, callback);
  },
};

// ── TOKENS ─────────────────────────────────────────────────────────────────
export const Tokens = {
  async get(clienteId) {
    const { data } = await supabase.from("tokens").select("*").eq("client_id", clienteId).maybeSingle();
    return data;
  },

  async update(clienteId, data) {
    const existing = await this.get(clienteId);
    if (existing) {
      await supabase.from("tokens").update({ ...data, updated_at: now() }).eq("client_id", clienteId);
    } else {
      await supabase.from("tokens").insert({ client_id: clienteId, openai_key: "", waba_token: "", waba_verify_token: "", ...data, created_at: now(), updated_at: now() });
    }
  },

  onList(callback) {
    return onTable("tokens", async () => {
      const { data } = await supabase.from("tokens").select("*");
      return data || [];
    }, callback);
  },
};

// ── ALERTS ─────────────────────────────────────────────────────────────────
export const Alerts = {
  onList(callback) {
    return onTable("alerts", async () => {
      const { data } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(20);
      callback(data || []);
      return data || [];
    }, callback);
  },

  async markRead(id) {
    await supabase.from("alerts").update({ read: true }).eq("id", id);
  },
};
