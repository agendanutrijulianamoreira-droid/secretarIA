import React from 'react';
import {
  LayoutDashboard, Users, Settings, Bell,
  BarChart2, DollarSign, Moon, Sun,
  Activity, LogOut, Search
} from 'lucide-react';
import { Logo } from '../components/UI';

const NAV_ITEMS = [
  { id: "dashboard",  icon: LayoutDashboard, label: "Painel" },
  { id: "clients",    icon: Users,           label: "Clientes" },
  { id: "vendas",     icon: DollarSign,      label: "Vendas" },
  { id: "alerts",     icon: Bell,            label: "Alertas" },
  { id: "stats",      icon: BarChart2,       label: "Relatórios" },
  { id: "settings",   icon: Settings,        label: "Configurações" },
];

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
        ${active
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-secondary hover:text-main hover:bg-surface-up/60'
        }
      `}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
      <span className={`text-sm font-medium flex-1 text-left`}>{label}</span>
      {badge > 0 && (
        <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-primary text-black text-[10px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function SecretariaDashboard({ user, logout, setView, activeView, alertCount = 0, children, theme, toggleTheme }) {
  const VIEW_LABELS = {
    dashboard: "Painel geral",
    clients: "Clientes",
    vendas: "Vendas",
    stats: "Relatórios",
    alerts: "Alertas",
    settings: "Configurações",
  };

  return (
    <div className="flex min-h-screen bg-background text-main font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-[240px] flex flex-col bg-surface border-r border-border">
        <div className="p-6 pb-4">
          <Logo size={36} />
        </div>

        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-up/40 border border-border-subtle">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-secondary font-medium">Sistema online</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
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

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-up/40 border border-border-subtle mb-3">
            <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-main truncate">Dra. Juliana</span>
              <span className="text-xs text-tertiary">Administradora</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/5 text-red-500 text-sm font-medium border border-red-500/10 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[240px] flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-8 bg-background/90 backdrop-blur-xl border-b border-border">
          <h2 className="text-base font-semibold text-main">
            {VIEW_LABELS[activeView] || activeView}
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={15} />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-surface-up/50 border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-sm text-main placeholder:text-tertiary focus:outline-none focus:border-primary/50 transition-all w-52"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-up/50 border border-border-subtle text-tertiary hover:text-primary transition-all"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-up/50 border border-border-subtle">
              <Activity size={14} className="text-primary" />
              <span className="text-xs font-medium text-secondary">Tudo certo</span>
            </div>
          </div>
        </header>

        <section className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-background animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
