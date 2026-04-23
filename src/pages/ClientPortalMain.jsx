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
import { Zap, Star, Settings, Power, ChevronRight } from "lucide-react";

const PLAN_META = {
  Starter: { color: T.inkSec, bg: "rgba(156,163,176,0.1)" },
  Pro:     { color: T.green,  bg: T.greenDim },
  Enterprise: { color: T.amber, bg: T.amberDim },
};

// ── Plano View ─────────────────────────────────────────────────────────────
function PlanoView({ client, invoices }) {
  const pm = PLAN_META[client.plan] || PLAN_META.Starter;
  const plans = [
    { p: "Starter", price: "R$ 197/mês", impl: "R$ 900", wpp: 1, f: ["Texto + Imagem", "1 Número WhatsApp", "CRM de Leads", "Suporte chat"] },
    { p: "Pro",     price: "R$ 397/mês", impl: "R$ 1.200", wpp: 3, f: ["Texto + Áudio + Imagem + Arquivo", "Até 3 Números WhatsApp", "CRM Leads + Pacientes", "Campanhas automáticas", "Google Agenda", "Suporte prioritário"] },
    { p: "Enterprise", price: "R$ 897/mês", impl: "R$ 2.500", wpp: 5, f: ["Tudo do Pro", "Até 5 Números WhatsApp", "Workflows ilimitados", "Integrações custom", "Onboarding dedicado"] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 300ms ease" }}>
      <PageTitle icon={Star} iconColor={T.amber} title="Meu Plano" subtitle="Gerencie sua assinatura e veja os recursos disponíveis." />

      <Card style={{ padding: "20px 24px", background: pm.bg, borderColor: pm.color + "44" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: pm.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Plano atual</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: pm.color, marginTop: 4 }}>{client.plan}</div>
          </div>
          <Zap size={40} color={pm.color} style={{ opacity: 0.5 }} />
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {plans.map(({ p, price, impl, wpp, f }) => {
          const m = PLAN_META[p];
          const isCurrent = client.plan === p;
          return (
            <Card key={p} style={{ padding: 20, border: `2px solid ${isCurrent ? m.color + "55" : T.border}`, background: isCurrent ? m.bg : T.surface }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: isCurrent ? m.color : T.ink }}>{p}</span>
                {isCurrent && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: m.color, color: "#000", fontWeight: 700 }}>ATUAL</span>}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, marginBottom: 2 }}>{price}</div>
              <div style={{ fontSize: 11, color: T.inkTert, marginBottom: 12 }}>Impl.: {impl} · {wpp} WhatsApp</div>
              {f.map(x => (
                <div key={x} style={{ fontSize: 12, color: T.inkSec, marginBottom: 4, display: "flex", gap: 6 }}>
                  <span style={{ color: m.color }}>✓</span> {x}
                </div>
              ))}
              {!isCurrent && (
                <Btn style={{ width: "100%", marginTop: 14, background: m.bg, color: m.color, border: `1px solid ${m.color}44` }}>
                  Fazer Upgrade
                </Btn>
              )}
            </Card>
          );
        })}
      </div>

      {/* Histórico de cobranças */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 12 }}>🧾 Histórico de Cobranças</div>
        {invoices.length === 0
          ? <Card><div style={{ padding: 32, textAlign: "center", color: T.inkTert, fontSize: 13 }}>Sem cobranças ainda.</div></Card>
          : invoices.map(inv => (
            <Card key={inv.id} style={{ padding: "13px 18px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 16 }}>{inv.status === "pago" ? "🟢" : inv.status === "pendente" ? "🟡" : "🔴"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: T.ink }}>{inv.descricao}</div>
                  <div style={{ fontSize: 11, color: T.inkTert }}>{inv.due_date}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>R$ {Number(inv.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                {inv.status !== "pago" && (
                  <Btn size="sm" variant="cyan" onClick={() => inv.payment_link && window.open(inv.payment_link, "_blank")}>Pagar</Btn>
                )}
              </div>
            </Card>
          ))
        }
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

  const pm = PLAN_META[client.plan] || PLAN_META.Starter;
  const initials = client.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  const VIEW_LABELS = {
    dashboard: "Dashboard", whatsapp: "WhatsApp", crm1: "CRM — Leads",
    crm2: "CRM — Pacientes", financeiro: "Financeiro", ia: "IA Aprendizados", plano: "Meu Plano",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: "Inter, -apple-system, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100% { transform: scale(1); opacity: 0.25; } 50% { transform: scale(1.5); opacity: 0.1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: 260, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", position: "fixed", height: "100vh", zIndex: 100 }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", display: "flex", alignItems: "center", gap: 9, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 30, height: 30, background: T.cyan, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, color: T.ink }}>
            Secretar<span style={{ color: T.cyan }}>IA</span>
          </span>
        </div>

        {/* Cliente info */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: pm.bg, border: `1px solid ${pm.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: pm.color, flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.name}</div>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: pm.color, background: pm.bg, padding: "1px 6px", borderRadius: 4 }}>
                {client.plan}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => (
            <div key={item.id} style={{ position: "relative" }}>
              <NavItem item={item} active={view === item.id} onClick={() => setView(item.id)} />
              {item.id === "ia" && numPendentes > 0 && (
                <span style={{ position: "absolute", top: 8, right: 12, width: 18, height: 18, borderRadius: "50%", background: T.amber, color: "#000", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {numPendentes}
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 12px", borderTop: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {onBack && (
            <button onClick={onBack} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, background: "transparent", border: `1px solid ${T.border}`, color: T.inkSec, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
              <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} /> Voltar ao Admin
            </button>
          )}
          <button onClick={() => signOut(auth)} style={{ width: "100%", padding: "9px 12px", borderRadius: 10, background: "transparent", border: `1px solid ${T.red}44`, color: T.red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
            <Power size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header style={{ height: 64, background: `${T.bg}dd`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", position: "sticky", top: 0, zIndex: 90 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>{VIEW_LABELS[view]}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {numbers.some(n => n.status === "ativo") && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.surface, padding: "5px 12px", borderRadius: 20, fontSize: 11, border: `1px solid ${T.border}` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
                WhatsApp Ativo
              </div>
            )}
            {numPendentes > 0 && (
              <button onClick={() => setView("ia")} style={{ display: "flex", alignItems: "center", gap: 6, background: T.amberDim, padding: "5px 12px", borderRadius: 20, fontSize: 11, border: `1px solid ${T.amber}44`, color: T.amber, cursor: "pointer", fontFamily: "inherit" }}>
                🧠 {numPendentes} revisão pendente
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          {view === "dashboard"  && <ClientDashboardView client={client} leads={leads} pacientes={pacientes} whatsappNums={numbers} />}
          {view === "whatsapp"   && <WhatsAppView client={client} numbers={numbers} reload={reloadNumbers} />}
          {view === "crm1"       && <CRM1View client={client} leads={leads} />}
          {view === "crm2"       && <CRM2View client={client} pacientes={pacientes} campanhas={campanhas} />}
          {view === "financeiro" && <FinanceiroClienteView client={client} servicos={servicos} vendas={vendas} invoices={invoices} />}
          {view === "ia"         && <IAAprendizadosView client={client} aprendizados={aprendizados} />}
          {view === "plano"      && <PlanoView client={client} invoices={invoices} />}
        </div>
      </main>
    </div>
  );
}
