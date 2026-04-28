import React from 'react';
import { 
  LayoutDashboard, Users, Settings, Bell, Bot, Zap, Power, 
  BarChart2, GitBranch, Key, DollarSign, ShoppingCart, Moon, Sun, ChevronRight,
  Activity, ShieldCheck, Search
} from 'lucide-react';
import { Logo } from '../components/UI';

const NAV_ITEMS = [
  { id: "dashboard",  icon: LayoutDashboard, label: "Overview" },
  { id: "clients",    icon: Users,           label: "Portfólios" },
  { id: "vendas",     icon: ShoppingCart,    label: "Pipeline" },
  { id: "alerts",     icon: Bell,            label: "Eventos" },
  { id: "stats",      icon: BarChart2,       label: "Cognição" },
  { id: "settings",   icon: Settings,        label: "Protocolos" },
];

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button 
      onClick={onClick} 
      className={`
        w-full group flex items-center gap-5 px-6 py-4.5 rounded-[20px] transition-all duration-500 relative overflow-hidden
        ${active 
          ? 'bg-primary/10 text-primary shadow-2xl shadow-primary/5 border border-primary/20' 
          : 'text-tertiary hover:text-secondary hover:bg-surface/50'
        }
      `}
    >
      {active && (
        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
      )}
      <Icon size={20} strokeWidth={active ? 2.5 : 2} className={`${active ? 'text-primary' : 'text-tertiary group-hover:text-secondary'} transition-all duration-500 group-hover:scale-110`} />
      <span className={`text-[10px] font-black uppercase tracking-[0.3em] flex-1 text-left ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>{label}</span>
      {badge > 0 && (
        <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-lg bg-primary text-black text-[9px] font-black shadow-lg shadow-primary/20">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function SecretariaDashboard({ user, logout, setView, activeView, alertCount = 0, children, theme, toggleTheme }) {
  const VIEW_LABELS = {
    dashboard: "Central de Operações", 
    clients: "Gestão de Portfólios",
    vendas: "Pipeline de Aquisição",
    stats: "Inteligência de Dados", 
    alerts: "Monitoramento de Eventos", 
    settings: "Configurações do Núcleo",
  };

  return (
    <div className="flex min-h-screen bg-bg text-main selection:bg-primary/20 selection:text-primary font-sans overflow-hidden">
      {/* Sidebar Obsidian */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-[320px] flex flex-col bg-bg border-r border-border overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.1),transparent)]" />
        </div>

        <div className="p-12 pb-10 relative z-10">
          <Logo size={42} />
        </div>

        <div className="px-10 mb-10 relative z-10">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-surface-up/30 border border-primary/20 backdrop-blur-md shadow-2xl">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-primary">Quantum Core Active</span>
          </div>
        </div>

        <nav className="flex-1 px-8 space-y-3 overflow-y-auto custom-scrollbar relative z-10">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeView === item.id}
              onClick={() => setView(item.id)}
              badge={item.id === "alerts" ? alertCount : 0}
            />
          ))}
        </nav>

        <div className="p-10 border-t border-border bg-bg/80 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-5 p-5 rounded-[24px] bg-surface/50 border border-border-subtle mb-6 group hover:border-primary/20 transition-all duration-500">
            <div className="h-12 w-12 rounded-[14px] bg-primary/10 flex items-center justify-center text-primary font-black text-base border border-primary/20 shadow-2xl group-hover:rotate-6 transition-all duration-500">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-main uppercase tracking-tight truncate italic">Dra. Juliana</span>
              <span className="text-[9px] text-tertiary font-black uppercase tracking-widest mt-0.5 opacity-60">Admin Root</span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-4 py-5 rounded-[20px] bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/10 hover:bg-red-500 hover:text-black transition-all duration-500 group cursor-pointer"
          >
            <Power size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>Encerrar Ciclo</span>
          </button>
        </div>
      </aside>

      {/* Main Framework Area */}
      <main className="flex-1 ml-[320px] flex flex-col h-screen overflow-hidden relative">
        <header className="sticky top-0 z-40 h-24 flex items-center justify-between px-16 bg-bg/80 backdrop-blur-2xl border-b border-border">
          <div className="flex items-center gap-10">
             <div className="flex flex-col">
               <h2 className="text-2xl font-black text-main tracking-tighter uppercase italic">
                 {VIEW_LABELS[activeView] || activeView}
               </h2>
               <div className="flex items-center gap-3 mt-1.5">
                 <div className="h-1 w-8 bg-primary/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress-fast" />
                 </div>
                 <span className="text-[9px] text-tertiary font-black uppercase tracking-[0.3em] opacity-60">Sincronização Neural Estável</span>
               </div>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative group hidden md:block">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="COMANDAR SISTEMA..." 
                 className="bg-surface/50 border border-border-subtle rounded-full py-3.5 pl-12 pr-6 text-[10px] font-black tracking-[0.2em] text-main placeholder:text-tertiary/40 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all w-64"
               />
            </div>

            <button 
              onClick={toggleTheme}
              className="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface/50 border border-border-subtle text-tertiary hover:text-primary hover:border-primary/40 transition-all duration-500 shadow-xl"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="h-10 w-[1px] bg-surface" />
            
            <button className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all duration-500 group cursor-pointer">
              <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Security Hub</span>
            </button>
          </div>
        </header>

        <section className="flex-1 p-16 animate-fade-in overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03),transparent)]">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </section>
      </main>
    </div>
  );
}
