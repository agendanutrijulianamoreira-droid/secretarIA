import {
  Users, Smartphone, MessageCircle, Bot, TrendingUp,
  Sparkles, ShieldCheck, Zap, ChevronRight,
  AlertCircle, ArrowUpRight, ArrowDownRight,
  BarChart2,
} from "lucide-react";
import { Pulse } from "../../components/shared/ClientUI";

function StatCard({ label, value, icon: Icon, color, bg, trend, trendLabel }) {
  const isUp = trend >= 0;
  return (
    <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center ${color}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${isUp ? "text-emerald-500" : "text-red-500"}`}>
            {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-main tracking-tight">{value}</div>
        <div className="text-xs text-tertiary font-medium mt-0.5">{label}</div>
        {trendLabel && <div className="text-[10px] text-tertiary mt-1">{trendLabel}</div>}
      </div>
    </div>
  );
}

function ActivityRow({ lead }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0 group hover:bg-surface-up/50 -mx-5 px-5 transition-all cursor-pointer">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <MessageCircle size={14} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-main truncate">{lead.nome || lead.telefone}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Pulse status="online" />
          <span className="text-[10px] text-tertiary">Atendimento em curso</span>
        </div>
      </div>
      <ChevronRight size={14} className="text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

function ProgressBar({ label, value, max, color = "bg-primary" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary font-medium">{label}</span>
        <span className="text-xs font-semibold text-main">{value}</span>
      </div>
      <div className="h-1.5 bg-surface-up rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ClientDashboardView({ client, leads, pacientes, whatsappNums }) {
  const leadsAtivos   = leads.filter(l => l.atendimento_ia === "ativo").length;
  const leadsNovos    = leads.filter(l => l.crm_status === "novo").length;
  const convertidos   = leads.filter(l => l.crm_status === "convertido").length;
  const qualificados  = leads.filter(l => l.crm_status === "qualificado").length;
  const numAtivos     = whatsappNums.filter(n => n.status === "ativo").length;
  const totalLeads    = leads.length;

  const briefing = client.briefing || {};
  const pct = [briefing.description, briefing.ai_name, briefing.ai_tone, briefing.ai_goal, briefing.business_hours].filter(Boolean).length * 20;

  const stats = [
    { label: "Novos Leads",     value: leadsNovos,         icon: Sparkles,     color: "text-violet-500",  bg: "bg-violet-500/10",  trend: 12, trendLabel: "vs. mês anterior" },
    { label: "IAs em Turno",    value: leadsAtivos,        icon: Bot,          color: "text-blue-500",    bg: "bg-blue-500/10",    trend: 8,  trendLabel: "sessões ativas" },
    { label: "Convertidos",     value: convertidos,        icon: TrendingUp,   color: "text-emerald-500", bg: "bg-emerald-500/10", trend: 5,  trendLabel: "este mês" },
    { label: "Total Clientes",  value: pacientes.length,   icon: Users,        color: "text-orange-500",  bg: "bg-orange-500/10",  trend: 3,  trendLabel: "cadastrados" },
    { label: "Canais WhatsApp", value: numAtivos,          icon: Smartphone,   color: "text-green-500",   bg: "bg-green-500/10" },
    { label: "Interações Hoje", value: client.msgs_today || 0, icon: MessageCircle, color: "text-slate-500", bg: "bg-slate-500/10" },
  ];

  const activeLeads = leads.filter(l => l.atendimento_ia === "ativo").slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-main">Olá, {client.name?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-secondary mt-0.5">Aqui está o pulso da sua operação hoje.</p>
      </div>

      {/* Setup alert */}
      {pct < 80 && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Configure sua IA para melhor desempenho</p>
            <div className="mt-2 h-1.5 w-full bg-amber-200 rounded-full overflow-hidden max-w-xs">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-sm font-bold text-amber-700 shrink-0">{pct}%</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active sessions */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-main">Atendimentos Ativos</h3>
              <p className="text-[11px] text-tertiary mt-0.5">Sessões sendo processadas em tempo real</p>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="px-5">
            {activeLeads.length > 0
              ? activeLeads.map(l => <ActivityRow key={l.id} lead={l} />)
              : (
                <div className="py-16 flex flex-col items-center text-center gap-3 text-tertiary">
                  <ShieldCheck size={36} strokeWidth={1.5} className="opacity-40" />
                  <p className="text-xs font-medium">SecretarIA em prontidão</p>
                  <p className="text-[11px] opacity-60">Nenhum atendimento ativo no momento</p>
                </div>
              )
            }
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Status card */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap size={20} className="text-primary fill-primary/20" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-main">Motor de Elite</h3>
                <p className="text-[11px] text-tertiary">Plano <span className="text-primary font-semibold">{client.plan}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-emerald-700">Todos os sistemas operantes</span>
            </div>
          </div>

          {/* Funil card */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-main">Funil de Leads</h3>
              <BarChart2 size={15} className="text-tertiary" />
            </div>
            <div className="space-y-3">
              <ProgressBar label="Novos"       value={leadsNovos}   max={totalLeads} color="bg-blue-500" />
              <ProgressBar label="Interessados" value={qualificados} max={totalLeads} color="bg-violet-500" />
              <ProgressBar label="Convertidos"  value={convertidos}  max={totalLeads} color="bg-emerald-500" />
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-tertiary">Total de leads</span>
              <span className="text-sm font-bold text-main">{totalLeads}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
