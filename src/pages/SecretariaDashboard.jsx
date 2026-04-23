import React from 'react';
import { LayoutDashboard, Users, Settings, Bell, Bot, Zap, Power, BarChart2, GitBranch, Key, DollarSign, ShoppingCart, Moon, Sun } from 'lucide-react';
import { Button, Badge, Logo } from '../components/UI';

const NAV_ITEMS = [
  { id: "dashboard",  icon: LayoutDashboard, label: "Visão Geral" },
  { id: "clients",    icon: Users,           label: "Clientes" },
  { id: "fluxos",     icon: GitBranch,       label: "Fluxos n8n" },
  { id: "tokens",     icon: Key,             label: "Tokens / API" },
  { id: "financeiro", icon: DollarSign,      label: "Financeiro" },
  { id: "vendas",     icon: ShoppingCart,    label: "Vendas" },
  { id: "stats",      icon: BarChart2,       label: "Estatísticas" },
  { id: "alerts",     icon: Bell,            label: "Alertas" },
  { id: "settings",   icon: Settings,        label: "Configurações" },
];

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "12px 16px", borderRadius: 14,
      background: active ? "rgba(34, 197, 94, 0.1)" : "transparent",
      border: "none", color: active ? "var(--color-cta)" : "var(--color-text-sec)",
      display: "flex", alignItems: "center", gap: 12,
      cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", textAlign: "left",
      fontFamily: "inherit", position: "relative",
    }} className="btn-hover">
      <Icon size={18} color={active ? "var(--color-cta)" : "var(--color-text-sec)"} />
      <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, flex: 1 }}>{label}</span>
      {badge > 0 && (
        <Badge color="amber">{badge}</Badge>
      )}
    </button>
  );
}

export default function SecretariaDashboard({ user, logout, setView, activeView, alertCount = 0, children, theme, toggleTheme }) {
  const VIEW_LABELS = {
    dashboard: "Visão Geral", clients: "Gestão de Clientes",
    fluxos: "Fluxos n8n", tokens: "Tokens / API",
    financeiro: "Financeiro Admin", vendas: "Vendas & Pipeline",
    stats: "Estatísticas", alerts: "Alertas de Venda", settings: "Configurações",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-surface-up); border-radius: 10px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ 
        width: 280, 
        background: "var(--color-surface)", 
        borderRight: "1px solid var(--color-border)", 
        display: "flex", 
        flexDirection: "column", 
        position: "fixed", 
        height: "100vh", 
        zIndex: 100 
      }}>
        <div style={{ padding: "32px 24px 10px" }}>
          <Logo size={28} />
        </div>

        <div style={{ padding: "0 24px 20px" }}>
          <Badge color="amber" className="w-full justify-center">⚡ Painel Administrativo</Badge>
        </div>

        <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 4, overflowY: "auto" }}>
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

        <div style={{ padding: "24px 16px", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            marginBottom: 16, 
            padding: "12px",
            background: "var(--color-surface-soft)",
            borderRadius: 16,
            border: "1px solid var(--color-border)"
          }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: "50%", 
              background: "rgba(34, 197, 94, 0.1)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontWeight: 800, 
              fontSize: 14, 
              color: "var(--color-cta)", 
              border: "1px solid rgba(34, 197, 94, 0.2)" 
            }}>
              {user?.email?.[0]?.toUpperCase() || 'J'}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Dra. Juliana</p>
              <p style={{ fontSize: 11, color: "var(--color-text-sec)", margin: 0 }}>Administradora</p>
            </div>
          </div>
          <Button variant="danger" className="w-full" onClick={logout} icon={Power}>
            Sair do Sistema
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 280, display: "flex", flexDirection: "column", height: "100vh" }}>
        <header style={{ 
          height: 80, 
          background: "var(--glass-bg)", 
          backdropFilter: "blur(12px)", 
          borderBottom: "1px solid var(--color-border)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "0 40px", 
          position: "sticky", 
          top: 0, 
          zIndex: 90 
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }} className="text-gradient">
            {VIEW_LABELS[activeView] || activeView}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button 
              variant="ghost" 
              onClick={toggleTheme} 
              style={{ width: 40, height: 40, padding: 0, borderRadius: 12 }}
              icon={theme === 'dark' ? Sun : Moon}
            />
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              background: "var(--color-surface)", 
              padding: "6px 14px", 
              borderRadius: 100, 
              fontSize: 12, 
              fontWeight: 600,
              border: "1px solid var(--color-border)" 
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-cta)", boxShadow: "0 0 10px var(--color-cta)" }} />
              Sistema Online
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: "40px", animation: "fadeIn 0.4s ease-out" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

