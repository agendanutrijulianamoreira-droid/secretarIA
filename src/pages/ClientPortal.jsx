import { useState, useEffect } from "react";
import {
  LayoutDashboard, MessageSquare, Users, Wallet, Settings,
  Phone, Brain, FileText, ChevronRight, Power, Zap,
  Bell, BarChart2, Plus, X, CheckCircle, AlertCircle,
  Pause, Play, Edit2, Send, Bot, Star,
  Sparkles, TrendingUp, Smartphone, MessageCircle
} from "lucide-react";
import {
  Contatos, Pacientes, WhatsAppNumbers, Servicos, Vendas,
  Campanhas, IAAprendizados, Invoices, PortalMessages, ChatMessages
} from "../lib/db";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

const T = {
  bg: "#0A0B10", surface: "#161B22", up: "#1F2630",
  border: "#30363D", borderSt: "#484F58",
  green: "#2EB67D", greenDim: "rgba(46,182,125,0.1)",
  amber: "#E3B341", amberDim: "rgba(227,179,65,0.1)",
  red: "#F85149", redDim: "rgba(248,81,73,0.1)",
  cyan: "#0EA5E9", cyanDim: "rgba(14,165,233,0.10)",
  purple: "#8B5CF6", purpleDim: "rgba(139,92,246,0.1)",
  ink: "#F0F6FC", inkSec: "#8B949E", inkTert: "#484F58",
};

const PLAN_LIMITS = { Starter: 1, Pro: 3, Enterprise: 5 };
const COLORS = ["#6366F1","#EC4899","#F59E0B","#0EA5E9","#10B981","#8B5CF6","#F43F5E"];

// ── Primitives ────────────────────────────────────────────────────────────
function Pill({ children, color, bg }) {
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, color, background: bg, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{children}</span>;
}
function Pulse({ status }) {
  const c = { online: T.green, offline: T.red, pendente: T.amber }[status] || T.inkTert;
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {status === "online" && <span style={{ position: "absolute", inset: -3, borderRadius: "50%", background: c, opacity: 0.25, animation: "pulse 2s infinite" }} />}
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
    </span>
  );
}
function Btn({ children, onClick, variant = "primary", size = "md", style: sx = {}, disabled }) {
  const base = { padding: size === "sm" ? "6px 12px" : "10px 18px", fontSize: size === "sm" ? 12 : 13, fontWeight: 600, cursor: disabled ? "default" : "pointer", borderRadius: 10, fontFamily: "inherit", opacity: disabled ? 0.5 : 1, transition: "all 150ms" };
  const v = {
    primary: { background: T.green, color: "#000", border: "none" },
    ghost: { background: "transparent", color: T.inkSec, border: `1px solid ${T.border}` },
    danger: { background: T.redDim, color: T.red, border: `1px solid ${T.red}44` },
    cyan: { background: T.cyanDim, color: T.cyan, border: `1px solid ${T.cyan}44` },
  }[variant] || {};
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v, ...sx }}>{children}</button>;
}
function Inp({ label, value, onChange, placeholder, rows, type = "text" }) {
  const s = { width: "100%", padding: "10px 12px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 11, color: T.inkTert, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...s, resize: "vertical" }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={s} />}
    </div>
  );
}
function Card({ children, style: sx = {} }) {
  return <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, ...sx }}>{children}</div>;
}
function CardHeader({ title, subtitle, action }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: T.inkTert, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 32, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.inkSec }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: T.inkTert }}>{subtitle}</div>}
    </div>
  );
}

function PageTitle({ icon: Icon, iconColor, title, subtitle }) {
  const color = iconColor || T.cyan;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.ink, letterSpacing: "-0.02em" }}>{title}</h1>
        {subtitle && <p style={{ margin: 0, fontSize: 12, color: T.inkSec, marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Sidebar Nav ───────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "whatsapp",  icon: Phone,           label: "WhatsApp" },
  { id: "crm1",      icon: MessageSquare,   label: "CRM — Leads" },
  { id: "crm2",      icon: Users,           label: "CRM — Pacientes" },
  { id: "financeiro",icon: Wallet,          label: "Financeiro" },
  { id: "ia",        icon: Brain,           label: "IA Aprendizados" },
  { id: "plano",     icon: Star,            label: "Meu Plano" },
];

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "10px 14px", borderRadius: 8,
      background: active ? `${T.cyan}0f` : "transparent",
      border: "none",
      borderLeft: `3px solid ${active ? T.cyan : "transparent"}`,
      color: active ? T.cyan : T.inkSec,
      display: "flex", alignItems: "center", gap: 10,
      cursor: "pointer", transition: "all 0.15s", textAlign: "left", fontFamily: "inherit",
      marginLeft: -3,
    }}>
      <Icon size={16} color={active ? T.cyan : T.inkSec} strokeWidth={active ? 2.5 : 1.8} />
      <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, letterSpacing: active ? "-0.01em" : 0 }}>{item.label}</span>
    </button>
  );
}

// ── Dashboard View ────────────────────────────────────────────────────────
function ClientDashboardView({ client, leads, pacientes, whatsappNums }) {
  const leadsAtivos = leads.filter(l => l.atendimento_ia === "ativo").length;
  const leadsNovos  = leads.filter(l => l.crm_status === "novo").length;
  const convertidos = leads.filter(l => l.crm_status === "convertido").length;
  const numAtivos   = whatsappNums.filter(n => n.status === "ativo").length;

  const cards = [
    { l: "Leads Hoje",         v: leadsNovos,           c: T.cyan,   Icon: Sparkles },
    { l: "IAs Ativas",         v: leadsAtivos,          c: T.green,  Icon: Bot },
    { l: "Conversões",         v: convertidos,          c: T.purple, Icon: TrendingUp },
    { l: "Pacientes Ativos",   v: pacientes.length,     c: T.amber,  Icon: Users },
    { l: "WhatsApp Conectado", v: numAtivos,            c: T.green,  Icon: Smartphone },
    { l: "Msgs Hoje",          v: client.msgs_today||0, c: T.inkSec, Icon: MessageCircle },
  ];

  const briefing = client.briefing || {};
  const pct = [briefing.description, briefing.ai_name, briefing.ai_tone, briefing.ai_goal, briefing.business_hours].filter(Boolean).length * 20;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 300ms ease" }}>
      <PageTitle
        icon={LayoutDashboard}
        iconColor={T.cyan}
        title={`Olá, ${client.name?.split(" ")[0]}`}
        subtitle="Aqui está o resumo de hoje da sua SecretarIA."
      />

      {pct < 80 && (
        <div style={{ background: `${T.amber}0d`, border: `1px solid ${T.amber}33`, borderRadius: 16, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${T.amber}1a`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={16} color={T.amber} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.amber }}>Configuração incompleta</div>
              <div style={{ fontSize: 12, color: T.inkSec, marginTop: 2 }}>Complete o briefing para sua IA ficar mais precisa e personalizada.</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.amber, letterSpacing: "-0.02em", flexShrink: 0 }}>{pct}%</div>
          </div>
          <div style={{ height: 6, width: "100%", background: `${T.amber}18`, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: T.amber, borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {cards.map(({ l, v, c, Icon }) => (
          <Card key={l} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c + "1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={18} color={c} />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 12, color: T.inkSec, marginTop: 5, fontWeight: 500 }}>{l}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18 }}>
        <Card>
          <CardHeader title="🤖 IAs Trabalhando Agora" subtitle="Conversas em andamento" />
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {leads.filter(l => l.atendimento_ia === "ativo").slice(0, 5).map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: T.bg, borderRadius: 10 }}>
                <Pulse status="online" />
                <span style={{ fontSize: 13, flex: 1, color: T.ink }}>{l.nome || l.telefone}</span>
                <Pill color={T.green} bg={T.greenDim}>IA Ativa</Pill>
              </div>
            ))}
            {leads.filter(l => l.atendimento_ia === "ativo").length === 0 && (
              <EmptyState icon="😴" title="Nenhuma conversa ativa" subtitle="As IAs estão aguardando novos leads" />
            )}
          </div>
        </Card>

        <Card style={{ background: T.cyanDim, borderColor: `${T.cyan}22` }}>
          <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, height: "100%", justifyContent: "center" }}>
            <Zap size={36} color={T.cyan} />
            <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Sistema Operando</div>
            <div style={{ fontSize: 12, color: T.inkSec, lineHeight: 1.6 }}>
              Sua SecretarIA está ativa e respondendo. Plano <strong style={{ color: T.cyan }}>{client.plan}</strong> em uso.
            </div>
            <Pill color={T.green} bg={T.greenDim}>● Todos os sistemas online</Pill>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── WhatsApp View ─────────────────────────────────────────────────────────
function WhatsAppView({ client, numbers, reload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null); // ID do número sendo editado

  const save = async () => {
    if (!form.nome_display.trim() || !form.phone_number_id.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await WhatsAppNumbers.update(client.id, editing, form);
      } else {
        await WhatsAppNumbers.add(client.id, { ...form, status: "pendente" });
      }
      setForm({ nome_display: "", ia_nome: "", ia_funcao: "", waba_id: "", phone_number_id: "" });
      setShowAdd(false);
      setEditing(null);
      reload();
    } finally { setSaving(false); }
  };

  const startEdit = (num) => {
    setForm({
      nome_display: num.nome_display || "",
      ia_nome: num.ia_nome || "",
      ia_funcao: num.ia_funcao || "",
      waba_id: num.waba_id || "",
      phone_number_id: num.phone_number_id || ""
    });
    setEditing(num.id);
    setShowAdd(true);
  };

  const toggle = async (num) => {
    await WhatsAppNumbers.update(client.id, num.id, { status: num.status === "ativo" ? "inativo" : "ativo" });
    reload();
  };

  const remove = async (num) => {
    if (!confirm(`Remover o número "${num.nome_display}"?`)) return;
    await WhatsAppNumbers.delete(client.id, num.id);
    reload();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 300ms ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle
          icon={Smartphone}
          iconColor={T.green}
          title="WhatsApp"
          subtitle={`Gerencie seus números da API Oficial. Plano ${client.plan}: até ${limit} número(s).`}
        />
        <Btn onClick={() => { setEditing(null); setForm({ nome_display: "", ia_nome: "", ia_funcao: "", waba_id: "", phone_number_id: "" }); setShowAdd(true); }} disabled={!canAdd} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> Adicionar Número
        </Btn>
      </div>

      {!canAdd && (
        <div style={{ background: T.amberDim, border: `1px solid ${T.amber}44`, borderRadius: 16, padding: "12px 16px", fontSize: 13, color: T.amber }}>
          ⚠️ Você atingiu o limite de {limit} número(s) do plano {client.plan}. Faça upgrade para adicionar mais.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {numbers.map(num => (
          <Card key={num.id}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: num.status === "ativo" ? T.greenDim : T.up, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📱</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{num.nome_display}</span>
                  <Pulse status={num.status === "ativo" ? "online" : num.status === "pendente" ? "pendente" : "offline"} />
                  <Pill color={num.status === "ativo" ? T.green : num.status === "pendente" ? T.amber : T.red}
                    bg={num.status === "ativo" ? T.greenDim : num.status === "pendente" ? T.amberDim : T.redDim}>
                    {num.status}
                  </Pill>
                </div>
                <div style={{ fontSize: 11, color: T.inkTert, marginTop: 3 }}>
                  IA: <strong style={{ color: T.cyan }}>{num.ia_nome || "—"}</strong>
                  {num.ia_funcao && <> · Função: {num.ia_funcao}</>}
                  {num.phone_number_id && <> · ID: {num.phone_number_id}</>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost" size="sm" onClick={() => startEdit(num)}><Edit2 size={12} /></Btn>
                <Btn variant="ghost" size="sm" onClick={() => toggle(num)}>
                  {num.status === "ativo" ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Ativar</>}
                </Btn>
                <Btn variant="danger" size="sm" onClick={() => remove(num)}><X size={12} /></Btn>
              </div>
            </div>
          </Card>
        ))}
        {numbers.length === 0 && (
          <Card><EmptyState icon="📱" title="Nenhum número cadastrado" subtitle="Adicione seu Phone Number ID da API Oficial do WhatsApp" /></Card>
        )}
      </div>

      <Card>
        <CardHeader title="📖 Como configurar a API Oficial" />
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            ["1", "Acesse o Meta Business Manager e crie um WABA (WhatsApp Business Account)"],
            ["2", "Adicione um número de telefone e obtenha o Phone Number ID"],
            ["3", "Gere um token de acesso permanente nas configurações do app"],
            ["4", "Configure o token nas configurações da sua conta SecretarIA"],
            ["5", "Informe o Phone Number ID aqui para ativar a integração"],
          ].map(([n, t]) => (
            <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: T.cyanDim, color: T.cyan, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
              <span style={{ fontSize: 13, color: T.inkSec, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>
      </Card>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" }}>
          <Card style={{ width: 480, overflow: "hidden" }}>
            <CardHeader title={editing ? "Editar Número WhatsApp" : "Adicionar Número WhatsApp"} action={<button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkTert, fontSize: 18 }}>✕</button>} />
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <Inp label="Nome do Número *" value={form.nome_display} onChange={v => setForm(p => ({ ...p, nome_display: v }))} placeholder="Ex: Atendimento Principal" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Inp label="Nome da IA" value={form.ia_nome} onChange={v => setForm(p => ({ ...p, ia_nome: v }))} placeholder='Ex: Ana' />
                <Inp label="Função da IA" value={form.ia_funcao} onChange={v => setForm(p => ({ ...p, ia_funcao: v }))} placeholder='Ex: Recepcionista' />
              </div>
              <Inp label="Phone Number ID *" value={form.phone_number_id} onChange={v => setForm(p => ({ ...p, phone_number_id: v }))} placeholder="ID do painel Meta" />
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <Btn variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancelar</Btn>
                <Btn onClick={save} disabled={saving || !form.nome_display || !form.phone_number_id} style={{ flex: 1 }}>
                  {saving ? "Salvando…" : editing ? "✅ Salvar" : "✅ Adicionar"}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export { ClientDashboardView, WhatsAppView, T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill, Pulse, NAV, NavItem, COLORS };
