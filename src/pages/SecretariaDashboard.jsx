import React from 'react';
import { LayoutDashboard, Users, Settings, Bell, Bot, Zap, Power, BarChart2, GitBranch, Key, DollarSign, ShoppingCart } from 'lucide-react';

const T = {
  bg: "#0A0B10", surface: "#161B22", up: "#1F2630",
  border: "#30363D", borderSt: "#484F58",
  green: "#2EB67D", cyan: "#00D1FF", red: "#F85149",
  amber: "#E3B341", ink: "#F0F6FC", inkSec: "#8B949E", inkTert: "#484F58",
};

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
      width: "100%", padding: "11px 16px", borderRadius: 10,
      background: active ? `${T.cyan}12` : "transparent",
      border: "none", color: active ? T.cyan : T.inkSec,
      display: "flex", alignItems: "center", gap: 10,
      cursor: "pointer", transition: "all 0.15s", textAlign: "left",
      fontFamily: "inherit", position: "relative",
    }}>
      <Icon size={17} color={active ? T.cyan : T.inkSec} />
      <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{ width: 18, height: 18, borderRadius: "50%", background: T.amber, color: "#000", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {badge}
        </span>
      )}
    </button>
  );
}

export default function SecretariaDashboard({ user, logout, setView, activeView, alertCount = 0, children }) {
  const VIEW_LABELS = {
    dashboard: "Visão Geral", clients: "Gestão de Clientes",
    fluxos: "Fluxos n8n", tokens: "Tokens / API",
    financeiro: "Financeiro Admin", vendas: "Vendas & Pipeline",
    stats: "Estatísticas", alerts: "Alertas de Venda", settings: "Configurações",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: "Inter, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes pulse  { 0%,100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(1.5); opacity: 0.1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: 260, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", position: "fixed", height: "100vh", zIndex: 100 }}>
        <div style={{ padding: "28px 20px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: `${T.cyan}18`, padding: 8, borderRadius: 10, border: `1px solid ${T.cyan}33`, boxShadow: `0 0 20px ${T.cyan}22` }}>
            <Zap size={18} color={T.cyan} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>
            Secretar<span style={{ color: T.cyan }}>IA</span>
          </h1>
        </div>

        <div style={{ margin: "0 12px 14px", padding: "8px 12px", background: `${T.amber}10`, borderRadius: 8, border: `1px solid ${T.amber}33`, fontSize: 11, color: T.amber, fontWeight: 600 }}>
          ⚡ Painel Administrativo
        </div>

        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
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

        <div style={{ padding: "16px 12px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 4px" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${T.cyan}18`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: T.cyan, border: `1px solid ${T.cyan}33` }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.ink, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Dra. Juliana</p>
              <p style={{ fontSize: 10, color: T.inkSec, margin: 0 }}>Administradora</p>
            </div>
          </div>
          <button onClick={logout} style={{ width: "100%", padding: "9px", borderRadius: 10, background: "transparent", border: `1px solid ${T.red}44`, color: T.red, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
            <Power size={13} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column", height: "100vh" }}>
        <header style={{ height: 64, background: `${T.bg}dd`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 90 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{VIEW_LABELS[activeView] || activeView}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.surface, padding: "5px 12px", borderRadius: 20, fontSize: 11, border: `1px solid ${T.border}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
              Sistema Online
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
