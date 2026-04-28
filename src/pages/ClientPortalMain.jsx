import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  Contatos, Pacientes, WhatsAppNumbers, Servicos, Vendas,
  Campanhas, IAAprendizados, Invoices
} from "../lib/db";
import {
  ClientDashboardView, WhatsAppView,
  Btn, Card, NAV, NavItem, PageTitle
} from "./ClientPortal";
import CRM1View from "../views/client/CRM1View";
import CRM2View from "../views/client/CRM2View";
import FinanceiroClienteView from "../views/client/FinanceiroCliente";
import IAAprendizadosView from "../views/client/IAAprendizados";
import EquipeView from "../views/client/EquipeView";
import MarketingView from "../views/client/MarketingView";
import SettingsView from "../views/client/SettingsView";
import OnboardingChat from "../views/client/OnboardingChat";
import { Logo } from "../components/UI";
import { Zap, Star, Settings, Power, ChevronRight, Bell, Activity, Brain, CheckCircle2 } from "lucide-react";

const PLAN_META = {
  Starter: { color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
  Pro:     { color: "var(--color-primary)",  bg: "rgba(16,185,129,0.1)" },
  Enterprise: { color: "var(--color-cta)", bg: "rgba(202,138,4,0.1)" },
};

// ── Plano View (Premium Refactor) ──────────────────────────────────────────
function PlanoView({ client, invoices }) {
  const pm = PLAN_META[client.plan] || PLAN_META.Starter;
  const plans = [
    { p: "Starter", price: "197", impl: "900", wpp: 1, f: ["IA de Texto", "1 Número WhatsApp", "CRM de Leads", "Suporte 24h"] },
    { p: "Pro",     price: "497", impl: "1.200", wpp: 3, f: ["IA Multimodal", "3 Números WhatsApp", "CRM Completo", "Campanhas Automáticas", "Google Agenda"] },
    { p: "Enterprise", price: "997", impl: "2.500", wpp: 5, f: ["Tudo do Pro", "Ilimitados Números", "Workflows Custom", "Onboarding VIP"] },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={Star} title="Gestão de Assinatura" subtitle="Veja seus recursos ativos e histórico de faturamento." />

      <div className="bento-card bg-surface-up/20 border-primary/20 flex flex-col md:flex-row items-center justify-between p-12 gap-8">
         <div className="flex-1">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">Sua Licença Ativa</span>
            <h2 className="text-6xl font-black text-main tracking-tighter mt-6">{client.plan}</h2>
            <p className="text-secondary font-medium mt-4 text-lg">Seu ecossistema está operando em alta performance.</p>
         </div>
         <div className="h-40 w-40 rounded-[40px] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-2xl shadow-primary/10">
            <Zap size={80} className="text-primary animate-pulse" strokeWidth={1} />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(({ p, price, impl, wpp, f }) => {
          const isCurrent = client.plan === p;
          return (
            <div key={p} className={`bento-card group flex flex-col h-full ${isCurrent ? 'border-primary/50 shadow-primary/10' : 'opacity-80'}`}>
              <div className="premium-glow" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xl font-black text-main tracking-tight uppercase">{p}</h4>
                  {isCurrent && <div className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </div>
                
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-sm font-bold text-tertiary">R$</span>
                  <span className="text-5xl font-black text-main tracking-tighter">{price}</span>
                  <span className="text-tertiary font-bold text-[10px] uppercase tracking-widest">/mês</span>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  {f.map(x => (
                    <div key={x} className="flex items-start gap-3 text-xs font-medium text-secondary">
                      <CheckCircle2 size={16} className="text-primary mt-0.5" strokeWidth={3} />
                      <span>{x}</span>
                    </div>
                  ))}
                </div>

                {!isCurrent ? (
                  <Btn variant="ghost" className="w-full">Migrar para {p}</Btn>
                ) : (
                  <div className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 rounded-2xl border border-primary/20">Plano Atual</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
          <Activity size={20} className="text-primary" />
          Histórico de Faturamento
        </h3>
        <div className="bento-card p-0 overflow-hidden">
           {invoices.length === 0 ? (
             <div className="p-20 text-center text-tertiary font-medium italic">Nenhuma cobrança registrada.</div>
           ) : (
             <div className="divide-y divide-border-subtle">
               {invoices.map(inv => (
                 <div key={inv.id} className="p-8 flex items-center gap-8 group hover:bg-surface-up/30 transition-all cursor-pointer">
                   <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${inv.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                     {inv.status === "pago" ? <CheckCircle2 size={24} /> : <Activity size={24} />}
                   </div>
                   <div className="flex-1">
                     <p className="text-base font-bold text-main">{inv.descricao}</p>
                     <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1.5">{inv.due_date}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-lg font-black text-main tracking-tight">R$ {Number(inv.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                     <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block ${inv.status === 'pago' ? 'text-emerald-500' : 'text-amber-500'}`}>{inv.status}</span>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

// ── Main Portal ────────────────────────────────────────────────────────────
export default function ClientPortalMain({ client, onBack }) {
  const [view, setView]           = useState("dashboard");
  const [leads, setLeads]         = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [numbers, setNumbers]     = useState([]);
  const [servicos, setServicos]   = useState([]);
  const [vendas, setVendas]       = useState([]);
  const [aprendizados, setAprendizados] = useState([]);
  const [invoices, setInvoices]   = useState([]);

  const numPendentes = aprendizados.filter(a => a.status === "pendente").length;

  useEffect(() => {
    const subs = [
      Contatos.onList(client.id, setLeads),
      Pacientes.onList(client.id, setPacientes),
      Campanhas.onList(client.id, setCampanhas),
      WhatsAppNumbers.onList(client.id, setNumbers),
      Servicos.onList(client.id, setServicos),
      Vendas.onList(client.id, setVendas),
      IAAprendizados.onList(client.id, setAprendizados),
      Invoices.onList(client.id, setInvoices),
    ];
    return () => subs.forEach(fn => fn && fn());
  }, [client.id]);

  const reloadNumbers = () => WhatsAppNumbers.list(client.id).then(setNumbers);
  const initials = client.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const VIEW_LABELS = {
    dashboard: "Dashboard de Inteligência",
    whatsapp: "Canais WhatsApp",
    crm1: "Funil de Leads",
    crm2: "Gestão de Pacientes", 
    equipe: "Equipe & Agenda", 
    financeiro: "Financeiro & Vendas", 
    marketing: "Marketing & Vendas",
    ia: "Cérebro da IA", 
    plano: "Plano & Cobrança",
    settings: "Configurações",
  };

  if (client.status === "onboarding" || client.status === "setup") {
    return <OnboardingChat client={client} onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="flex min-h-screen bg-background text-main font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      {/* Sidebar Refactor */}
      <aside className="w-[300px] glass-card border-r-0 border-l-0 rounded-none flex flex-col fixed h-screen z-[100]">
        <div className="p-10 flex items-center justify-between">
           <Logo size={32} />
           <div className="flex gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
           </div>
        </div>

        <div className="px-6 py-4">
           <div className="flex items-center gap-4 p-5 rounded-3xl bg-surface-up/30 border border-border-subtle group hover:border-primary/20 transition-all cursor-pointer">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
                 {initials}
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-xs font-black text-main truncate leading-none uppercase tracking-tight">{client.name}</h4>
                 <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{client.plan}</span>
                 </div>
              </div>
           </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
           {NAV.map(item => (
             <div key={item.id} className="relative">
                <NavItem item={item} active={view === item.id} onClick={() => setView(item.id)} />
                {item.id === "ia" && numPendentes > 0 && (
                  <span className="absolute top-3.5 right-5 h-5 w-5 rounded-full bg-cta text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-cta/20 ring-4 ring-surface">
                    {numPendentes}
                  </span>
                )}
             </div>
           ))}
        </nav>

        <div className="p-8 space-y-4">
           {onBack && (
             <Btn variant="ghost" className="w-full" onClick={onBack} icon={Settings}>Admin Portal</Btn>
           )}
           <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all cursor-pointer">
              <Power size={14} strokeWidth={3} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Refactor */}
      <main className="flex-1 ml-[300px] min-h-screen flex flex-col relative">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cta/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header Refactor */}
        <header className="h-24 bg-background/50 backdrop-blur-3xl border-b border-border-subtle sticky top-0 z-[90] px-12 flex items-center justify-between">
           <div>
              <h2 className="text-sm font-black text-main uppercase tracking-[0.3em] opacity-80">{VIEW_LABELS[view]}</h2>
           </div>
           <div className="flex items-center gap-8">
              {numbers.some(n => n.status === "ativo") && (
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-500">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sistemas Operantes</span>
                </div>
              )}
              <div className="h-12 w-12 rounded-2xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-secondary hover:text-primary transition-all cursor-pointer relative group">
                 <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                 <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-4 border-background" />
              </div>
           </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 p-12 overflow-x-hidden relative z-10">
           <div className="max-w-7xl mx-auto pb-20">
              {view === "dashboard"  && <ClientDashboardView client={client} leads={leads} pacientes={pacientes} whatsappNums={numbers} />}
              {view === "whatsapp"   && <WhatsAppView client={client} numbers={numbers} reload={reloadNumbers} />}
              {view === "crm1"       && <CRM1View client={client} leads={leads} />}
              {view === "crm2"       && <CRM2View client={client} pacientes={pacientes} campanhas={campanhas} />}
              {view === "equipe"     && <EquipeView client={client} />}
              {view === "financeiro" && <FinanceiroClienteView client={client} servicos={servicos} vendas={vendas} invoices={invoices} />}
              {view === "marketing"  && <MarketingView client={client} />}
              {view === "ia"         && <IAAprendizadosView client={client} aprendizados={aprendizados} />}
              {view === "plano"      && <PlanoView client={client} invoices={invoices} />}
              {view === "settings"   && <SettingsView client={client} />}
           </div>
        </div>
      </main>
    </div>
  );
}
