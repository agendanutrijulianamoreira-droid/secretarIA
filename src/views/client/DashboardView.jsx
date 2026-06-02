import {
  LayoutDashboard, Users, Smartphone, MessageCircle, Bot, TrendingUp,
  Sparkles, Activity, ShieldCheck, Zap, ChevronRight, AlertCircle,
} from "lucide-react";
import { PageTitle, Card, CardHeader, Pulse } from "../../components/shared/ClientUI";

export function ClientDashboardView({ client, leads, pacientes, whatsappNums }) {
  const leadsAtivos = leads.filter(l => l.atendimento_ia === "ativo").length;
  const leadsNovos  = leads.filter(l => l.crm_status === "novo").length;
  const convertidos = leads.filter(l => l.crm_status === "convertido").length;
  const numAtivos   = whatsappNums.filter(n => n.status === "ativo").length;

  const cards = [
    { l: "Novos Leads",      v: leadsNovos,        Icon: Sparkles,      color: "text-primary",    bg: "bg-primary/10" },
    { l: "IAs em Turno",     v: leadsAtivos,        Icon: Bot,           color: "text-blue-500",   bg: "bg-blue-500/10" },
    { l: "Agendamentos",     v: convertidos,        Icon: TrendingUp,    color: "text-emerald-500",bg: "bg-emerald-500/10" },
    { l: "Total Pacientes",  v: pacientes.length,   Icon: Users,         color: "text-purple-500", bg: "bg-purple-500/10" },
    { l: "Canais WhatsApp",  v: numAtivos,          Icon: Smartphone,    color: "text-amber-500",  bg: "bg-amber-500/10" },
    { l: "Interações Hoje",  v: client.msgs_today||0, Icon: MessageCircle, color: "text-tertiary", bg: "bg-slate-500/10" },
  ];

  const briefing = client.briefing || {};
  const pct = [briefing.description, briefing.ai_name, briefing.ai_tone, briefing.ai_goal, briefing.business_hours].filter(Boolean).length * 20;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageTitle icon={LayoutDashboard} title={`Olá, ${client.name?.split(" ")[0]}`} subtitle="Aqui está o pulso da sua operação hoje." />

      {pct < 80 && (
        <div className="p-6 rounded-[28px] bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><AlertCircle size={80} className="text-amber-500" /></div>
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><AlertCircle size={28} /></div>
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {cards.map(({ l, v, Icon, color, bg }) => (
          <div key={l} className="bento-card group cursor-pointer">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-500 mb-4`}>
                <Icon size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">{l}</h4>
                <div className="text-3xl font-bold text-main tracking-tighter">{v}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <CardHeader title="Atendimento de Inteligência" subtitle="Sessões ativas sendo processadas em tempo real." action={<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest"><div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Live</div>} />
          <div className="p-6 space-y-3">
            {leads.filter(l => l.atendimento_ia === "ativo").slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center gap-5 p-5 rounded-2xl bg-surface-up/20 border border-border-subtle group hover:border-primary/30 transition-all duration-300 cursor-pointer">
                <Pulse status="online" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-main truncate">{l.nome || l.telefone}</div>
                  <div className="text-[9px] text-tertiary font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                    <Activity size={10} className="text-primary" /> Atendimento em curso
                  </div>
                </div>
                <button className="h-10 w-10 rounded-xl bg-surface-up/50 flex items-center justify-center text-tertiary group-hover:text-primary transition-all">
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            ))}
            {leads.filter(l => l.atendimento_ia === "ativo").length === 0 && (
              <div className="py-20 text-center opacity-30 flex flex-col items-center">
                <ShieldCheck size={48} strokeWidth={1} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">SecretarIA em prontidão</p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="bg-primary/5 border-primary/20 p-10 flex flex-col items-center text-center gap-6 group">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-20 w-20 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500 mb-6">
                <Zap size={40} className="fill-current" strokeWidth={1} />
              </div>
              <h4 className="text-xl font-black text-main tracking-tight uppercase">Motor de Elite</h4>
              <p className="text-xs text-secondary font-medium mt-3 leading-relaxed">Sua SecretarIA está operando em alta performance no plano <span className="text-primary font-bold uppercase tracking-widest">{client.plan}</span>.</p>
              <div className="mt-8 flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Sistemas Normais</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
