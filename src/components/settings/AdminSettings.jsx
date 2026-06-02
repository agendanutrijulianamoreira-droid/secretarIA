import { useState } from 'react';
import { Settings, User, ShieldCheck, Layout, Activity, CheckCircle2 } from 'lucide-react';
import { PageTitle, Btn, Inp } from '../../pages/ClientPortal';

// Configurações do perfil e informações do sistema para admin
export default function AdminSettings({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name:  user?.displayName || 'Admin Master',
    email: user?.email || '',
  });

  return (
    <div className="space-y-10 animate-fade-in">
      <PageTitle icon={Settings} title="Configurações" subtitle="Gerencie sua conta e preferências do sistema." />

      <div className="max-w-3xl space-y-8">
        <div className="bento-card p-10">
          <div className="premium-glow opacity-30" />
          <div className="relative z-10 flex items-center justify-between mb-10">
            <h3 className="text-lg font-semibold text-main">Meu perfil</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-medium text-primary hover:underline cursor-pointer">
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          <div className="relative z-10">
            {isEditing ? (
              <div className="space-y-6">
                <Inp label="Nome completo" value={profile.name} onChange={v => setProfile({ ...profile, name: v })} icon={User} />
                <Btn onClick={() => setIsEditing(false)} className="w-full py-4" icon={CheckCircle2}>Salvar</Btn>
              </div>
            ) : (
              <div className="flex items-center gap-8 p-8 rounded-[32px] bg-surface-up/30 border border-border-subtle group hover:border-primary/20 transition-all">
                <div className="h-20 w-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-primary text-3xl font-black border border-primary/20 shadow-2xl group-hover:rotate-6 transition-all">
                  {profile.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-black text-main tracking-tight uppercase italic">{profile.name}</h4>
                  <p className="text-base text-secondary font-medium opacity-60 mt-1">{profile.email}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-500 flex items-center gap-2">
                      <ShieldCheck size={10} /> Administradora
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bento-card p-10 space-y-8">
          <div className="premium-glow opacity-20" />
          <h3 className="relative z-10 text-lg font-semibold text-main flex items-center gap-3">
            <ShieldCheck size={18} className="text-primary" /> Informações do sistema
          </h3>
          <div className="relative z-10 space-y-4">
            {[
              { label: 'Servidor',   value: 'Brasil', color: 'text-emerald-500', icon: Layout },
              { label: 'Segurança',  value: 'Ativa',  color: 'text-primary',     icon: ShieldCheck },
              { label: 'Versão',     value: 'v5.4.2', color: 'text-tertiary',    icon: Activity },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center p-5 rounded-2xl bg-surface-up/20 border border-border-subtle/50 hover:bg-surface-up/40 transition-all">
                <div className="flex items-center gap-4">
                  <item.icon size={16} className="text-tertiary" />
                  <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{item.label}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
