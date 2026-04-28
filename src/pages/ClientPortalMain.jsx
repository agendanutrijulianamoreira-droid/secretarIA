import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  Contatos, Pacientes, WhatsAppNumbers, Servicos, Vendas,
  Campanhas, IAAprendizados, Invoices
} from "../lib/db";
import {
  ClientDashboardView, WhatsAppView,
  T, Btn, Card, NAV, NavItem, PageTitle
} from "./ClientPortal";
import CRM1View from "../views/client/CRM1View";
import CRM2View from "../views/client/CRM2View";
import FinanceiroClienteView from "../views/client/FinanceiroCliente";
import IAAprendizadosView from "../views/client/IAAprendizados";
import EquipeView from "../views/client/EquipeView";
import OnboardingChat from "../views/client/OnboardingChat";
import { Logo } from "../components/UI";
import { Zap, Star, Settings, Power, ChevronRight, Bell, Activity, Brain, Sun, Moon } from "lucide-react";

/* Premium pill toggle */
function ThemeToggle({ theme, toggleTheme }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="relative h-9 w-[72px] rounded-full bg-surface-up border border-border-subtle hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-inner"
    >
      <Sun  size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 opacity-50 pointer-events-none" />
      <Moon size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-400 opacity-50 pointer-events-none" />
      <span className={`absolute top-1 h-7 w-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-in-out ${
        isDark ? 'left-[38px] bg-slate-800 text-blue-300' : 'left-1 bg-white text-amber-500'
      }`}>
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}

const PLAN_META = {
  Starter: { color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
  Pro:     { color: "var(--color-primary)",  bg: "rgba(16,185,129,0.1)" },
  Enterprise: { color: "#E3B341", bg: "rgba(227,179,65,0.1)" },
};

// ── Plano View ─────────────────────────────────────────────────────────────
function PlanoView({ client, invoices }) {
  const pm = PLAN_META[client.plan] || PLAN_META.Starter;
  const plans = [
    { p: "Starter", price: "197", impl: "900", wpp: 1, f: ["IA de Texto", "1 Número WhatsApp", "CRM de Leads", "Suporte 24h"] },
    { p: "Pro",     price: "497", impl: "1.200", wpp: 3, f: ["IA Multimodal", "3 Números WhatsApp", "CRM Completo", "Campanhas Automáticas", "Google Agenda"] },
    { p: "Enterprise", price: "997", impl: "2.500", wpp: 5, f: ["Tudo do Pro", "Ilimitados Números", "Workflows Custom", "Onboarding VIP"] },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageTitle icon={Star} title="Gestão de Assinatura" subtitle="Veja seus recursos ativos e histórico de faturamento." />

      <div className="p-10 rounded-[40px] bg-surface border border-primary/20 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-5">
            <Zap size={120} className="text-primary" />
         </div>
         <div className="relative z-10">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 border border-primary/20">Plano Atual</span>
            <h2 className="text-5xl font-black text-main tracking-tighter mt-4">{client.plan}</h2>
            <p className="text-secondary font-medium mt-2">Sua licença está ativa e operante.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(({ p, price, impl, wpp, f }) => {
          const isCurrent = client.plan === p;
          return (
            <div key={p} className={`p-8 rounded-[32px] bg-surface border transition-all duration-500 ${isCurrent ? 'border-primary/40 shadow-xl shadow-primary/5 ring-1 ring-primary/20' : 'border-border-subtle opacity-70 hover:opacity-100'}`}>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-black text-main">{p}</h4>
                {isCurrent && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-sm font-bold text-tertiary">R$</span>
                <span className="text-4xl font-black text-main tracking-tighter">{price}</span>
                <span className="text-tertiary font-bold text-xs uppercase">/mês</span>
              </div>
              <div className="space-y-3 mb-10">
                {f.map(x => (
                  <div key={x} className="flex items-center gap-3 text-xs font-medium text-secondary">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <ChevronRight size={10} />
                    </div>
                    {x}
                  </div>
                ))}
              </div>
              {!isCurrent && (
                <button className="w-full py-4 rounded-2xl bg-surface-up border border-border-subtle text-main text-[10px] font-black uppercase tracking-widest hover:border-primary/30 transition-all">Migrar Plano</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight px-2">Histórico de Faturamento</h3>
        <div className="bg-surface border border-border-subtle rounded-[32px] overflow-hidden">
           {invoices.length === 0 ? (
             <div className="p-12 text-center text-tertiary font-medium italic">Nenhuma cobrança registrada.</div>
           ) : (
             <div className="divide-y divide-border-subtle/50">
               {invoices.map(inv => (
                 <div key={inv.id} className="p-6 flex items-center gap-6 group hover:bg-surface-soft transition-colors">
                   <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${inv.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                     {inv.status === "pago" ? "✓" : "⚡"}
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-bold text-main">{inv.descricao}</p>
                     <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">{inv.due_date}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-black text-main">R$ {Number(inv.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                     <span className={`text-[9px] font-black uppercase tracking-widest ${inv.status === 'pago' ? 'text-emerald-500' : 'text-amber-500'}`}>{inv.status}</span>
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
export default function ClientPortalMain({ client, onBack, theme = 'light', toggleTheme }) {
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
    crm2: "Gestão de Pacientes", equipe: "Equipe & Agenda", financeiro: "Financeiro & Vendas", ia: "Cérebro da IA", plano: "Plano & Cobrança",
  };

  if (client.status === "onboarding" || client.status === "setup") {
    return <OnboardingChat client={client} onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="flex min-h-screen bg-background text-main transition-colors duration-300 selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-[280px] bg-surface border-r border-border-subtle flex flex-col fixed h-screen z-[100] transition-colors duration-300">
        <div className="p-8 border-b border-border-subtle flex items-center justify-between">
           <Logo size={28} />
           <div className="flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-surface-up" />
           </div>
        </div>

        <div className="p-6 border-b border-border-subtle">
           <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-soft/50 border border-border-subtle">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shadow-inner">
                 {initials}
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="text-xs font-black text-main truncate leading-none uppercase tracking-tight">{client.name}</h4>
                 <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">{client.plan}</span>
                 </div>
              </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
           {NAV.map(item => (
             <div key={item.id} className="relative">
                <NavItem item={item} active={view === item.id} onClick={() => setView(item.id)} />
                {item.id === "ia" && numPendentes > 0 && (
                  <span className="absolute top-3 right-4 h-5 w-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center shadow-lg shadow-amber-500/20 ring-4 ring-surface">
                    {numPendentes}
                  </span>
                )}
             </div>
           ))}
        </nav>

        <div className="p-6 border-t border-border-subtle space-y-3">
           {onBack && (
             <button onClick={onBack} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-up border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-widest hover:border-primary/20 transition-all">
                <ChevronRight size={14} className="rotate-180" /> Admin
             </button>
           )}
           <button onClick={() => signOut(auth)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
              <Power size={14} /> Encerrar Sessão
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[280px] min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-background/80 backdrop-blur-xl border-b border-border-subtle sticky top-0 z-90 px-10 flex items-center justify-between transition-colors duration-300">
           <div>
              <h2 className="text-sm font-black text-main uppercase tracking-[0.2em]">{VIEW_LABELS[view]}</h2>
           </div>
           <div className="flex items-center gap-4">
              {numbers.some(n => n.status === "ativo") && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp Ativo</span>
                </div>
              )}
              {toggleTheme && <ThemeToggle theme={theme} toggleTheme={toggleTheme} />}
              <div className="h-10 w-10 rounded-xl bg-surface border border-border-subtle flex items-center justify-center text-secondary hover:text-primary transition-colors cursor-pointer relative">
                 <Bell size={18} />
                 <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
              </div>
           </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-10 overflow-x-hidden">
           <div className="max-w-7xl mx-auto">
              {view === "dashboard"  && <ClientDashboardView client={client} leads={leads} pacientes={pacientes} whatsappNums={numbers} />}
              {view === "whatsapp"   && <WhatsAppView client={client} numbers={numbers} reload={reloadNumbers} />}
              {view === "crm1"       && <CRM1View client={client} leads={leads} />}
              {view === "crm2"       && <CRM2View client={client} pacientes={pacientes} campanhas={campanhas} />}
              {view === "equipe"     && <EquipeView client={client} />}
              {view === "financeiro" && <FinanceiroClienteView client={client} servicos={servicos} vendas={vendas} invoices={invoices} />}
              {view === "ia"         && <IAAprendizadosView client={client} aprendizados={aprendizados} />}
              {view === "plano"      && <PlanoView client={client} invoices={invoices} />}
           </div>
        </div>
      </main>
    </div>
  );
}
