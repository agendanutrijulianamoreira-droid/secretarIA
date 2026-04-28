import React from 'react';
import { 
  Users, Zap, MessageSquare, DollarSign, Bell, 
  ArrowRight, TrendingUp, Activity, CheckCircle2 
} from 'lucide-react';
import { Card, Badge, Button } from '../../components/UI';

export default function DashboardView({ clients, alerts, onPortal }) {
  const activeN = clients.filter(c => c.status === "active").length;
  const totalMsgs = clients.reduce((a, c) => a + (c.msgs_today || 0), 0);
  const unreadAlerts = alerts.filter(a => !a.read);
  
  const PLAN_PRICES = { starter: 197, pro: 497, enterprise: 997 };
  const mrr = clients.filter(c => c.status === "active").reduce((a, c) => a + (PLAN_PRICES[c.plan] || 0), 0);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-main">Dashboard</h1>
          <p className="text-secondary font-medium mt-1">Bem-vinda, Dra. Juliana. Aqui está o pulso da sua operação.</p>
        </div>
        <button 
          onClick={() => {
            const msg = prompt("Digite a mensagem para disparo em massa:");
            if (msg) alert(`Disparo agendado para ${clients.length} clientes.`);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Zap size={14} className="fill-current" />
          Disparo em Massa
        </button>
      </div>

      {/* Primary Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* MRR Card */}
        <div className="md:col-span-7 p-8 rounded-[32px] bg-surface border border-border-subtle flex flex-col justify-between group hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={120} className="text-primary" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <TrendingUp size={28} />
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Performance Mensal</span>
               <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
                 <ArrowRight size={14} className="-rotate-45" />
                 +12.5%
               </div>
            </div>
          </div>
          <div className="mt-12 relative z-10">
            <p className="text-sm text-secondary font-bold uppercase tracking-wider">Receita Mensal Estimada</p>
            <h3 className="text-5xl font-black tracking-tighter mt-2 text-main">
              R$ {mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="md:col-span-5 grid grid-cols-2 gap-6">
          <div className="p-6 rounded-[28px] bg-surface border border-border-subtle flex flex-col justify-between hover:border-primary/20 transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-3xl font-black tracking-tight text-main">{activeN}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">Clientes Ativos</p>
            </div>
          </div>

          <div className="p-6 rounded-[28px] bg-surface border border-border-subtle flex flex-col justify-between hover:border-primary/20 transition-all">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
              <MessageSquare size={20} />
            </div>
            <div>
              <h4 className="text-3xl font-black tracking-tight text-main">{totalMsgs}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">Interações / 24h</p>
            </div>
          </div>

          <div className="col-span-2 p-6 rounded-[28px] bg-surface border border-border-subtle flex items-center justify-between hover:border-primary/20 transition-all">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Activity size={24} />
                </div>
                <div>
                   <p className="text-[10px] text-tertiary font-black uppercase tracking-widest">Status da IA</p>
                   <h4 className="text-sm font-bold text-main mt-0.5">Motor Multi-Agente</h4>
                </div>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Operacional</span>
             </div>
          </div>
        </div>
      </div>

      {/* Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Notifications Center */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              Central de Notificações
            </h3>
            <button className="text-[10px] font-black text-tertiary uppercase tracking-widest hover:text-primary transition-colors">Marcar todas como lidas</button>
          </div>

          <div className="space-y-3">
            {unreadAlerts.length === 0 ? (
              <div className="p-12 rounded-[32px] border border-dashed border-border-subtle flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-surface-up flex items-center justify-center text-tertiary mb-4">
                   <CheckCircle2 size={32} />
                </div>
                <p className="text-sm text-secondary font-medium">Tudo em ordem! Sem novos alertas.</p>
              </div>
            ) : (
              unreadAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="group p-5 rounded-3xl bg-surface border border-border-subtle flex items-center gap-5 hover:border-primary/20 hover:bg-surface-up transition-all duration-300">
                  <div className="h-12 w-12 rounded-2xl bg-surface-up flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {alert.type === "SALE" ? "🎉" : "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-main truncate">{alert.title}</p>
                    <p className="text-xs text-tertiary font-medium truncate mt-0.5">{alert.message}</p>
                  </div>
                  <button className="h-8 w-8 rounded-lg bg-surface-up flex items-center justify-center text-tertiary hover:text-primary transition-colors">
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: System Info */}
        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-lg font-black tracking-tight px-2">Monitor de Sistema</h3>
           <div className="p-8 rounded-[32px] bg-surface border border-border-subtle space-y-8">
              <div className="space-y-4">
                 {[
                   { label: "WhatsApp Cloud API", status: "Estável" },
                   { label: "PostgreSQL Database", status: "Conectado" },
                   { label: "Orquestrador IA", status: "Online" }
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-secondary font-bold">{s.label}</span>
                      <div className="flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest">{s.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="pt-6 border-t border-border-subtle">
                 <div className="p-4 rounded-2xl bg-surface-soft border border-border-subtle flex flex-col items-center gap-2">
                    <span className="text-[10px] text-tertiary font-black uppercase tracking-widest">Carga do Servidor</span>
                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                       <div className="w-[12%] h-full bg-primary" />
                    </div>
                    <span className="text-[10px] text-primary font-bold">12% — Baixo Risco</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
