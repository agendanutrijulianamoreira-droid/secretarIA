import React from 'react';
import { 
  DollarSign, TrendingUp, Target, Users, Download, 
  ChevronRight, ArrowRight, Zap, PieChart, CreditCard,
  Briefcase, Activity
} from 'lucide-react';
import { Card, PageTitle, Btn, Pulse, COLORS } from '../../pages/ClientPortal';

const PLAN_PRICES = { Starter: 197, Pro: 497, Enterprise: 997 };

function Pill({ color, children }) {
  return (
    <span 
      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
      style={{ color: color, backgroundColor: color + '10', borderColor: color + '20' }}
    >
      {children}
    </span>
  );
}

export default function FinanceiroAdminView({ clients }) {
  const mrr = clients
    .filter(c => c.status === "active")
    .reduce((acc, c) => acc + (PLAN_PRICES[c.plan] || 0), 0);

  const byPlan = ["Starter", "Pro", "Enterprise"].map(p => ({
    plan: p,
    count: clients.filter(c => c.plan === p).length,
    mrr: clients.filter(c => c.plan === p && c.status === "active").length * PLAN_PRICES[p],
  }));

  const exportCSV = () => {
    const csv = ["Data,Cliente,Plano,Status,MRR"];
    clients.forEach(c => csv.push(`${new Date().toLocaleDateString()},"${c.name}","${c.plan}","${c.status}","${c.status === 'active' ? PLAN_PRICES[c.plan] : 0}"`));
    const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ledger-financeiro-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <PageTitle icon={DollarSign} title="Gestão Financeira" subtitle="Controle de receita recorrente, planos e performance comercial do ecossistema." />
        <button 
          onClick={exportCSV}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary hover:border-primary/40 transition-all cursor-pointer shadow-xl"
        >
          <Download size={14} /> Exportar Ledger
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "MRR Consolidado", value: `R$ ${mrr.toLocaleString("pt-BR")}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "ARR Projetado", value: `R$ ${(mrr * 12).toLocaleString("pt-BR")}`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
          { label: "Terminais Ativos", value: clients.filter(c => c.status === "active").length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10">
              <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-border-subtle shadow-inner mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <s.icon size={26} strokeWidth={2.5} />
              </div>
              <h4 className="text-5xl font-black tracking-tighter text-main italic uppercase">{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-3 opacity-60">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="bento-card p-0 overflow-hidden shadow-2xl">
        <div className="premium-glow opacity-30" />
        <div className="px-10 py-8 border-b border-border-subtle bg-surface-up/30 flex items-center gap-4">
           <PieChart size={20} className="text-primary" />
           <h3 className="text-xl font-black text-main tracking-tighter uppercase italic">Breakdown por Escalonamento</h3>
        </div>
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-up/10 border-b border-border-subtle">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Plano de Acesso</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Ecossistemas</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Ticket Mensal</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">MRR Ativo</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">% Participação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {byPlan.map(row => (
                <tr key={row.plan} className="group hover:bg-surface-up/30 transition-all duration-300">
                  <td className="px-10 py-6">
                    <Pill color={row.plan === 'Enterprise' ? '#F59E0B' : row.plan === 'Pro' ? '#10B981' : '#94A3B8'}>{row.plan}</Pill>
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-main">{row.count}</td>
                  <td className="px-10 py-6 text-sm font-bold text-secondary">R$ {PLAN_PRICES[row.plan]}</td>
                  <td className="px-10 py-6 text-sm font-black text-emerald-500">R$ {row.mrr.toLocaleString("pt-BR")}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="h-1.5 w-24 bg-surface-up rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${mrr > 0 ? (row.mrr / mrr) * 100 : 0}%` }} />
                       </div>
                       <span className="text-[10px] font-black text-secondary">{mrr > 0 ? ((row.mrr / mrr) * 100).toFixed(0) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Ledger */}
      <div className="bento-card p-0 overflow-hidden shadow-2xl">
        <div className="premium-glow opacity-20" />
        <div className="px-10 py-8 border-b border-border-subtle bg-surface-up/30 flex items-center gap-4">
           <CreditCard size={20} className="text-primary" />
           <h3 className="text-xl font-black text-main tracking-tighter uppercase italic">Ledger de Contas & Receita</h3>
        </div>
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-up/10 border-b border-border-subtle">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Unidade / Identificador</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Plano</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Mensalidade</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Carga Cognitiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {clients.map(c => (
                <tr key={c.id} className="group hover:bg-surface-up/30 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-main tracking-tight uppercase italic">{c.name}</span>
                       <span className="text-[10px] text-tertiary font-bold lowercase opacity-60">{c.email}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <Pill color={c.plan === 'Enterprise' ? '#F59E0B' : c.plan === 'Pro' ? '#10B981' : '#94A3B8'}>{c.plan}</Pill>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <Pulse status={c.status === 'active' ? 'online' : 'offline'} />
                       <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{c.status === 'active' ? 'Operante' : 'Suspenso'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-main">
                    {c.status === "active" ? `R$ ${PLAN_PRICES[c.plan]}` : "—"}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <Activity size={14} className="text-primary opacity-40" />
                       <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{c.msgs_month || 0} Int.</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
