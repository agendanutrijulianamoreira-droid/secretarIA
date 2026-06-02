import { Bell, DollarSign, Calendar, Clock } from 'lucide-react';
import { PageTitle } from '../../pages/ClientPortal';
import { Alerts } from '../../lib/db';

// Lista de alertas e notificações do painel admin
export default function AlertsView({ alerts }) {
  return (
    <div className="space-y-10 animate-fade-in">
      <PageTitle icon={Bell} title="Alertas" subtitle="Notificações de novas conversões e eventos importantes." />

      <div className="max-w-4xl space-y-5">
        {alerts.length === 0 ? (
          <div className="py-40 rounded-[48px] border border-dashed border-border-subtle flex flex-col items-center justify-center text-center opacity-30">
            <Bell size={80} strokeWidth={1} className="text-tertiary mb-6" />
            <p className="text-sm text-tertiary font-medium">Nenhum alerta ainda</p>
          </div>
        ) : (
          alerts.map(a => (
            <div
              key={a.id}
              className={`bento-card group p-8 flex items-center gap-8 transition-all duration-500 ${
                a.read ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100' : 'border-primary/20'
              }`}
            >
              <div className="premium-glow opacity-30" />
              <div className="relative z-10">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner transition-all ${
                  a.type === 'SALE'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-surface-up border-border-subtle'
                }`}>
                  {a.type === 'SALE' ? <DollarSign size={24} /> : <Bell size={24} />}
                </div>
              </div>

              <div className="relative z-10 flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-4">
                  <h4 className={`text-base font-black tracking-tight uppercase italic ${a.read ? 'text-secondary' : 'text-main'}`}>
                    {a.title}
                  </h4>
                  {!a.read && <div className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </div>
                <p className="text-sm text-secondary font-medium leading-relaxed opacity-80">{a.message}</p>
                <div className="flex items-center gap-6 pt-1">
                  <div className="flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest">
                    <Calendar size={11} className="text-primary" />
                    {new Date(a.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest">
                    <Clock size={11} className="text-primary" />
                    {new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {!a.read && (
                <div className="relative z-10">
                  <button
                    onClick={() => Alerts.markRead(a.id)}
                    className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/30 hover:bg-primary hover:text-black transition-all cursor-pointer"
                  >
                    Marcar como lido
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
