import { useState, useEffect } from "react";
import { Tokens } from "../../lib/db";
import { 
  Eye, EyeOff, Save, Key, ShieldCheck, 
  AlertTriangle, ChevronRight, Lock, User,
  Smartphone, Database, Brain
} from "lucide-react";
import { Card, PageTitle, Btn, Inp } from "../../pages/ClientPortal";

function TokenField({ label, hint, value, onChange, icon: Icon }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em]">{label}</label>
        {hint && <span className="text-[9px] text-tertiary font-medium opacity-50 lowercase tracking-tight italic">{hint}</span>}
      </div>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors">
           {Icon ? <Icon size={18} /> : <Lock size={18} />}
        </div>
        <input 
          type={show ? "text" : "password"} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full pl-14 pr-14 py-4 bg-surface/50 border border-border-subtle rounded-2xl text-main text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 font-medium tracking-wider"
        />
        <button 
          onClick={() => setShow(s => !s)} 
          className="absolute right-5 top-1/2 -translate-y-1/2 text-tertiary hover:text-primary transition-colors cursor-pointer"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function ClientTokenPanel({ client }) {
  const [tokens, setTokens] = useState({ openai_key: "", waba_token: "", waba_verify_token: "", phone_number_id: "", waba_id: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    Tokens.get(client.id).then(t => { if (t) setTokens(t); });
  }, [open, client.id]);

  const save = async () => {
    setSaving(true);
    try {
      await Tokens.update(client.id, tokens);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  return (
    <div className={`bento-card p-0 overflow-hidden transition-all duration-500 ${open ? 'border-primary/30 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'border-border-subtle hover:border-slate-700'}`}>
      <button 
        onClick={() => setOpen(o => !o)} 
        className="w-full px-10 py-8 flex items-center gap-8 bg-transparent hover:bg-surface/30 transition-all cursor-pointer text-left"
      >
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20 shadow-2xl transition-transform group-hover:rotate-6">
          {client.avatar || client.name?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-black text-main tracking-tight uppercase italic">{client.name}</h4>
          <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1 opacity-60">{client.plan} • {client.email}</p>
        </div>
        <div className={`transition-all duration-500 ${open ? 'rotate-90 text-primary' : 'text-tertiary'}`}>
           <ChevronRight size={24} />
        </div>
      </button>

      {open && (
        <div className="px-10 pb-10 space-y-10 animate-fade-in border-t border-border/50 pt-10">
          <div className="premium-glow opacity-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
             <div className="space-y-10">
                <TokenField label="OpenAI API Key" hint="GPT-4o & Whisper Core" value={tokens.openai_key} onChange={v => setTokens(p => ({ ...p, openai_key: v }))} icon={Brain} />
                <TokenField label="WhatsApp Cloud API Token" hint="Meta Permanent Token" value={tokens.waba_token} onChange={v => setTokens(p => ({ ...p, waba_token: v }))} icon={Smartphone} />
             </div>
             <div className="space-y-10">
                <TokenField label="Verify Token (Webhook)" hint="Handshake Protocol" value={tokens.waba_verify_token} onChange={v => setTokens(p => ({ ...p, waba_verify_token: v }))} icon={ShieldCheck} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TokenField label="Phone ID" value={tokens.phone_number_id} onChange={v => setTokens(p => ({ ...p, phone_number_id: v }))} icon={Database} />
                  <TokenField label="WABA ID" value={tokens.waba_id} onChange={v => setTokens(p => ({ ...p, waba_id: v }))} icon={Database} />
                </div>
             </div>
          </div>
          
          <div className="relative z-10 pt-4">
             <Btn 
                onClick={save} 
                disabled={saving} 
                className={`w-full py-5 ${saved ? 'bg-emerald-500 text-black border-emerald-500 shadow-emerald-500/20' : ''}`}
                icon={saved ? CheckCircle2 : Save}
              >
               {saving ? "Encriptando..." : saved ? "Protocolo Atualizado" : "Sincronizar Credenciais"}
             </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TokensView({ clients }) {
  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={Key} title="Cofre de Credenciais" subtitle="Gerenciamento seguro de chaves de API e tokens de autenticação por clínica." />

      <div className="p-8 rounded-[32px] bg-amber-500/5 border border-amber-500/20 flex gap-6 items-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-500/20">
           <AlertTriangle size={24} />
        </div>
        <div className="relative z-10">
           <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Alerta de Segurança</h4>
           <p className="text-xs text-secondary font-medium opacity-80 leading-relaxed">Mantenha os tokens sempre atualizados. Credenciais inválidas ou expiradas causarão a interrupção imediata dos serviços cognitivos.</p>
        </div>
      </div>

      <div className="space-y-6">
        {clients.map(c => <ClientTokenPanel key={c.id} client={c} />)}
        {clients.length === 0 && (
          <div className="py-40 text-center opacity-30 border border-dashed border-border-subtle rounded-[48px]">
            <Key size={64} strokeWidth={1} className="mx-auto mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum ecossistema provisionado</p>
          </div>
        )}
      </div>
    </div>
  );
}
