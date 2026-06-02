import { useState } from 'react';
import {
  X, ArrowRight, ArrowLeft, CheckCircle2, Plus, Briefcase, Brain,
  Layout, HelpCircle, Shield, CreditCard, Activity, Clock,
  AlertTriangle, Smartphone, User, Zap, DollarSign, ShieldCheck, Sparkles, Check,
} from 'lucide-react';
import { Btn, Inp, Card } from '../../pages/ClientPortal';
import { SEGMENTS, TONES, GOALS, PLAN_META } from '../../design-system/tokens';

const STEPS = [
  { id: 'negocio',  icon: Briefcase,   label: 'Negócio' },
  { id: 'ia',       icon: Brain,       label: 'Persona' },
  { id: 'servicos', icon: Layout,      label: 'Serviços' },
  { id: 'faqs',     icon: HelpCircle,  label: 'FAQ' },
  { id: 'regras',   icon: Shield,      label: 'Regras' },
  { id: 'plano',    icon: CreditCard,  label: 'Plano' },
];

function Selct({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-3">
      {label && <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">{label}</label>}
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-5 text-tertiary" size={16} />}
        <select
          value={value} onChange={e => onChange(e.target.value)}
          className={`w-full ${Icon ? 'pl-14' : 'px-6'} pr-10 py-4 bg-surface-up/30 border border-border-subtle rounded-2xl text-main text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none`}
        >
          <option value="">Selecionar…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 cursor-pointer transition-all ${
        active
          ? 'bg-primary text-black border-primary shadow-lg scale-105'
          : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40'
      }`}
    >
      {children}
    </button>
  );
}

// Wizard de 6 passos para configurar briefing e plano do cliente IA
export default function BriefingWizard({ initial, planInit, onSave, onCancel }) {
  const EMPTY = { segment: '', description: '', site: '', instagram: '', ai_name: '', ai_tone: '', ai_goal: '', business_hours: '', escalation_trigger: '', escalation_number: '', services: [], faqs: [], restrictions: '', promotions: '' };
  const [step,   setStep]   = useState(0);
  const [b,      setB]      = useState({ ...EMPTY, ...initial });
  const [plan,   setPlan]   = useState(planInit || 'Pro');
  const [ns,     setNs]     = useState({ name: '', price: '' });
  const [nf,     setNf]     = useState({ q: '', a: '' });
  const [saving, setSaving] = useState(false);
  const upd = k => v => setB(p => ({ ...p, [k]: v }));

  const info = t => (
    <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/20 flex items-start gap-4 mb-6">
      <Sparkles className="text-primary shrink-0 mt-0.5" size={16} />
      <p className="text-xs text-secondary font-medium leading-relaxed italic opacity-80">{t}</p>
    </div>
  );

  const pages = [
    // Passo 1 — Negócio
    <div key="n" className="space-y-6 animate-fade-in">
      {info('Estas informações alimentam o núcleo da IA — ela entende o negócio e fala com precisão.')}
      <Selct label="Segmento *" value={b.segment} onChange={upd('segment')} options={SEGMENTS} icon={Activity} />
      <Inp   label="Proposta de Valor *" value={b.description} onChange={upd('description')} placeholder="O que a empresa faz, público-alvo, diferenciais…" rows={4} icon={Briefcase} />
      <div className="grid grid-cols-2 gap-6">
        <Inp label="Site"      value={b.site}      onChange={upd('site')}      placeholder="meunegocio.com.br" icon={Layout} />
        <Inp label="Instagram" value={b.instagram} onChange={upd('instagram')} placeholder="@usuario"          icon={Activity} />
      </div>
    </div>,

    // Passo 2 — Persona
    <div key="ia" className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        <Inp label='Codinome da Assistente *' value={b.ai_name} onChange={upd('ai_name')} placeholder='"Ana", "Max"' icon={User} />
        <Selct label="Arquétipo de Voz *" value={b.ai_tone} onChange={upd('ai_tone')} options={TONES} icon={Brain} />
      </div>
      <div className="space-y-3">
        <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Objetivo Estratégico *</label>
        <div className="flex flex-wrap gap-3">
          {GOALS.map(g => <Chip key={g} active={b.ai_goal === g} onClick={() => upd('ai_goal')(g)}>{g}</Chip>)}
        </div>
      </div>
      <Inp label="Grade de Horários *" value={b.business_hours} onChange={upd('business_hours')} placeholder="Seg–Sex 8h–18h | Sáb 8h–13h" icon={Clock} />
      <div className="pt-6 border-t border-border-subtle">
        <h5 className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
          <ShieldCheck size={12} className="text-primary" /> Protocolo de Transbordo
        </h5>
        <div className="grid grid-cols-2 gap-6">
          <Inp label="Gatilho"  value={b.escalation_trigger} onChange={upd('escalation_trigger')} placeholder="Urgências, reclamações…" rows={3} icon={AlertTriangle} />
          <Inp label="Contato"  value={b.escalation_number}  onChange={upd('escalation_number')}  placeholder="+55 11 9 0000-0000"       icon={Smartphone} />
        </div>
      </div>
    </div>,

    // Passo 3 — Serviços
    <div key="s" className="space-y-6 animate-fade-in">
      {info('Liste os principais serviços. A IA usará este portfólio para responder sobre preços e disponibilidade.')}
      <div className="space-y-3">
        {b.services.map((s, i) => (
          <div key={i} className="flex items-center gap-4 bg-surface-up/20 p-4 rounded-[24px] border border-border-subtle">
            <div className="flex-1">
              <div className="text-sm font-black text-main">{s.name}</div>
              <div className="text-[10px] text-primary font-black mt-0.5">{s.price || 'SOB CONSULTA'}</div>
            </div>
            <button onClick={() => setB(p => ({ ...p, services: p.services.filter((_, j) => j !== i) }))}
              className="h-9 w-9 rounded-xl bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-[28px] bg-surface-up/30 border border-border-subtle space-y-4">
        <Inp label="Nome do serviço" value={ns.name} onChange={v => setNs(p => ({ ...p, name: v }))} placeholder="Ex: Avaliação Inicial" icon={Plus} />
        <div className="grid grid-cols-2 gap-4">
          <Inp label="Valor" value={ns.price} onChange={v => setNs(p => ({ ...p, price: v }))} placeholder="R$ 0,00" icon={DollarSign} />
          <div className="flex items-end">
            <Btn onClick={() => { if (!ns.name.trim()) return; setB(p => ({ ...p, services: [...p.services, { ...ns }] })); setNs({ name: '', price: '' }); }} className="w-full h-[54px]" icon={Plus}>
              Adicionar
            </Btn>
          </div>
        </div>
      </div>
    </div>,

    // Passo 4 — FAQs
    <div key="f" className="space-y-6 animate-fade-in">
      {info('Cada resposta vira conhecimento direto da IA — eliminando alucinações e erros operacionais.')}
      <div className="space-y-3">
        {b.faqs.map((f, i) => (
          <div key={i} className="bg-surface-up/20 p-5 rounded-[24px] border border-border-subtle space-y-2 relative group">
            <div className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><HelpCircle size={12} /> Pergunta</div>
            <div className="text-sm font-bold text-main">{f.q}</div>
            <div className="text-xs text-secondary leading-relaxed italic border-l-2 border-primary/20 pl-3">"{f.a}"</div>
            <button onClick={() => setB(p => ({ ...p, faqs: p.faqs.filter((_, j) => j !== i) }))}
              className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-red-500/5 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-[28px] bg-surface-up/30 border border-border-subtle space-y-4">
        <Inp label="Pergunta Frequente" value={nf.q} onChange={v => setNf(p => ({ ...p, q: v }))} placeholder="Vocês atendem aos sábados?" icon={HelpCircle} />
        <Inp label="Resposta"          value={nf.a} onChange={v => setNf(p => ({ ...p, a: v }))} placeholder="Sim! Das 8h às 13h." rows={3} icon={CheckCircle2} />
        <Btn onClick={() => { if (!nf.q.trim() || !nf.a.trim()) return; setB(p => ({ ...p, faqs: [...p.faqs, { ...nf }] })); setNf({ q: '', a: '' }); }} className="w-full" icon={Plus}>
          Memorizar Regra
        </Btn>
      </div>
    </div>,

    // Passo 5 — Regras
    <div key="r" className="space-y-6 animate-fade-in">
      <div className="p-5 rounded-[24px] bg-cta/5 border border-cta/20 flex items-start gap-4">
        <Shield size={18} className="text-cta shrink-0 mt-0.5" strokeWidth={2.5} />
        <p className="text-xs text-cta font-black uppercase tracking-widest leading-relaxed">
          Defina barreiras críticas. O que a IA <span className="underline">jamais</span> deve processar sem aval humano.
        </p>
      </div>
      <Inp label="Restrições e Zonas Proibidas"  value={b.restrictions} onChange={upd('restrictions')} placeholder="Ex: nunca confirmar diagnósticos médicos…" rows={4} icon={ShieldCheck} />
      <Inp label="Ofertas e Comunicados Temporários" value={b.promotions} onChange={upd('promotions')} placeholder="Ex: 20% off em consultas de Maio…"           rows={3} icon={Zap} />
    </div>,

    // Passo 6 — Plano
    <div key="p" className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { p: 'Starter', price: 'R$ 197', f: ['Texto + Imagem', '1 Agente Local', 'Suporte VIP'] },
          { p: 'Pro',     price: 'R$ 397', f: ['Multimodal (Áudio/Img)', 'Google Agenda', 'IA Cognitiva'] },
          { p: 'Enterprise', price: 'R$ 897', f: ['Fluxos Custom', 'Tokens Ilimitados', 'Setup Dedicado'] },
        ].map(({ p, price, f }) => {
          const pm  = PLAN_META[p];
          const sel = plan === p;
          return (
            <div key={p} onClick={() => setPlan(p)} className={`relative overflow-hidden cursor-pointer rounded-[28px] p-6 border transition-all duration-500 ${sel ? 'bg-primary/10 border-primary ring-1 ring-primary/20 scale-105' : 'bg-surface-up/30 border-border-subtle hover:border-primary/30'}`}>
              <div className="flex justify-between items-start mb-5">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${sel ? 'text-primary' : 'text-tertiary'}`}>{p}</span>
                {sel && <CheckCircle2 className="text-primary animate-pulse" size={16} />}
              </div>
              <div className="text-2xl font-black text-main tracking-tighter mb-5">{price}</div>
              <div className="space-y-2">
                {f.map(x => (
                  <div key={x} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary/70">
                    <Check size={10} className="text-primary" strokeWidth={3} /> {x}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>,
  ];

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(b, plan); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[400] flex items-center justify-center p-8">
      <Card className="w-full max-w-4xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 py-7 border-b border-border-subtle bg-surface-up/20 flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold text-main">Configurar IA</h4>
            <p className="text-sm text-tertiary mt-0.5">{STEPS[step].label}</p>
          </div>
          <button onClick={onCancel} className="h-11 w-11 rounded-2xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex gap-4 px-10 border-b border-border-subtle bg-surface-up/10 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)}
              className={`py-5 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${step === i ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}>
              <s.icon size={14} strokeWidth={step === i ? 3 : 2} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
              {i < step && <CheckCircle2 size={10} className="text-primary" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">{pages[step]}</div>

        {/* Footer */}
        <div className="p-8 border-t border-border-subtle bg-surface-up/30 flex justify-between items-center">
          <div className="text-sm text-tertiary">Passo {step + 1} de {STEPS.length}</div>
          <div className="flex gap-4">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-7 py-3.5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-surface transition-all cursor-pointer flex items-center gap-2">
                <ArrowLeft size={12} /> Voltar
              </button>
            )}
            {step < STEPS.length - 1 && <Btn onClick={() => setStep(s => s + 1)} className="px-9" icon={ArrowRight}>Próximo</Btn>}
            {step === STEPS.length - 1 && (
              <Btn onClick={handleSave} disabled={saving} icon={CheckCircle2}>
                {saving ? 'Salvando...' : 'Concluir'}
              </Btn>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
