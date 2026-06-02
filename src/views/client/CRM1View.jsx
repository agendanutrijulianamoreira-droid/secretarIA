import { useState } from "react";
import { Search, ShieldCheck, MessageSquare, Target, Activity, Sparkles, TrendingUp } from "lucide-react";
import { Inp, PageTitle } from "../../pages/ClientPortal";
import { LeadCard } from "./LeadCard";

const FILTER_LABELS = {
  todos:        "Todos os Leads",
  novo:         "Lead Novo",
  contatado:    "Conversando",
  qualificado:  "Interessado",
  convertido:   "Agendado",
  perdido:      "Arquivado",
};

export default function CRM1View({ client, leads }) {
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filtered = leads.filter(l => {
    const ms = (l.nome || "").toLowerCase().includes(search.toLowerCase()) || l.telefone?.includes(search);
    const mf = filterStatus === "todos" || l.crm_status === filterStatus;
    return ms && mf;
  });

  const stats = [
    { label: "Total Prospecção",    value: leads.length,                                    color: "text-main",         icon: Target },
    { label: "IA em Turno",         value: leads.filter(l => l.atendimento_ia === "ativo").length, color: "text-primary", icon: Activity },
    { label: "Leads Qualificados",  value: leads.filter(l => l.crm_status === "novo").length,      color: "text-cta",    icon: Sparkles },
    { label: "Taxa de Sucesso",     value: leads.filter(l => l.crm_status === "convertido").length, color: "text-emerald-500", icon: TrendingUp },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={MessageSquare} title="Funil de Leads" subtitle="Acompanhe as prospecções e atendimentos da sua IA." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-surface-up/50 flex items-center justify-center text-tertiary group-hover:text-primary group-hover:scale-110 transition-all duration-500 mb-6">
                <s.icon size={22} strokeWidth={2.5} />
              </div>
              <h4 className={`text-4xl font-black tracking-tighter ${s.color}`}>{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-2.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
          <Inp value={search} onChange={v => setSearch(v)} placeholder="Pesquisar prospecções por nome ou terminal..." icon={Search} />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 lg:pb-0 w-full lg:w-auto no-scrollbar scroll-smooth">
          {Object.entries(FILTER_LABELS).map(([s, label]) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border cursor-pointer ${filterStatus === s ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40 hover:bg-surface-up'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-border-subtle rounded-[48px] opacity-30">
            <ShieldCheck size={80} strokeWidth={1} className="mx-auto mb-6 text-tertiary" />
            <p className="text-sm font-black uppercase tracking-[0.3em]">Ambiente Livre de Leads</p>
          </div>
        ) : filtered.map(lead => (
          <LeadCard key={lead.id} lead={lead} clientId={client.id} />
        ))}
      </div>
    </div>
  );
}
