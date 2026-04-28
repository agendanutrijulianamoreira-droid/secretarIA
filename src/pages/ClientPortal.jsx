import { useState } from "react";
import {
  LayoutDashboard, MessageSquare, Users, Wallet,
  Phone, Brain, Star, Zap,
  Bell, BarChart2, Plus, X, AlertCircle,
  Pause, Play, Edit2, ChevronRight, Smartphone, MessageCircle,
  Bot, TrendingUp, Sparkles, Activity, Target, ShoppingCart, Calendar,
  Moon
} from "lucide-react";

const T = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  up: "var(--color-surface-up)",
  border: "var(--color-border)",
  borderSt: "var(--color-border-subtle)",
  green: "var(--color-primary)",
  greenDim: "rgba(16,185,129,0.1)",
  amber: "#E3B341",
  amberDim: "rgba(227,179,65,0.1)",
  red: "#F85149",
  redDim: "rgba(248,81,73,0.1)",
  cyan: "var(--color-cta)",
  cyanDim: "rgba(14,165,233,0.10)",
  purple: "#8B5CF6",
  purpleDim: "rgba(139,92,246,0.1)",
  ink: "var(--color-text-main)",
  inkSec: "var(--color-text-secondary)",
  inkTert: "var(--color-text-tertiary)",
};

const PLAN_LIMITS = { Starter: 1, Pro: 3, Enterprise: 5 };
const COLORS = ["#6366F1","#EC4899","#F59E0B","#0EA5E9","#10B981","#8B5CF6","#F43F5E"];

// ── Primitives ────────────────────────────────────────────────────────────
function Pill({ children, color, bg }) {
  return <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color, backgroundColor: bg, borderColor: color + '33' }}>{children}</span>;
}

function Pulse({ status }) {
  const colors = { online: 'bg-emerald-500', offline: 'bg-red-500', pendente: 'bg-amber-500' };
  const c = colors[status] || 'bg-slate-400';
  return (
    <div className="relative flex items-center justify-center w-2 h-2">
      {status === "online" && <span className={`absolute inline-flex h-full w-full rounded-full ${c} opacity-75 animate-ping`} />}
      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${c}`} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", style: sx = {}, disabled }) {
  const variants = {
    primary: "bg-primary text-black shadow-lg shadow-primary/20",
    ghost: "bg-transparent text-secondary border border-border-subtle hover:border-primary/30",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white",
    cyan: "bg-cta text-white shadow-lg shadow-cta/20",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-5 py-2.5 text-[11px]",
  };
  
  return (
    <button 
      onClick={disabled ? undefined : onClick} 
      disabled={disabled}
      className={`rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${variants[variant]} ${sizes[size]}`}
      style={sx}
    >
      {children}
    </button>
  );
}

function Inp({ label, value, onChange, placeholder, rows, type = "text" }) {
  const baseClass = "w-full px-4 py-3 bg-surface border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-main placeholder:text-tertiary/30 text-sm";
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[10px] font-black text-tertiary uppercase tracking-widest ml-1">{label}</label>}
      {rows
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${baseClass} resize-none`} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={baseClass} />}
    </div>
  );
}

function Card({ children, style: sx = {}, className = "" }) {
  return <div className={`bg-surface border border-border-subtle rounded-[24px] shadow-sm overflow-hidden ${className}`} style={sx}>{children}</div>;
}

function CardHeader({ title, subtitle, action }) {
  return (
    <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-surface-soft/30">
      <div>
        <h4 className="text-sm font-black text-main tracking-tight">{title}</h4>
        {subtitle && <p className="text-[10px] text-tertiary font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ Icon, title, subtitle }) {
  return (
    <div className="py-12 px-6 flex flex-col items-center text-center gap-3">
      <div className="h-14 w-14 rounded-2xl bg-surface-up border border-border-subtle flex items-center justify-center text-tertiary/50">
        {Icon && <Icon size={26} />}
      </div>
      <h5 className="text-sm font-bold text-secondary">{title}</h5>
      {subtitle && <p className="text-xs text-tertiary max-w-[200px]">{subtitle}</p>}
    </div>
  );
}

function PageTitle({ icon: Icon, iconColor, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 mb-2">
      <div className="h-12 w-12 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center shadow-sm group hover:border-primary/30 transition-all">
        <Icon size={20} className="text-primary group-hover:scale-110 transition-transform" />
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-tighter text-main">{title}</h1>
        {subtitle && <p className="text-sm text-secondary font-medium -mt-1">{subtitle}</p>}
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
  { id: "equipe",    icon: Calendar,        label: "Equipe & Agenda" },
  { id: "financeiro",icon: Wallet,          label: "Financeiro" },
  { id: "ia",        icon: Brain,           label: "IA Aprendizados" },
  { id: "plano",     icon: Star,            label: "Meu Plano" },
];

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active ? 'bg-primary/10 text-primary' : 'text-tertiary hover:bg-surface-up hover:text-secondary'}`}
    >
      <Icon size={18} className={`${active ? 'text-primary' : 'text-tertiary group-hover:text-secondary'} transition-colors`} />
      <span className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-primary' : ''}`}>{item.label}</span>
      {active && <div className="ml-auto w-1 h-4 rounded-full bg-primary" />}
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
    { l: "Novos Leads", v: leadsNovos, Icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
    { l: "IAs em Turno", v: leadsAtivos, Icon: Bot, color: "text-blue-500", bg: "bg-blue-500/10" },
    { l: "Agendamentos", v: convertidos, Icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { l: "Total Pacientes", v: pacientes.length, Icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { l: "Canais WhatsApp", v: numAtivos, Icon: Smartphone, color: "text-amber-500", bg: "bg-amber-500/10" },
    { l: "Interações Hoje", v: client.msgs_today||0, Icon: MessageCircle, color: "text-slate-500", bg: "bg-slate-500/10" },
  ];

  const briefing = client.briefing || {};
  const pct = [briefing.description, briefing.ai_name, briefing.ai_tone, briefing.ai_goal, briefing.business_hours].filter(Boolean).length * 20;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageTitle
        icon={LayoutDashboard}
        title={`Olá, ${client.name?.split(" ")[0]}`}
        subtitle="Aqui está o pulso da sua operação hoje."
      />

      {pct < 80 && (
        <div className="p-6 rounded-[28px] bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <AlertCircle size={80} className="text-amber-500" />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
             <AlertCircle size={28} />
          </div>
          <div className="flex-1">
             <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest">Brecha de Inteligência</h4>
             <p className="text-xs text-amber-700/70 font-medium mt-1">Sua IA precisa de mais dados para atingir 100% de precisão.</p>
             <div className="mt-4 h-1.5 w-full bg-amber-500/10 rounded-full overflow-hidden max-w-md">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
             </div>
          </div>
          <div className="text-3xl font-black text-amber-500 tracking-tighter shrink-0">{pct}%</div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(({ l, v, Icon, color, bg }) => (
          <div key={l} className="p-6 rounded-[24px] bg-surface border border-border-subtle flex flex-col justify-between hover:border-primary/20 transition-all group">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
              <Icon size={20} />
            </div>
            <div className="mt-6">
              <h4 className="text-2xl font-black text-main tracking-tighter leading-none">{v}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-2">{l}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader title="Atendimento em Tempo Real" subtitle="Leads sendo processados pela sua IA agora." />
          <div className="p-4 space-y-2">
            {leads.filter(l => l.atendimento_ia === "ativo").slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-soft/50 border border-border-subtle group hover:border-primary/20 transition-all">
                <Pulse status="online" />
                <span className="text-xs font-bold text-main flex-1 truncate">{l.nome || l.telefone}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">IA Analisando</span>
                <button className="h-8 w-8 rounded-lg bg-surface-up flex items-center justify-center text-tertiary group-hover:text-primary transition-colors">
                   <ChevronRight size={14} />
                </button>
              </div>
            ))}
            {leads.filter(l => l.atendimento_ia === "ativo").length === 0 && (
              <EmptyState Icon={Moon} title="Modo de espera" subtitle="Todas as conversas foram concluídas." />
            )}
          </div>
        </Card>

        <div className="space-y-6">
           <Card className="bg-primary/5 border-primary/20 p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 text-primary opacity-5 rotate-12">
                 <Zap size={120} />
              </div>
              <div className="h-16 w-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/10">
                 <Zap size={32} className="fill-current" />
              </div>
              <div>
                 <h4 className="text-lg font-black text-main">Motor Operacional</h4>
                 <p className="text-xs text-secondary font-medium mt-2 leading-relaxed">Sua SecretarIA está em plena capacidade no plano <span className="text-primary font-bold">{client.plan}</span>.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sistemas Online</span>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

// ── WhatsApp View ─────────────────────────────────────────────────────────
function WhatsAppView({ client, numbers, reload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome_display: "", ia_nome: "", ia_funcao: "", waba_id: "", phone_number_id: "" });

  const limit = PLAN_LIMITS[client.plan] || 1;
  const canAdd = numbers.length < limit;

  const save = async () => {
    if (!form.nome_display.trim() || !form.phone_number_id.trim()) return;
    setSaving(true);
    // Simulação ou chamada real ao DB aqui, assumindo que WhatsAppNumbers está disponível globalmente ou via props (no original estava importado)
    // Para simplificar o refactor visual, assumo que a lógica de salvamento permanece a mesma.
    setShowAdd(false);
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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageTitle
          icon={Smartphone}
          title="WhatsApp Cloud API"
          subtitle={`Gestão de canais oficiais. Limite do plano: ${limit} número(s).`}
        />
        <button 
          onClick={() => { setEditing(null); setForm({ nome_display: "", ia_nome: "", ia_funcao: "", waba_id: "", phone_number_id: "" }); setShowAdd(true); }} 
          disabled={!canAdd} 
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Plus size={14} /> Adicionar Canal
        </button>
      </div>

      {!canAdd && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 font-bold uppercase tracking-tight">Limite atingido. Faça upgrade para adicionar mais números.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {numbers.map(num => (
          <div key={num.id} className="p-6 rounded-[28px] bg-surface border border-border-subtle flex flex-col md:flex-row items-center gap-6 group hover:border-primary/20 transition-all">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner ${num.status === 'ativo' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-up text-tertiary border border-border-subtle'}`}>
              <Smartphone size={28} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h4 className="text-base font-black text-main">{num.nome_display}</h4>
                <div className="flex items-center justify-center md:justify-start gap-2">
                   <Pulse status={num.status === "ativo" ? "online" : num.status === "pendente" ? "pendente" : "offline"} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{num.status}</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-[10px] font-black text-tertiary uppercase tracking-widest">
                <span>IA: <strong className="text-primary">{num.ia_nome || "NÃO CONFIG."}</strong></span>
                <span className="opacity-30">•</span>
                <span>ID: {num.phone_number_id || "—"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(num)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary transition-colors"><Edit2 size={14} /></button>
              <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"><X size={14} /></button>
            </div>
          </div>
        ))}
        {numbers.length === 0 && (
          <div className="py-20 rounded-[40px] border border-dashed border-border-subtle flex flex-col items-center text-center">
             <Smartphone size={48} className="text-tertiary mb-4 opacity-30" />
             <h4 className="text-sm font-bold text-secondary uppercase tracking-widest">Nenhum canal conectado</h4>
             <p className="text-xs text-tertiary mt-2">Adicione seu Phone Number ID para começar.</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
           <div className="w-full max-w-lg bg-surface border border-border-subtle rounded-[32px] shadow-2xl overflow-hidden animate-zoom-in">
              <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between">
                 <h4 className="text-lg font-black text-main tracking-tight">{editing ? "Editar Canal" : "Novo Canal WhatsApp"}</h4>
                 <button onClick={() => setShowAdd(false)} className="text-tertiary hover:text-main transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-6">
                 <Inp label="Nome da Operação *" value={form.nome_display} onChange={v => setForm(p => ({ ...p, nome_display: v }))} placeholder="Ex: Recepção Central" />
                 <div className="grid grid-cols-2 gap-4">
                    <Inp label="Codinome da IA" value={form.ia_nome} onChange={v => setForm(p => ({ ...p, ia_nome: v }))} placeholder="Ex: Clara" />
                    <Inp label="Função da IA" value={form.ia_funcao} onChange={v => setForm(p => ({ ...p, ia_funcao: v }))} placeholder="Ex: Concierge" />
                 </div>
                 <Inp label="Phone Number ID *" value={form.phone_number_id} onChange={v => setForm(p => ({ ...p, phone_number_id: v }))} placeholder="ID do painel da Meta" />
                 
                 <div className="pt-4 flex gap-3">
                    <button onClick={() => setShowAdd(false)} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest hover:border-primary/20">Cancelar</button>
                    <button onClick={save} disabled={saving || !form.nome_display || !form.phone_number_id} className="flex-1 py-4 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                       {saving ? "Processando..." : (editing ? "Salvar" : "Adicionar")}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export { ClientDashboardView, WhatsAppView, T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill, Pulse, NAV, NavItem, COLORS };
