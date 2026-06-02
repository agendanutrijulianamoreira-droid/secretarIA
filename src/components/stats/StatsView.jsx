import { PieChart, MessageSquare, TrendingUp, Activity, ActivitySquare } from 'lucide-react';
import { PageTitle } from '../../pages/ClientPortal';
import Av from '../shared/Av';

// Relatórios de uso por clínica e métricas globais
export default function StatsView({ clients }) {
  const totalMsgs = clients.reduce((a, c) => a + (c.msgs_month || 0), 0);
  const avgMsgs   = clients.length ? (totalMsgs / clients.length).toFixed(0) : 0;

  return (
    <div className="space-y-10 animate-fade-in">
      <PageTitle icon={PieChart} title="Relatórios" subtitle="Resumo de uso e atividade das suas clínicas." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Mensagens no mês',         value: totalMsgs.toLocaleString(), icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Média por clínica',         value: avgMsgs,                    icon: TrendingUp,    color: 'text-primary',     bg: 'bg-primary/10' },
          { label: 'Disponibilidade do sistema', value: '99.99%',                  icon: Activity,      color: 'text-blue-500',    bg: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col h-full">
              <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-border-subtle mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <s.icon size={24} strokeWidth={2.5} />
              </div>
              <h4 className="text-5xl font-black tracking-tighter text-main">{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-3">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bento-card p-10">
        <div className="premium-glow opacity-30" />
        <h3 className="text-base font-semibold text-main mb-8 flex items-center gap-3">
          <ActivitySquare size={18} className="text-primary" /> Uso por clínica
        </h3>
        <div className="space-y-10">
          {clients.slice(0, 8).map(c => (
            <div key={c.id} className="space-y-3 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                  <Av initials={c.avatar} color={c.color} size={28} />
                  <span className="text-sm font-black text-main uppercase tracking-tight italic">{c.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-primary">{c.msgs_month || 0}</span>
                  <span className="text-[9px] text-tertiary font-black uppercase tracking-widest ml-2">Interações</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-surface-up rounded-full overflow-hidden shadow-inner p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ backgroundColor: c.color, width: `${Math.min(100, (c.msgs_month || 0) / 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
