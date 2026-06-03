import { Plus, Settings, KeyRound } from 'lucide-react';
import { PageTitle, Pulse } from '../../pages/ClientPortal';
import { PLAN_META } from '../../design-system/tokens';
import Av from '../shared/Av';
import { User } from 'lucide-react';

// Tabela de clientes do painel admin com ações de portal, briefing e redefinição de senha
export default function ClientsTable({ clients, onPortal, onBriefing, onNewClient, onResetPassword }) {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-center">
        <PageTitle icon={User} title="Clientes" subtitle="Gerencie suas clínicas e as configurações de cada IA." />
        <button
          onClick={onNewClient}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] hover:scale-105 transition-all text-[11px] shadow-xl shadow-primary/20 cursor-pointer"
        >
          <Plus size={16} strokeWidth={3} /> Novo Cliente
        </button>
      </div>

      <div className="bento-card p-0 overflow-hidden shadow-2xl">
        <div className="premium-glow opacity-30" />
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-up/30 border-b border-border-subtle">
                {['Clínica', 'WhatsApp', 'Plano', 'Status', ''].map(h => (
                  <th key={h} className="px-8 py-5 text-xs font-semibold text-tertiary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {clients.map(c => {
                const pm = PLAN_META[c.plan] || PLAN_META.Starter;
                return (
                  <tr key={c.id} className="group hover:bg-surface-up/30 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Av initials={c.avatar} color={c.color} size={40} />
                        <span className="text-base font-black text-main tracking-tight uppercase italic">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-secondary">{c.phone}</td>
                    <td className="px-8 py-5">
                      <div className="px-3 py-1.5 rounded-xl bg-surface-up border border-border-subtle text-[9px] font-black uppercase tracking-widest text-secondary inline-block"
                        style={{ color: pm.color, borderColor: pm.color + '30' }}>
                        {pm.label}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <Pulse status={c.status === 'active' ? 'online' : 'offline'} />
                        <span className="text-sm text-secondary">{c.status === 'active' ? 'Ativo' : 'Pausado'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => onResetPassword(c)} title="Redefinir senha" className="h-10 w-10 flex items-center justify-center rounded-2xl bg-surface-up border border-border-subtle text-tertiary hover:text-amber-500 hover:border-amber-500/40 transition-all cursor-pointer">
                          <KeyRound size={16} />
                        </button>
                        <button onClick={() => onBriefing(c)} title="Configurações" className="h-10 w-10 flex items-center justify-center rounded-2xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary hover:border-primary/40 transition-all cursor-pointer">
                          <Settings size={16} />
                        </button>
                        <button onClick={() => onPortal(c)} className="h-10 px-6 flex items-center justify-center rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer">
                          Portal
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
