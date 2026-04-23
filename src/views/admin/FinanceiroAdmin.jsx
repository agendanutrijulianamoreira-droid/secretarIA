const T = { bg:"#0A0B10",surface:"#161B22",up:"#1F2630",border:"#30363D",green:"#2EB67D",greenDim:"rgba(46,182,125,0.1)",amber:"#E3B341",amberDim:"rgba(227,179,65,0.1)",red:"#F85149",redDim:"rgba(248,81,73,0.1)",cyan:"#00D1FF",cyanDim:"rgba(0,209,255,0.08)",ink:"#F0F6FC",inkSec:"#8B949E",inkTert:"#484F58" };

const PLAN_PRICES = { Starter: 197, Pro: 397, Enterprise: 897 };

function Pill({ c, b, children }) {
  return <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:6, color:c, background:b }}>{children}</span>;
}

export default function FinanceiroAdminView({ clients }) {
  const mrr = clients
    .filter(c => c.status === "active")
    .reduce((acc, c) => acc + (PLAN_PRICES[c.plan] || 0), 0);

  const setupRevenue = clients.reduce((acc, c) => {
    const impl = { Starter: 900, Pro: 1200, Enterprise: 2500 }[c.plan] || 0;
    return acc + impl;
  }, 0);

  const byPlan = ["Starter","Pro","Enterprise"].map(p => ({
    plan: p,
    count: clients.filter(c => c.plan === p).length,
    mrr: clients.filter(c => c.plan === p && c.status === "active").length * PLAN_PRICES[p],
  }));

  const PLAN_META = {
    Starter:    { color:T.inkSec, bg:"rgba(156,163,176,0.1)" },
    Pro:        { color:T.green,  bg:T.greenDim },
    Enterprise: { color:T.amber,  bg:T.amberDim },
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, animation:"fadeIn 300ms ease" }}>
      <div>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:T.ink }}>💰 Financeiro Admin</h1>
        <p style={{ margin:0, fontSize:13, color:T.inkTert }}>Receita recorrente, cobranças e análise de custos.</p>
      </div>

      {/* KPIs principais */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[
          { l:"MRR",          v:`R$ ${mrr.toLocaleString("pt-BR")}`,       c:T.green,  i:"📈" },
          { l:"ARR Estimado", v:`R$ ${(mrr*12).toLocaleString("pt-BR")}`,  c:T.cyan,   i:"🎯" },
          { l:"Clientes Ativos", v:clients.filter(c=>c.status==="active").length, c:T.amber, i:"👥" },
        ].map(s => (
          <div key={s.l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 22px" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{s.i}</div>
            <div style={{ fontSize:28, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:11, color:T.inkTert, textTransform:"uppercase", letterSpacing:0.5, marginTop:4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Breakdown por plano */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:700, color:T.ink }}>📊 Receita por Plano</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.02)" }}>
              {["Plano","Clientes","Mensalidade","MRR do Plano","% do Total"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"11px 16px", color:T.inkTert, fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byPlan.map(row => {
              const pm = PLAN_META[row.plan];
              return (
                <tr key={row.plan} style={{ borderTop:`1px solid ${T.border}` }}>
                  <td style={{ padding:"12px 16px" }}><Pill c={pm.color} b={pm.bg}>{row.plan}</Pill></td>
                  <td style={{ padding:"12px 16px", color:T.ink }}>{row.count}</td>
                  <td style={{ padding:"12px 16px", color:T.inkSec }}>R$ {PLAN_PRICES[row.plan]}/mês</td>
                  <td style={{ padding:"12px 16px", fontWeight:700, color:T.green }}>R$ {row.mrr.toLocaleString("pt-BR")}</td>
                  <td style={{ padding:"12px 16px", color:T.inkSec }}>{mrr > 0 ? ((row.mrr / mrr) * 100).toFixed(0) : 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lista de clientes com receita */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, fontSize:14, fontWeight:700, color:T.ink }}>🧾 Clientes & Receita</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:"rgba(255,255,255,0.02)" }}>
              {["Cliente","Plano","Status","Mensalidade","Msgs/Mês"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"11px 16px", color:T.inkTert, fontWeight:600, fontSize:12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(c => {
              const pm = PLAN_META[c.plan] || PLAN_META.Starter;
              const sc = { active:{ c:T.green,b:T.greenDim,l:"Ativo" }, setup:{ c:T.amber,b:T.amberDim,l:"Setup" }, paused:{ c:T.inkSec,b:T.up,l:"Pausado" } }[c.status] || { c:T.inkSec,b:T.up,l:c.status||"—" };
              return (
                <tr key={c.id} style={{ borderTop:`1px solid ${T.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.01)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ fontWeight:600, color:T.ink }}>{c.name}</div>
                    <div style={{ fontSize:11, color:T.inkTert }}>{c.email}</div>
                  </td>
                  <td style={{ padding:"12px 16px" }}><Pill c={pm.color} b={pm.bg}>{c.plan}</Pill></td>
                  <td style={{ padding:"12px 16px" }}><Pill c={sc.c} b={sc.b}>{sc.l}</Pill></td>
                  <td style={{ padding:"12px 16px", fontWeight:600, color:c.status==="active" ? T.green : T.inkTert }}>
                    {c.status === "active" ? `R$ ${PLAN_PRICES[c.plan]}/mês` : "—"}
                  </td>
                  <td style={{ padding:"12px 16px", color:T.inkSec }}>{c.msgs_month || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
