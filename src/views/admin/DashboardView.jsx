import React from 'react';
import { 
  Users, Zap, MessageSquare, DollarSign, Bell, 
  ArrowRight, TrendingUp, Activity, CheckCircle2,
  ShieldCheck, Smartphone, Target, ShoppingCart, Search, Brain
} from 'lucide-react';
import { Card, PageTitle, Btn } from '../../pages/ClientPortal';

export default function DashboardView({ clients, alerts, onPortal }) {
  const activeN = clients.filter(c => c.status === "active").length;
  const totalMsgs = clients.reduce((a, c) => a + (c.msgs_today || 0), 0);
  const unreadAlerts = alerts.filter(a => !a.read);
  
  const PLAN_PRICES = { starter: 197, pro: 497, enterprise: 997 };
  const mrr = clients.filter(c => c.status === "active").reduce((a, c) => a + (PLAN_PRICES[c.plan] || 0), 0);

  return (
    <div className="space-y-16 animate-fade-in">
      {/* Header Bento Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <PageTitle icon={Activity} title="Central de Comando" subtitle="Pulso operacional e métricas de desempenho em tempo real." />
        
        <div className="flex items-center gap-6">
           <div className="relative group hidden lg:block">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="LOCALIZAR PROTOCOLO..." 
                className="bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black tracking-[0.2em] text-main placeholder:text-tertiary/40 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all w-64 uppercase"
              />
           </div>
           <Btn 
              onClick={() => {
                const msg = prompt("Digite a mensagem para disparo em massa:");
                if (msg) alert(`Protocolo de transmissão agendado para ${clients.length} terminais.`);
              }}
              icon={Zap}
              className="px-10 py-5"
            >
              Transmissão Massiva
           </Btn>
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Financial Core (MRR) */}
        <div className="lg:col-span-8 bento-card p-12 min-h-[420px] flex flex-col justify-between group overflow-hidden border-primary/20 shadow-[0_0_100px_rgba(16,185,129,0.05)]">
          <div className="premium-glow" />
          <div className="absolute -right-16 -top-16 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-1000">
            <DollarSign size={320} strokeWidth={1} className="text-primary" />
          </div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl group-hover:rotate-3 transition-transform duration-500">
              <TrendingUp size={42} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-end">
               <div className="px-5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">
                 <ArrowRight size={14} className="-rotate-45" />
                 Escalonamento +12.5%
               </div>
               <span className="text-[10px] font-black text-tertiary uppercase tracking-[0.4em] mt-4 opacity-60">Mensuração Mensal (MRR)</span>
            </div>
          </div>

          <div className="mt-20 relative z-10">
            <h3 className="text-7xl font-black tracking-tighter text-main leading-none italic uppercase">
              R$ {mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
            <div className="h-1.5 w-64 bg-surface-up rounded-full mt-8 overflow-hidden shadow-inner">
               <div className="h-full bg-primary w-[75%] animate-pulse" />
            </div>
            <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-4">Previsão de Fluxo Consolidado</p>
          </div>
        </div>

        {/* Secondary Metrics Grid */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-10">
          <div className="bento-card p-10 flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-500">
            <div className="premium-glow opacity-20" />
            <div className="h-16 w-16 rounded-[24px] bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-inner group-hover:rotate-6 transition-all">
              <Users size={28} />
            </div>
            <div className="mt-10">
              <h4 className="text-6xl font-black tracking-tighter text-main italic uppercase">{activeN}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-2 opacity-60">Unidades Operantes</p>
            </div>
          </div>

          <div className="bento-card p-10 flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-500">
            <div className="premium-glow opacity-20" />
            <div className="h-16 w-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner group-hover:rotate-6 transition-all">
              <MessageSquare size={28} />
            </div>
            <div className="mt-10">
              <h4 className="text-6xl font-black tracking-tighter text-main italic uppercase">{totalMsgs}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-2 opacity-60">Taxa de Conversação / 24h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & System Health */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        
        {/* Real-time Notifications */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black tracking-tighter text-main uppercase italic flex items-center gap-4">
              <Bell size={24} className="text-primary" />
              Eventos de Sistema
            </h3>
            <button className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] hover:text-primary transition-all cursor-pointer opacity-50 hover:opacity-100">Limpar Buffer</button>
          </div>

          <div className="space-y-4">
            {unreadAlerts.length === 0 ? (
              <div className="py-32 rounded-[48px] border border-dashed border-slate-800 bg-surface-up/10 flex flex-col items-center justify-center text-center opacity-40">
                <div className="h-24 w-24 rounded-full bg-slate-900 flex items-center justify-center text-tertiary mb-6 shadow-inner">
                   <ShieldCheck size={48} strokeWidth={1} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ambiente Estéril: Sem Alertas Pendentes</p>
              </div>
            ) : (
              unreadAlerts.slice(0, 4).map(alert => (
                <div key={alert.id} className="bento-card group p-8 flex items-center gap-8 transition-all duration-500 hover:bg-slate-900/50">
                  <div className="relative">
                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-all ${alert.type === "SALE" ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface-up border-slate-800 text-tertiary'}`}>
                      {alert.type === "SALE" ? <ShoppingCart size={28} /> : <Bell size={28} />}
                    </div>
                    {alert.type === "SALE" && <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-black font-black text-[9px] shadow-lg animate-bounce">!</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-main tracking-tight uppercase italic truncate">{alert.title}</h4>
                    <p className="text-sm text-secondary font-medium opacity-60 truncate mt-1">{alert.message}</p>
                  </div>
                  <button className="h-12 w-12 rounded-2xl bg-surface-up flex items-center justify-center text-tertiary hover:text-primary hover:border-primary/30 transition-all cursor-pointer">
                    <ArrowRight size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Infrastructure Monitor */}
        <div className="xl:col-span-4 space-y-8">
           <h3 className="text-xl font-black tracking-tighter text-main uppercase italic px-4 flex items-center gap-4">
              <Activity size={24} className="text-primary" /> Diagnóstico
           </h3>
           <div className="bento-card p-10 space-y-12">
              <div className="space-y-6">
                 {[
                   { label: "Quantum Engine", status: "Active", icon: Brain },
                   { label: "WhatsApp Gateway", status: "Synched", icon: Smartphone },
                   { label: "Database Shard", status: "Protected", icon: ShieldCheck }
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 group hover:border-primary/20 transition-all cursor-default">
                      <div className="flex items-center gap-4">
                         <s.icon size={16} className="text-tertiary group-hover:text-primary transition-colors" />
                         <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                         <span className="text-[9px] font-black text-primary uppercase tracking-widest">{s.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="pt-10 border-t border-slate-900">
                 <div className="p-8 rounded-[32px] bg-slate-900/30 border border-slate-800 flex flex-col items-center gap-6 relative overflow-hidden group">
                    <div className="premium-glow opacity-10" />
                    <span className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] relative z-10">Consumo de Threads</span>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden shadow-inner p-0.5 relative z-10">
                       <div className="w-[12%] h-full bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                       <Activity size={12} className="text-primary animate-pulse" />
                       <span className="text-[11px] font-black text-primary uppercase tracking-widest italic">12% — Latência Mínima</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
