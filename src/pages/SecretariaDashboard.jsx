import React from 'react';
import {
  LayoutDashboard, Users, Settings, Bell, Bot, Zap, Power,
  BarChart2, GitBranch, Key, DollarSign, ShoppingCart, Moon, Sun, ChevronRight
} from 'lucide-react';
import { Button, Badge, Logo } from '../components/UI';

const NAV_ITEMS = [
  { id: "dashboard",  icon: LayoutDashboard, label: "Visão Geral" },
  { id: "clients",    icon: Users,           label: "Clientes" },
  { id: "fluxos",     icon: GitBranch,       label: "Automações" },
  { id: "tokens",     icon: Key,             label: "Tokens / API" },
  { id: "financeiro", icon: DollarSign,      label: "Financeiro" },
  { id: "vendas",     icon: ShoppingCart,    label: "Vendas" },
  { id: "stats",      icon: BarChart2,       label: "Estatísticas" },
  { id: "alerts",     icon: Bell,            label: "Notificações" },
  { id: "settings",   icon: Settings,        label: "Configurações" },
];

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        ${active
          ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
          : 'text-secondary hover:bg-surface-up hover:text-main'
        }
      `}
    >
      <Icon size={18} className={`${active ? 'text-primary' : 'text-tertiary group-hover:text-main'} transition-colors duration-200`} />
      <span className={`text-[13.5px] flex-1 ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500/10 px-1.5 text-[10px] font-bold text-amber-500 ring-1 ring-amber-500/20">
          {badge}
        </span>
      )}
      {active && <ChevronRight size={14} className="text-primary/50" />}
    </button>
  );
}

/* Premium pill toggle — slides between Sun (light) and Moon (dark) */
function ThemeToggle({ theme, toggleTheme }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="relative h-9 w-[72px] rounded-full bg-surface-up border border-border-subtle hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-inner"
    >
      {/* Static background icons */}
      <Sun  size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 opacity-50 pointer-events-none" />
      <Moon size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-400 opacity-50 pointer-events-none" />

      {/* Sliding indicator */}
      <span className={`absolute top-1 h-7 w-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-in-out ${
        isDark
          ? 'left-[38px] bg-slate-800 text-blue-300'
          : 'left-1 bg-white text-amber-500'
      }`}>
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}

export default function SecretariaDashboard({ user, logout, setView, activeView, alertCount = 0, children, theme, toggleTheme }) {
  const VIEW_LABELS = {
    dashboard: "Visão Geral",
    clients: "Gestão de Clientes",
    fluxos: "Painel de Automações",
    tokens: "Credenciais & APIs",
    financeiro: "Fluxo Financeiro",
    vendas: "Pipeline de Vendas",
    stats: "Análise de Dados",
    alerts: "Central de Notificações",
    settings: "Configurações do Sistema",
  };

  return (
    <div className="flex min-h-screen bg-background text-main transition-colors duration-300 selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-[280px] flex flex-col bg-surface border-r border-border-subtle overflow-hidden transition-colors duration-300">
        <div className="p-8 pb-4">
          <Logo size={32} />
        </div>

        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-soft border border-primary/10">
            <Zap size={14} className="text-primary" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-primary">Painel Admin Premium</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
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

        <div className="p-6 border-t border-border-subtle bg-surface/50 transition-colors duration-300">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-up border border-border-subtle mb-4 transition-colors duration-300">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/20 shadow-inner">
              {user?.email?.[0]?.toUpperCase() || 'J'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate">Dra. Juliana</span>
              <span className="text-[10px] text-tertiary uppercase font-bold tracking-tighter">Administradora</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/5 text-red-500 text-xs font-bold border border-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <Power size={14} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] flex flex-col transition-colors duration-300">
        <header className="sticky top-0 z-40 h-20 flex items-center justify-between px-10 bg-background/80 backdrop-blur-xl border-b border-border-subtle transition-colors duration-300">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-main tracking-tight">
              {VIEW_LABELS[activeView] || activeView}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] text-tertiary uppercase font-bold tracking-widest">Motor Multi-Agente Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            <div className="h-8 w-[1px] bg-border-subtle mx-1" />

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Bot size={14} />
              <span>Suporte IA</span>
            </button>
          </div>
        </header>

        <section className="flex-1 p-10 animate-fade-in scrollbar-hide overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
}
