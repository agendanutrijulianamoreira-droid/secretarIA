import { useState } from 'react';
import { X, Briefcase, Smartphone, User, Star, Zap } from 'lucide-react';
import { Btn, Inp, Card } from '../../pages/ClientPortal';

const CAP_LABELS = {
  text:  { label: 'Texto',    icon: null },
  audio: { label: 'Áudio',    icon: null },
  image: { label: 'Imagem',   icon: null },
  file:  { label: 'Arquivo',  icon: null },
};

// Modal de criação de novo cliente com seleção de plano e capacidades
export default function NewClientModal({ onClose, onNext, onFinish }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', plan: 'Pro', capabilities: ['text'] });
  const upd = k => v => setF(p => ({ ...p, [k]: v }));
  const toggleCap = c => setF(p => ({
    ...p,
    capabilities: p.capabilities.includes(c)
      ? p.capabilities.filter(x => x !== c)
      : [...p.capabilities, c],
  }));
  const isValid = f.name.trim() && f.phone.trim() && f.email.trim();

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[400] flex items-center justify-center p-8">
      <Card className="w-full max-w-xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle bg-surface-up/20 flex items-center justify-between">
          <h4 className="text-xl font-bold text-main">Novo cliente</h4>
          <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-6">
          <Inp label="Nome da clínica *" value={f.name}  onChange={upd('name')}  placeholder="Ex: Clínica Juliana Moreira" icon={Briefcase} />
          <Inp label="WhatsApp *"        value={f.phone} onChange={upd('phone')} placeholder="+55 11 9 0000-0000"            icon={Smartphone} />
          <Inp label="E-mail *"          value={f.email} onChange={upd('email')} placeholder="gestao@clinica.com"            icon={User} />

          <div className="space-y-3">
            <label className="text-sm font-medium text-secondary ml-1">Funcionalidades</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(CAP_LABELS).map(([c, m]) => (
                <button
                  key={c}
                  onClick={() => toggleCap(c)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                    f.capabilities.includes(c)
                      ? 'bg-primary text-black border-primary shadow-lg'
                      : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-secondary ml-1">Plano</label>
            <div className="flex gap-3">
              {['Starter', 'Pro', 'Enterprise'].map(p => (
                <button
                  key={p}
                  onClick={() => upd('plan')(p)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-2 ${
                    f.plan === p
                      ? 'bg-primary text-black border-primary shadow-lg'
                      : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40'
                  }`}
                >
                  <Star size={12} /> {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-5">
            <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-medium text-sm hover:text-main transition-all cursor-pointer">
              Cancelar
            </button>
            <div className="flex-[1.5] flex flex-col gap-3">
              <Btn disabled={!isValid} onClick={() => onFinish(f)} className="w-full py-4" icon={Zap}>
                Criar cliente
              </Btn>
              <button
                onClick={() => { if (isValid) onNext(f); }}
                disabled={!isValid}
                className="w-full py-2 rounded-xl bg-surface-up/50 border border-border-subtle text-tertiary text-xs font-medium hover:text-primary transition-all cursor-pointer"
              >
                Ir para configuração →
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
