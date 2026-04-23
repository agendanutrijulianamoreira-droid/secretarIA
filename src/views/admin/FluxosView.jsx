// views/admin/FluxosView.jsx
import { useState } from "react";
import { N8nFluxos } from "../../lib/db";

const T = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  up: "var(--color-surface-up)",
  border: "var(--color-border)",
  green: "var(--color-cta)",
  greenDim: "var(--color-surface-soft)",
  amber: "#B67A62", // Terracota
  amberDim: "rgba(182, 122, 98, 0.1)",
  red: "#EF4444",
  redDim: "rgba(239, 68, 68, 0.1)",
  cyan: "#3B82F6",
  cyanDim: "rgba(59, 130, 246, 0.1)",
  ink: "var(--color-text)",
  inkSec: "var(--color-text-sec)",
  inkTert: "var(--color-text-sec)",
  n8n: "var(--color-cta)",
  n8nDim: "var(--color-surface-soft)",
  borderSt: "var(--color-border)",
};

function StatusBadge({ status }) {
  const m = { online:{ c:T.green,b:T.greenDim,l:"Online" }, offline:{ c:T.red,b:T.redDim,l:"Offline" }, pending:{ c:T.amber,b:T.amberDim,l:"Pendente" }, error:{ c:T.red,b:T.redDim,l:"Erro" } }[status] || { c:T.inkSec,b:T.up,l:status||"—" };
  return <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:6, color:m.c, background:m.b }}>{m.l}</span>;
}

export default function FluxosView({ clients }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? clients : clients.filter(c => c.n8n_status === filter);

  const stats = {
    total: clients.length,
    online: clients.filter(c => c.n8n_status === "online").length,
    pending: clients.filter(c => !c.n8n_status || c.n8n_status === "pending").length,
    error: clients.filter(c => c.n8n_status === "error").length,
  };

  const provision = async (client) => {
    if (!confirm(`Provisionar fluxo n8n para "${client.name}"?`)) return;
    if (window.provisionClient) window.provisionClient(client.id);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, animation:"fadeIn 300ms ease" }}>
      <div>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:T.ink }}>⚡ Fluxos n8n</h1>
        <p style={{ margin:0, fontSize:13, color:T.inkTert }}>Status dos workflows provisionados por cliente.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[["Total", stats.total, T.ink], ["Online", stats.online, T.green], ["Pendente", stats.pending, T.amber], ["Erro", stats.error, T.red]].map(([l,v,c]) => (
          <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 18px" }}>
            <div style={{ fontSize:24, fontWeight:800, color:c }}>{v}</div>
            <div style={{ fontSize:11, color:T.inkTert, textTransform:"uppercase", letterSpacing:0.5 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:8 }}>
        {["all","online","pending","error"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:`1px solid ${filter===f ? T.cyan+"66" : T.border}`, background: filter===f ? T.cyanDim : "transparent", color: filter===f ? T.cyan : T.inkSec, fontFamily:"inherit" }}>
            {f === "all" ? "Todos" : f}
          </button>
        ))}
      </div>

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"var(--color-surface-soft)", borderBottom:`1px solid ${T.border}` }}>
              {["Cliente","Plano","Status n8n","Webhook URL","Última Sync","Ações"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"13px 16px", color:T.inkTert, fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom:`1px solid ${T.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--color-surface-soft)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding:"13px 16px" }}>
                  <div style={{ fontWeight:600, color:T.ink }}>{c.name}</div>
                  <div style={{ fontSize:11, color:T.inkTert }}>{c.email}</div>
                </td>
                <td style={{ padding:"13px 16px", color:T.inkSec }}>{c.plan}</td>
                <td style={{ padding:"13px 16px" }}><StatusBadge status={c.n8n_status || "pending"} /></td>
                <td style={{ padding:"13px 16px", color:T.inkTert, fontSize:11, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {c.n8n_url || "—"}
                </td>
                <td style={{ padding:"13px 16px", color:T.inkTert, fontSize:11 }}>—</td>
                <td style={{ padding:"13px 16px" }}>
                  <button onClick={() => provision(c)} style={{ padding:"6px 12px", borderRadius:8, fontSize:11, fontWeight:600, cursor:"pointer", background:T.cyanDim, border:`1px solid ${T.cyan}44`, color:T.cyan, fontFamily:"inherit" }}>
                    🚀 Provisionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding:32, textAlign:"center", color:T.inkTert }}>Nenhum cliente encontrado.</div>}
      </div>
    </div>
  );
}
