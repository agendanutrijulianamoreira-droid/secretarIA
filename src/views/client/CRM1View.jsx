import { useState, useEffect, useRef } from "react";
import { Pause, Play, MessageSquare, ChevronDown, ChevronUp, Send } from "lucide-react";
import { Contatos, ChatMessages } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill, Pulse, COLORS } from "../../pages/ClientPortal";

const CRM_STATUS = {
  novo:        { label: "Novo Lead",     color: T.cyan,   bg: T.cyanDim,   icon: "✨" },
  contatado:   { label: "Em Contato",    color: T.amber,  bg: T.amberDim,  icon: "💬" },
  qualificado: { label: "Qualificado",   color: "#8B5CF6",bg:"rgba(139,92,246,0.12)", icon: "🔥" },
  convertido:  { label: "Convertido",    color: T.green,  bg: T.greenDim,  icon: "✅" },
  perdido:     { label: "Perdido",       color: T.red,    bg: T.redDim,    icon: "✖️" },
};

function LeadCard({ lead, clientId }) {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState([]);
  const [draft, setDraft]   = useState("");
  const [tab, setTab]       = useState("conversa"); // conversa | notas
  const [editIA, setEditIA] = useState(false);
  const [iaNome, setIaNome] = useState(lead.ia_nome || "");
  const s = CRM_STATUS[lead.crm_status || "novo"] || CRM_STATUS.novo;
  const ia = lead.atendimento_ia === "ativo";
  const initials = lead.nome?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const color = COLORS[lead.telefone?.length % COLORS.length] || COLORS[0];

  useEffect(() => {
    if (!open || tab !== "conversa") return;
    const unsub = ChatMessages.onList(clientId, lead.telefone, setMsgs);
    return unsub;
  }, [open, tab, lead.telefone, clientId]);

  const toggleIA = async () => {
    await Contatos.setPause(clientId, lead.id, ia);
  };

  const saveIANome = async () => {
    await Contatos.updateCRM(clientId, lead.id, { ia_nome: iaNome });
    setEditIA(false);
  };

  const sendMsg = async () => {
    if (!draft.trim()) return;
    await ChatMessages.add(clientId, { telefone: lead.telefone, role: "user", content: draft });
    setDraft("");
  };

  const setStatus = (status) => Contatos.updateCRM(clientId, lead.id, { crm_status: status });

  return (
    <div style={{ background: T.surface, border: `1px solid ${open ? T.borderSt : T.border}`, borderRadius: 14, overflow: "hidden", transition: "all 200ms" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "22", border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{lead.nome || "Lead S/ Nome"}</div>
          <div style={{ fontSize: 11, color: T.inkTert }}>{lead.telefone}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Pulse status={ia ? "online" : "offline"} />
          <Pill color={s.color} bg={s.bg}>{s.icon} {s.label}</Pill>
          <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkTert }}>
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${T.border}`, animation: "fadeIn 150ms ease" }}>
          {/* Controles rápidos */}
          <div style={{ padding: "12px 18px", background: T.bg, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Btn size="sm" variant={ia ? "danger" : "primary"} onClick={toggleIA}>
              {ia ? <><Pause size={11} /> Pausar IA</> : <><Play size={11} /> Ativar IA</>}
            </Btn>
            {!editIA
              ? <Btn size="sm" variant="ghost" onClick={() => setEditIA(true)}>✏️ Nome da IA: {lead.ia_nome || "Padrão"}</Btn>
              : <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={iaNome} onChange={e => setIaNome(e.target.value)} placeholder="Nome da IA" style={{ padding: "5px 10px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.ink, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                  <Btn size="sm" onClick={saveIANome}>Salvar</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setEditIA(false)}>×</Btn>
                </div>
            }
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(CRM_STATUS).map(([id, m]) => (
                <button key={id} onClick={() => setStatus(id)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${lead.crm_status === id ? m.color + "66" : T.border}`, background: lead.crm_status === id ? m.bg : "transparent", color: lead.crm_status === id ? m.color : T.inkTert, fontFamily: "inherit" }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
            {[["conversa", "💬 Conversa"], ["notas", "📝 Notas"]].map(([id, l]) => (
              <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", color: tab === id ? T.cyan : T.inkTert, fontSize: 12, fontWeight: tab === id ? 700 : 500, borderBottom: `2px solid ${tab === id ? T.cyan : "transparent"}`, fontFamily: "inherit" }}>{l}</button>
            ))}
          </div>

          {tab === "conversa" && (
            <div style={{ height: 280, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                {msgs.length === 0 && <div style={{ textAlign: "center", padding: 20, color: T.inkTert, fontSize: 12 }}>Nenhuma mensagem ainda nesta conversa.</div>}
                {msgs.map((m, i) => {
                  const isAI = m.role === "assistant";
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: isAI ? "flex-start" : "flex-end" }}>
                      <div style={{ maxWidth: "80%", background: isAI ? T.up : T.greenDim, border: `1px solid ${isAI ? T.border : T.green + "33"}`, borderRadius: isAI ? "12px 12px 12px 4px" : "12px 12px 4px 12px", padding: "8px 12px" }}>
                        <div style={{ fontSize: 12, color: T.ink, lineHeight: 1.5 }}>{m.content}</div>
                        <div style={{ fontSize: 10, color: T.inkTert, marginTop: 3, textAlign: isAI ? "left" : "right" }}>{isAI ? (lead.ia_nome || "SecretarIA") : "Você"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "10px 18px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Entrar na conversa como humano…" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                <Btn size="sm" onClick={sendMsg}><Send size={13} /></Btn>
              </div>
            </div>
          )}

          {tab === "notas" && (
            <div style={{ padding: 18 }}>
              <Inp label="Notas sobre o lead" value={lead.crm_notes || ""} onChange={v => Contatos.updateCRM(clientId, lead.id, { crm_notes: v })} placeholder="Adicione observações sobre este lead…" rows={4} />
              <div style={{ fontSize: 10, color: T.inkTert, marginTop: 8 }}>Última interação: {lead.ultima_interacao?.toDate?.()?.toLocaleString("pt-BR") || "—"}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CRM1View({ client, leads }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filtered = leads.filter(l => {
    const ms = (l.nome || "").toLowerCase().includes(search.toLowerCase()) || l.telefone?.includes(search);
    const mf = filterStatus === "todos" || l.crm_status === filterStatus;
    return ms && mf;
  });

  const stats = {
    total: leads.length,
    ativos: leads.filter(l => l.atendimento_ia === "ativo").length,
    convertidos: leads.filter(l => l.crm_status === "convertido").length,
    novos: leads.filter(l => l.crm_status === "novo").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 300ms ease" }}>
      <PageTitle icon={MessageSquare} iconColor={T.cyan} title="CRM — Leads" subtitle="Veja as IAs trabalhando em tempo real." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { l: "Total de Leads", v: stats.total, c: T.ink },
          { l: "IAs Ativas", v: stats.ativos, c: T.green },
          { l: "Novos Hoje", v: stats.novos, c: T.cyan },
          { l: "Convertidos", v: stats.convertidos, c: "#8B5CF6" },
        ].map(s => (
          <Card key={s.l} style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: T.inkTert, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou telefone…" style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.ink, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {["todos", ...Object.keys(CRM_STATUS)].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${filterStatus === s ? T.cyan + "66" : T.border}`, background: filterStatus === s ? T.cyanDim : "transparent", color: filterStatus === s ? T.cyan : T.inkSec, fontFamily: "inherit" }}>
              {s === "todos" ? "Todos" : CRM_STATUS[s]?.icon + " " + CRM_STATUS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && <Card><EmptyState icon="🎯" title="Nenhum lead encontrado" subtitle="Os leads chegam automaticamente pelo WhatsApp" /></Card>}
        {filtered.map(lead => (
          <LeadCard key={lead.id} lead={lead} clientId={client.id} />
        ))}
      </div>
    </div>
  );
}
