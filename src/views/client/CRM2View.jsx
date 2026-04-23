import { useState } from "react";
import { Plus, X, Edit2, Check, Users } from "lucide-react";
import { Pacientes, Campanhas } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill } from "../../pages/ClientPortal";

const CAMP_TIPOS = Campanhas.TIPOS;

function PacienteModal({ clientId, initial, onClose }) {
  const [f, setF] = useState(initial || { nome: "", telefone: "", email: "", data_nascimento: "", observacoes: "" });
  const [saving, setSaving] = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.nome.trim() || !f.telefone.trim()) return;
    setSaving(true);
    try {
      if (f.id) await Pacientes.update(clientId, f.id, f);
      else await Pacientes.create(clientId, f);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" }}>
      <Card style={{ width: 460, overflow: "hidden" }}>
        <CardHeader title={f.id ? "Editar Paciente" : "Novo Paciente"} action={<button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkTert, fontSize: 18 }}>✕</button>} />
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <Inp label="Nome *" value={f.nome} onChange={up("nome")} placeholder="Nome completo" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Inp label="WhatsApp *" value={f.telefone} onChange={up("telefone")} placeholder="+55 11 9..." />
            <Inp label="E-mail" value={f.email} onChange={up("email")} placeholder="email@..." />
          </div>
          <Inp label="Data de Nascimento" value={f.data_nascimento} onChange={up("data_nascimento")} placeholder="DD/MM/AAAA" />
          <Inp label="Observações" value={f.observacoes} onChange={up("observacoes")} placeholder="Histórico, restrições…" rows={3} />
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
            <Btn onClick={save} disabled={saving || !f.nome || !f.telefone} style={{ flex: 1 }}>{saving ? "Salvando…" : "✅ Salvar"}</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CampanhaModal({ clientId, pacientes, onClose }) {
  const [f, setF] = useState({ tipo: "", titulo: "", mensagem: "", pacientes_alvo: "todos", agendada_para: "" });
  const [saving, setSaving] = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.tipo || !f.mensagem.trim()) return;
    setSaving(true);
    try {
      await Campanhas.create(clientId, { ...f, status: f.agendada_para ? "agendada" : "rascunho" });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" }}>
      <Card style={{ width: 520, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <CardHeader title="Nova Campanha de Mensagens" action={<button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkTert, fontSize: 18 }}>✕</button>} />
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          <div>
            <label style={{ fontSize: 11, color: T.inkTert, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>Tipo de Campanha *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(CAMP_TIPOS).map(([id, m]) => (
                <button key={id} onClick={() => up("tipo")(id)} style={{ padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${f.tipo === id ? m.cor + "66" : T.border}`, background: f.tipo === id ? m.cor + "18" : T.bg, color: f.tipo === id ? m.cor : T.inkSec, fontFamily: "inherit", textAlign: "left" }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <Inp label="Título da campanha" value={f.titulo} onChange={up("titulo")} placeholder="Nome interno para identificação" />
          <Inp label="Mensagem *" value={f.mensagem} onChange={up("mensagem")} placeholder="Olá {nome}! 👋 Tudo bem?&#10;&#10;Use {nome} para personalizar…" rows={5} />
          <div>
            <label style={{ fontSize: 11, color: T.inkTert, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>Destinatários</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["todos", "selecionados"].map(op => (
                <button key={op} onClick={() => up("pacientes_alvo")(op)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${f.pacientes_alvo === op ? T.cyan + "66" : T.border}`, background: f.pacientes_alvo === op ? T.cyanDim : "transparent", color: f.pacientes_alvo === op ? T.cyan : T.inkSec, fontFamily: "inherit" }}>
                  {op === "todos" ? `Todos os pacientes (${pacientes.length})` : "Selecionar pacientes"}
                </button>
              ))}
            </div>
          </div>
          <Inp label="Agendar para (opcional)" value={f.agendada_para} onChange={up("agendada_para")} placeholder="DD/MM/AAAA HH:mm" />
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
            <Btn onClick={save} disabled={saving || !f.tipo || !f.mensagem} style={{ flex: 1 }}>{saving ? "Criando…" : "🚀 Criar Campanha"}</Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

const STATUS_CAMP = {
  rascunho: { l: "Rascunho", c: T.inkSec, b: T.up },
  agendada:  { l: "Agendada", c: T.amber,  b: T.amberDim },
  enviando:  { l: "Enviando", c: T.cyan,   b: T.cyanDim },
  concluida: { l: "Concluída", c: T.green, b: T.greenDim },
  cancelada: { l: "Cancelada", c: T.red,   b: T.redDim },
};

export default function CRM2View({ client, pacientes, campanhas }) {
  const [tab, setTab]           = useState("pacientes");
  const [editPac, setEditPac]   = useState(null);
  const [showCamp, setShowCamp] = useState(false);
  const [search, setSearch]     = useState("");

  const filtered = pacientes.filter(p =>
    (p.nome || "").toLowerCase().includes(search.toLowerCase()) || p.telefone?.includes(search)
  );

  const del = async (p) => {
    if (!confirm(`Remover ${p.nome}?`)) return;
    await Pacientes.delete(client.id, p.id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 300ms ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle icon={Users} iconColor={T.purple} title="CRM — Pacientes" subtitle="Gerencie seus pacientes e campanhas de acompanhamento." />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" size="sm" onClick={() => setShowCamp(true)}>📣 Nova Campanha</Btn>
          <Btn size="sm" onClick={() => setEditPac({})}>+ Paciente</Btn>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, gap: 4 }}>
        {[["pacientes", `👥 Pacientes (${pacientes.length})`], ["campanhas", `📣 Campanhas (${campanhas.length})`]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 20px", border: "none", background: "none", cursor: "pointer", color: tab === id ? T.cyan : T.inkSec, fontSize: 13, fontWeight: tab === id ? 700 : 500, borderBottom: `2px solid ${tab === id ? T.cyan : "transparent"}`, fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>

      {tab === "pacientes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente…" style={{ padding: "9px 14px", borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.ink, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          {filtered.length === 0 && <Card><EmptyState icon="👥" title="Nenhum paciente cadastrado" subtitle='Clique em "+ Paciente" para adicionar' /></Card>}
          {filtered.map(p => (
            <Card key={p.id} style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: T.cyanDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.cyan, flexShrink: 0 }}>
                  {p.nome?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: T.inkTert }}>{p.telefone}{p.data_nascimento ? ` · 🎂 ${p.data_nascimento}` : ""}</div>
                </div>
                {p.origem === "lead_convertido" && <Pill color={T.green} bg={T.greenDim}>✅ Lead convertido</Pill>}
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn size="sm" variant="ghost" onClick={() => setEditPac(p)}><Edit2 size={12} /></Btn>
                  <Btn size="sm" variant="danger" onClick={() => del(p)}><X size={12} /></Btn>
                </div>
              </div>
              {p.observacoes && <div style={{ marginTop: 8, fontSize: 12, color: T.inkSec, background: T.bg, borderRadius: 8, padding: "6px 10px" }}>{p.observacoes}</div>}
            </Card>
          ))}
        </div>
      )}

      {tab === "campanhas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {campanhas.length === 0 && <Card><EmptyState icon="📣" title="Nenhuma campanha criada" subtitle='Clique em "Nova Campanha" para começar' /></Card>}
          {campanhas.map(c => {
            const tipo = CAMP_TIPOS[c.tipo] || { label: c.tipo, cor: T.inkSec };
            const sc = STATUS_CAMP[c.status] || STATUS_CAMP.rascunho;
            return (
              <Card key={c.id} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: tipo.cor + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {tipo.label.split(" ")[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{c.titulo || tipo.label}</span>
                      <Pill color={sc.c} bg={sc.b}>{sc.l}</Pill>
                    </div>
                    <div style={{ fontSize: 12, color: T.inkSec, lineHeight: 1.5, marginBottom: 6 }}>{c.mensagem?.slice(0, 120)}{c.mensagem?.length > 120 ? "…" : ""}</div>
                    <div style={{ fontSize: 11, color: T.inkTert }}>
                      {c.pacientes_alvo === "todos" ? "Todos os pacientes" : "Selecionados"}
                      {c.agendada_para ? ` · Agendada: ${c.agendada_para}` : ""}
                      {c.enviados ? ` · Enviados: ${c.enviados}` : ""}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editPac !== null && <PacienteModal clientId={client.id} initial={editPac} onClose={() => setEditPac(null)} />}
      {showCamp && <CampanhaModal clientId={client.id} pacientes={pacientes} onClose={() => setShowCamp(false)} />}
    </div>
  );
}
