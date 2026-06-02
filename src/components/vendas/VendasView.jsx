import { Download, TrendingUp, ShoppingCart, Bell, Target, Plus, Zap } from 'lucide-react';
import { PageTitle } from '../../pages/ClientPortal';

// Histórico de assinaturas e métricas de vendas do painel admin
export default function VendasView({ alerts }) {
  const vendas  = alerts.filter(a => a.type === 'SALE');
  const total   = vendas.length;
  const unread  = vendas.filter(a => !a.read).length;

  const exportCSV = () => {
    const rows = ['Data,Título,Mensagem'];
    vendas.forEach(v => rows.push(`${new Date(v.created_at).toLocaleDateString()},"${v.title}","${v.message}"`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'vendas-secretaria.csv'; a.click();
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageTitle icon={TrendingUp} title="Vendas" subtitle="Acompanhe as novas assinaturas e conversões." />
        <button
          onClick={exportCSV}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-surface-up border border-border-subtle text-secondary text-sm font-medium hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total de vendas',   value: total,   icon: ShoppingCart, color: 'text-emerald-500' },
          { label: 'Novos (não vistos)', value: unread,  icon: Bell,         color: 'text-blue-500' },
          { label: 'Taxa de conversão', value: '14.2%', icon: Target,       color: 'text-primary' },
        ].map(s => (
          <div key={s.label} className="bento-card group overflow-hidden">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col h-full">
              <h4 className="text-5xl font-black tracking-tighter text-main">{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                <s.icon size={12} className={s.color} /> {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <h3 className="text-base font-semibold text-main flex items-center gap-3">
          <Zap size={18} className="text-primary" /> Histórico de assinaturas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {vendas.length === 0 ? (
            <div className="md:col-span-2 py-24 text-center bg-surface-up/20 rounded-[48px] border border-dashed border-border-subtle opacity-30">
              <ShoppingCart size={48} strokeWidth={1} className="mx-auto mb-4" />
              <p className="text-sm text-tertiary font-medium">Nenhuma venda ainda</p>
            </div>
          ) : vendas.map(v => (
            <div key={v.id} className="bento-card p-6 flex items-center gap-5 group hover:border-primary/30 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:rotate-6 transition-all">
                <Plus size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-main tracking-tight uppercase italic truncate">{v.title}</p>
                <span className="text-[10px] text-tertiary font-black uppercase tracking-widest">
                  {new Date(v.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
