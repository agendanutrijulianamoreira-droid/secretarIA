import { LayoutDashboard, MessageSquare, Users, Wallet, Bot, Brain, Star, Settings, Calendar, Megaphone, Cpu } from "lucide-react";
import { COLORS } from "../../design-system/tokens";

export { COLORS };

export const T = {
  bg: "var(--color-bg)", surface: "var(--color-surface)", up: "var(--color-surface-up)",
  border: "var(--color-border)", borderSt: "var(--color-border-subtle)",
  green: "var(--color-primary)", greenDim: "rgba(16,185,129,0.1)",
  amber: "#E3B341", amberDim: "rgba(227,179,65,0.1)",
  red: "#F85149", redDim: "rgba(248,81,73,0.1)",
  cyan: "var(--color-cta)", cyanDim: "rgba(14,165,233,0.10)",
  purple: "#8B5CF6", purpleDim: "rgba(139,92,246,0.1)",
  ink: "var(--color-text-main)", inkSec: "var(--color-text-secondary)", inkTert: "var(--color-text-tertiary)",
};

export function Pill({ children, color, bg }) {
  return <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ color, backgroundColor: bg, borderColor: color + '33' }}>{children}</span>;
}

export function Pulse({ status }) {
  const colors = { online: 'bg-emerald-500', offline: 'bg-red-500', pendente: 'bg-amber-500' };
  const c = colors[status] || 'bg-slate-400';
  return (
    <div className="relative flex items-center justify-center w-2 h-2">
      {status === "online" && <span className={`absolute inline-flex h-full w-full rounded-full ${c} opacity-75 animate-ping`} />}
      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${c}`} />
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", size = "md", style: sx = {}, disabled, icon: Icon, className = "" }) {
  const variants = {
    primary: "btn-premium btn-premium-primary",
    ghost:   "btn-premium btn-premium-ghost",
    danger:  "btn-premium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white",
    cyan:    "btn-premium bg-cta text-white shadow-lg shadow-cta/20",
  };
  const sizes = { sm: "px-4 py-2 text-[10px]", md: "px-6 py-3 text-[11px]" };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} className={`${variants[variant]} ${sizes[size]} ${className}`} style={sx}>
      <div className="flex items-center justify-center gap-2">
        {Icon && <Icon size={14} strokeWidth={2.5} />}
        {children}
      </div>
    </button>
  );
}

export function Inp({ label, value, onChange, placeholder, rows, type = "text", icon: Icon }) {
  const base   = "w-full pl-12 pr-5 py-4 bg-surface-up/20 border border-border-subtle rounded-2xl text-main placeholder:text-tertiary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 text-sm";
  const noIcon = "w-full px-5 py-4 bg-surface-up/20 border border-border-subtle rounded-2xl text-main placeholder:text-tertiary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 text-sm";
  return (
    <div className="flex flex-col gap-2.5">
      {label && <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">{label}</label>}
      <div className="relative flex items-center w-full">
        {Icon && <Icon className="absolute left-4 text-tertiary group-focus-within:text-primary transition-colors" size={18} strokeWidth={2.5} />}
        {rows
          ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className={`${Icon ? base : noIcon} resize-none`} />
          : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={Icon ? base : noIcon} />}
      </div>
    </div>
  );
}

export function Card({ children, style: sx = {}, className = "" }) {
  return (
    <div className={`bento-card group ${className}`} style={sx}>
      <div className="premium-glow" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
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

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="py-12 px-6 flex flex-col items-center text-center gap-3">
      <div className="text-4xl filter grayscale opacity-40 transition-all">{icon}</div>
      <h5 className="text-sm font-bold text-secondary">{title}</h5>
      {subtitle && <p className="text-xs text-tertiary max-w-[200px]">{subtitle}</p>}
    </div>
  );
}

export function PageTitle({ icon: Icon, title, subtitle }) {
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

export const NAV = [
  { id: "dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { id: "whatsapp",   icon: Bot,             label: "WhatsApp" },
  { id: "agentes",    icon: Cpu,             label: "Agentes IA" },
  { id: "crm1",       icon: MessageSquare,   label: "CRM — Leads" },
  { id: "crm2",       icon: Users,           label: "CRM — Clientes" },
  { id: "equipe",     icon: Calendar,        label: "Equipe & Agenda" },
  { id: "financeiro", icon: Wallet,          label: "Financeiro" },
  { id: "marketing",  icon: Megaphone,       label: "Marketing & Vendas" },
  { id: "ia",         icon: Brain,           label: "IA Aprendizados" },
  { id: "plano",      icon: Star,            label: "Meu Plano" },
  { id: "settings",   icon: Settings,        label: "Configurações" },
];

export function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-secondary hover:bg-surface-up hover:text-main'
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 2} className="shrink-0 transition-colors" />
      <span className={`text-[12px] font-medium flex-1 text-left ${active ? 'font-semibold' : ''}`}>{item.label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
    </button>
  );
}
