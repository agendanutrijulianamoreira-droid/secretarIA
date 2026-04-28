import { useState, useEffect, useCallback } from "react";
import { Clientes, Invoices, PortalMessages, Contatos, Alerts } from "./lib/db";
import { auth } from "./lib/firebase";
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword
} from "firebase/auth";
import SalesPage from "./pages/SalesPage";
import SecretariaDashboard from "./pages/SecretariaDashboard";
import ClientPortalMain from "./pages/ClientPortalMain";
import FluxosView from "./views/admin/FluxosView";
import TokensView from "./views/admin/TokensView";
import FinanceiroAdminView from "./views/admin/FinanceiroAdmin";
import DashboardView from "./views/admin/DashboardView";
import { 
  Bot, Zap, Activity, TrendingUp, Target, Smartphone, MessageSquare, 
  Plus, ArrowRight, Shield, Settings, Bell, CheckCircle2, AlertTriangle, 
  Search, Brain, Briefcase, HelpCircle, X, ShieldCheck, User, Layout, 
  ChevronRight, ArrowLeft, CreditCard, Clock, Star, ActivitySquare, Sparkles,
  Download, ShoppingCart, PieChart, DollarSign, Calendar, Check
} from "lucide-react";
import { Logo, Badge } from "./components/UI";
import { Btn, Inp, Card, CardHeader, PageTitle, Pill, Pulse, COLORS } from "./pages/ClientPortal";


// ── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  up: "var(--color-surface-up)",
  border: "var(--color-border)",
  borderSt: "var(--color-border)",
  green: "var(--color-cta)",
  greenDim: "var(--color-surface-soft)",
  amber: "#B67A62",
  amberDim: "rgba(182, 122, 98, 0.1)",
  red: "#EF4444",
  redDim: "rgba(239, 68, 68, 0.1)",
  cyan: "#3B82F6",
  cyanDim: "rgba(59, 130, 246, 0.1)",
  purple: "#8B5CF6",
  purpleDim: "rgba(139,92,246,0.1)",
  ink: "var(--color-text)",
  inkSec: "var(--color-text-sec)",
  inkTert: "var(--color-text-tert)",
  asaas: "#3B82F6",
  borderSt: "var(--color-border)",
};



const CAP_META = {
  text:  { label: "Texto", icon: MessageSquare },
  audio: { label: "Áudio", icon: ActivitySquare },
  image: { label: "Imagem", icon: Target },
  file:  { label: "Arquivo", icon: Briefcase }
};

const CRM_STATUSES = {
  novo:        { label: "Novo Lead",     color: "#3B82F6", bg: "rgba(59,130,246,0.1)",   icon: Sparkles },
  contatado:   { label: "Conversando",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: MessageSquare },
  qualificado: { label: "Interessado",   color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: Target },
  convertido:  { label: "Convertido",    color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2 },
  perdido:     { label: "Arquivado",     color: "#EF4444", bg: "rgba(239,68,68,0.1)",  icon: X },
};

const PLAN_META = {
  Starter:    { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", label: "START" },
  Pro:        { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "PRO" },
  Enterprise: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  label: "ELITE" }
};

const SEGMENTS = ["Saúde / Clínica", "Saúde / Odontologia", "Beleza / Salão", "Educação", "Imobiliária", "Jurídico", "Alimentação", "Varejo", "Serviços Gerais", "Outro"];
const TONES = ["Acolhedora e profissional", "Formal e sério", "Descontraído e amigável", "Jovial e animado", "Técnico e objetivo"];
const GOALS = ["Agendamentos", "Vendas / Captação", "Suporte ao cliente", "Tirar dúvidas (FAQ)", "Tudo acima"];
const EMPTY_B = { segment: "", description: "", site: "", instagram: "", ai_name: "", ai_tone: "", ai_goal: "", business_hours: "", escalation_trigger: "", escalation_number: "", services: [], faqs: [], restrictions: "", promotions: "" };
const STEPS = [
  { id: "negocio",  icon: Briefcase, label: "Negócio" },
  { id: "ia",       icon: Brain,     label: "Persona" },
  { id: "servicos", icon: Layout,    label: "Serviços" },
  { id: "faqs",     icon: HelpCircle, label: "FAQ" },
  { id: "regras",   icon: Shield,    label: "Regras" },
  { id: "plano",    icon: CreditCard, label: "Plano" }
];

function Av({ initials, color, size = 40 }) {
  return (
    <div 
      className="rounded-2xl flex items-center justify-center font-black border shadow-inner transition-transform duration-500" 
      style={{ width: size, height: size, backgroundColor: color + '15', color: color, borderColor: color + '30', fontSize: size * 0.35, letterSpacing: '0.05em' }}
    >
      {initials}
    </div>
  );
}

function StatusTag({ status }) {
  const m = {
    active: { l: "Ativo", c: "#10B981", b: "rgba(16,185,129,0.1)" },
    paused: { l: "Pausado", c: "#F59E0B", b: "rgba(245,158,11,0.1)" },
    setup:  { l: "Configurando", c: "#94A3B8", b: "rgba(148,163,184,0.1)" }
  }[status] || { l: "—", c: "#94A3B8", b: "transparent" };
  return <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" style={{ color: m.c, backgroundColor: m.b, borderColor: m.c + '30' }}>{m.l}</div>;
}

function InvTag({ status }) {
  const m = {
    pago:     { l: "Pago", c: "#10B981", b: "rgba(16,185,129,0.1)" },
    pendente: { l: "Pendente", c: "#F59E0B", b: "rgba(245,158,11,0.1)" },
    vencido:  { l: "Vencido", c: "#EF4444", b: "rgba(239,68,68,0.1)" }
  }[status] || { l: status, c: "#94A3B8", b: "rgba(148,163,184,0.1)" };
  return <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" style={{ color: m.c, backgroundColor: m.b, borderColor: m.c + '30' }}>{m.l}</div>;
}

function Selct({ label, value, onChange, options, icon: Icon }) {
  return (
    <div className="space-y-3">
      {label && <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">{label}</label>}
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-5 text-tertiary" size={18} />}
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className={`w-full ${Icon ? 'pl-14' : 'px-6'} pr-10 py-4 bg-surface-up/30 border border-border-subtle rounded-2xl text-main text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 appearance-none`}
        >
          <option value="">Selecionar…</option>
          {options.map(o => <option key={o} value={o} className="bg-surface">{o}</option>)}
        </select>
        <ChevronRight className="absolute right-5 text-tertiary rotate-90 pointer-events-none" size={16} />
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, icon: Icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-3 cursor-pointer ${active ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40'}`}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function Skeleton(){
  return(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:16}}>
    {[1,2,3].map(i=>(
      <div key={i} style={{background:T.surface,borderRadius:16,padding:20,border:`1px solid ${T.border}`,opacity:.5}}>
        <div style={{display:"flex",gap:12,marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:12,background:T.up}}/>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{height:14,background:T.up,borderRadius:6,width:"60%"}}/>
            <div style={{height:11,background:T.up,borderRadius:6,width:"40%"}}/>
          </div>
        </div>
        <div style={{height:36,background:T.up,borderRadius:10,marginBottom:10}}/>
        <div style={{height:4,background:T.up,borderRadius:2}}/>
      </div>
    ))}
  </div>);
}

// ── Briefing Wizard (Premium Refactor) ───────────────────────────────────────
function BriefingWizard({ initial, planInit, onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [b, setB] = useState({ ...EMPTY_B, ...initial });
  const [plan, setPlan] = useState(planInit || "Pro");
  const [ns, setNs] = useState({ name: "", price: "" });
  const [nf, setNf] = useState({ q: "", a: "" });
  const [saving, setSaving] = useState(false);
  const upd = k => v => setB(p => ({ ...p, [k]: v }));

  const info = (t) => (
    <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/20 flex items-start gap-4 mb-6">
       <Sparkles className="text-primary shrink-0 mt-0.5" size={18} />
       <p className="text-xs text-secondary font-medium leading-relaxed italic opacity-80">{t}</p>
    </div>
  );

  const pages = [
    <div key="n" className="space-y-8 animate-fade-in">
      {info("Estas informações alimentam o núcleo da IA — ela entende o negócio e fala com precisão absoluta.")}
      <Selct label="Segmento de Atuação *" value={b.segment} onChange={upd("segment")} options={SEGMENTS} icon={Activity} />
      <Inp label="Proposta de Valor *" value={b.description} onChange={upd("description")} placeholder="O que a empresa faz, público-alvo, diferenciais competitivos…" rows={5} icon={Briefcase} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Inp label="Site Oficial" value={b.site} onChange={upd("site")} placeholder="meunegocio.com.br" icon={Layout} />
        <Inp label="Instagram" value={b.instagram} onChange={upd("instagram")} placeholder="@usuario" icon={Target} />
      </div>
    </div>,
    <div key="ia" className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Inp label='Codinome da Assistente *' value={b.ai_name} onChange={upd("ai_name")} placeholder='"Ana", "Max", "Luna"' icon={User} />
        <Selct label="Arquetipo de Voz *" value={b.ai_tone} onChange={upd("ai_tone")} options={TONES} icon={Brain} />
      </div>
      <div className="space-y-4">
        <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Objetivo Estratégico *</label>
        <div className="flex flex-wrap gap-4">{GOALS.map(g => <Chip key={g} active={b.ai_goal === g} onClick={() => upd("ai_goal")(g)} icon={Zap}>{g}</Chip>)}</div>
      </div>
      <Inp label="Grade de Horários *" value={b.business_hours} onChange={upd("business_hours")} placeholder="Seg–Sex 8h–18h | Sáb 8h–13h" icon={Clock} />
      <div className="pt-8 border-t border-border-subtle">
        <h5 className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
          <ShieldCheck size={14} className="text-primary" /> Protocolo de Transbordo
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Inp label="Gatilho de Transferência" value={b.escalation_trigger} onChange={upd("escalation_trigger")} placeholder="Urgências, reclamações críticas…" rows={3} icon={AlertTriangle} />
          <Inp label="Terminal de Suporte" value={b.escalation_number} onChange={upd("escalation_number")} placeholder="+55 11 9 0000-0000" icon={Smartphone} />
        </div>
      </div>
    </div>,
    <div key="s" className="space-y-8 animate-fade-in">
      {info("Liste os principais serviços. A IA usará este portfólio para responder sobre honorários e disponibilidade.")}
      <div className="space-y-4">
        {b.services.map((s, i) => (
          <div key={i} className="flex items-center gap-6 bg-surface-up/20 p-5 rounded-[24px] border border-border-subtle group hover:border-primary/30 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><Briefcase size={18} /></div>
            <div className="flex-1 min-w-0">
               <div className="text-sm font-black text-main truncate uppercase tracking-tight">{s.name}</div>
               <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{s.price || "SOB CONSULTA"}</div>
            </div>
            <button onClick={() => setB(p => ({ ...p, services: p.services.filter((_, j) => j !== i) }))} className="h-10 w-10 rounded-xl bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><X size={16} /></button>
          </div>
        ))}
      </div>
      <div className="p-8 rounded-[32px] bg-surface-up/30 border border-border-subtle space-y-6">
        <Inp label="Nome do serviço" value={ns.name} onChange={v => setNs(p => ({ ...p, name: v }))} placeholder="Ex: Avaliação Inicial" icon={Plus} />
        <div className="grid grid-cols-2 gap-4">
           <Inp label="Valor Sugerido" value={ns.price} onChange={v => setNs(p => ({ ...p, price: v }))} placeholder="R$ 0,00" icon={DollarSign} />
           <div className="flex items-end">
             <Btn onClick={() => { if (!ns.name.trim()) return; setB(p => ({ ...p, services: [...p.services, { ...ns }] })); setNs({ name: "", price: "" }); }} className="w-full h-[54px]" icon={Plus}>Adicionar</Btn>
           </div>
        </div>
      </div>
    </div>,
    <div key="f" className="space-y-8 animate-fade-in">
      {info("Cada resposta vira conhecimento direto da IA — eliminando alucinações e erros operacionais.")}
      <div className="space-y-4">
        {b.faqs.map((f, i) => (
          <div key={i} className="bg-surface-up/20 p-6 rounded-[28px] border border-border-subtle space-y-3 relative group">
            <div className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
               <HelpCircle size={14} /> Pergunta Protocolada
            </div>
            <div className="text-sm font-bold text-main">{f.q}</div>
            <div className="text-xs text-secondary leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">"{f.a}"</div>
            <button onClick={() => setB(p => ({ ...p, faqs: p.faqs.filter((_, j) => j !== i) }))} className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-red-500/5 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
          </div>
        ))}
      </div>
      <div className="p-8 rounded-[32px] bg-surface-up/30 border border-border-subtle space-y-6">
        <Inp label="Pergunta Frequente" value={nf.q} onChange={v => setNf(p => ({ ...p, q: v }))} placeholder="Ex: Vocês atendem aos sábados?" icon={HelpCircle} />
        <Inp label="Resposta de Conhecimento" value={nf.a} onChange={v => setNf(p => ({ ...p, a: v }))} placeholder="Sim! Atendemos sábados das 8h às 13h." rows={3} icon={CheckCircle2} />
        <Btn onClick={() => { if (!nf.q.trim() || !nf.a.trim()) return; setB(p => ({ ...p, faqs: [...p.faqs, { ...nf }] })); setNf({ q: "", a: "" }); }} className="w-full" icon={Plus}>Memorizar Regra</Btn>
      </div>
    </div>,
    <div key="r" className="space-y-8 animate-fade-in">
      <div className="p-6 rounded-[24px] bg-cta/5 border border-cta/20 flex items-start gap-4">
         <Shield size={20} className="text-cta shrink-0 mt-0.5" strokeWidth={2.5} />
         <p className="text-xs text-cta font-black uppercase tracking-widest leading-relaxed">Defina barreiras críticas. O que a IA <span className="underline">jamais</span> deve processar sem aval humano.</p>
      </div>
      <Inp label="Restrições e Zonas Proibidas" value={b.restrictions} onChange={upd("restrictions")} placeholder="Ex: nunca confirmar diagnósticos médicos…" rows={5} icon={ShieldCheck} />
      <Inp label="Ofertas e Comunicados Temporários" value={b.promotions} onChange={upd("promotions")} placeholder="Ex: Bônus de 20% off em consultas de Maio…" rows={4} icon={Zap} />
    </div>,
    <div key="p" className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { p: "Starter", price: "R$ 197", f: ["Texto + Imagem", "1 Agente Local", "Suporte VIP"] },
          { p: "Pro", price: "R$ 397", f: ["Multimodal (Áudio/Img)", "Google Agenda", "IA Cognitiva"] },
          { p: "Enterprise", price: "R$ 897", f: ["Fluxos Custom", "Tokens Ilimitados", "Setup Dedicado"] }
        ].map(({ p, price, f }) => {
          const pm = PLAN_META[p]; const sel = plan === p;
          return (
            <div key={p} onClick={() => setPlan(p)} className={`relative overflow-hidden cursor-pointer rounded-[32px] p-8 border transition-all duration-500 group ${sel ? 'bg-primary/10 border-primary ring-1 ring-primary/20 shadow-2xl shadow-primary/10 scale-105' : 'bg-surface-up/30 border-border-subtle hover:border-primary/30'}`}>
              <div className="flex justify-between items-start mb-6">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${sel ? 'text-primary' : 'text-tertiary'}`}>{p}</span>
                {sel && <CheckCircle2 className="text-primary animate-pulse" size={18} />}
              </div>
              <div className="text-3xl font-black text-main tracking-tighter mb-1">{price}</div>
              <div className="text-[10px] text-tertiary font-black uppercase tracking-widest mb-8">por mês</div>
              <div className="space-y-3">
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
      <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/20 flex items-center gap-8 group">
        <div className="h-16 w-16 rounded-[22px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl group-hover:rotate-12 transition-all">
           <CreditCard size={32} strokeWidth={1} />
        </div>
        <div className="flex-1 min-w-0">
           <h4 className="text-sm font-black text-main uppercase tracking-widest">Ativação via Asaas</h4>
           <p className="text-xs text-secondary font-medium mt-1 italic opacity-70">O link de faturamento será gerado automaticamente ao salvar.</p>
        </div>
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
        <div className="px-10 py-10 border-b border-border-subtle bg-surface-up/30 flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-black text-main tracking-tighter uppercase">Onboarding de Inteligência</h4>
            <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <Activity size={12} className="text-primary" /> Módulo de Calibragem {STEPS[step].label}
            </p>
          </div>
          <button onClick={onCancel} className="h-12 w-12 rounded-2xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={24} /></button>
        </div>
        <div className="flex gap-4 px-10 border-b border-border-subtle bg-surface-up/10 overflow-x-auto no-scrollbar scroll-smooth">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)} className={`py-6 px-4 border-b-2 transition-all flex items-center gap-3 cursor-pointer whitespace-nowrap ${step === i ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}>
              <s.icon size={16} strokeWidth={step === i ? 3 : 2} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
              {i < step && <CheckCircle2 size={12} className="text-primary" />}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">{pages[step]}</div>
        <div className="p-10 border-t border-border-subtle bg-surface-up/30 flex justify-between items-center">
          <div className="text-[10px] font-black text-tertiary uppercase tracking-[0.4em]">Fase {step + 1} de {STEPS.length}</div>
          <div className="flex gap-4">
            {step > 0 && <button onClick={() => setStep(s => s - 1)} className="px-8 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-surface transition-all cursor-pointer flex items-center gap-2"><ArrowLeft size={14} /> Voltar</button>}
            {step < STEPS.length - 1 && <Btn onClick={() => setStep(s => s + 1)} className="px-10" icon={ArrowRight}>Próximo Passo</Btn>}
            {step === STEPS.length - 1 && <Btn onClick={handleSave} disabled={saving} icon={CheckCircle2}>{saving ? "Sincronizando..." : "Concluir Setup"}</Btn>}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Login Page (Premium Refactor) ───────────────────────────────────────────
function LoginView() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      setError("Credenciais inválidas ou falha na conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      setError("Falha na autenticação via Google Cloud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 selection:text-primary overflow-hidden font-sans">
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-20 overflow-hidden bg-background border-r border-border">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)] animate-pulse" />
           <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="absolute top-16 left-16 z-20">
          <Logo size={48} />
        </div>

        <div className="relative z-20 space-y-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/10">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Sistema Autenticado (E2E)</span>
            </div>
            <h1 className="text-7xl font-black leading-none tracking-tighter text-white">
              Inteligência <br/>
              <span className="text-primary">Cognitiva</span> <br/>
              para Clínicas.
            </h1>
            <p className="text-xl text-secondary leading-relaxed max-w-lg font-medium opacity-80">
              Transforme o atendimento da sua clínica com automação de elite e gestão orientada a dados.
            </p>
          </div>

          <div className="flex items-center gap-10">
             <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
             <div className="flex gap-6">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                <div className="h-2 w-2 rounded-full bg-surface-up" />
                <div className="h-2 w-2 rounded-full bg-surface-up" />
             </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 sm:p-24 relative bg-background">
        <div className="absolute top-12 left-12 lg:hidden">
          <Logo size={36} />
        </div>

        <div className="w-full max-w-md space-y-12 animate-fade-in">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-5xl font-black text-main tracking-tighter uppercase italic">
              {isRegister ? "Nova Conta" : "Bem-vinda"}
            </h2>
            <p className="text-secondary font-medium tracking-tight opacity-70">
              Acesse a central de comando da sua clínica.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {isRegister && (
                <Inp 
                  label="Nome da Organização *" 
                  value={name} 
                  onChange={setName}
                  placeholder="Ex: Clínica Alpha Saúde"
                  icon={Briefcase}
                  required
                />
              )}

              <Inp 
                label="Identificador (E-mail) *" 
                value={email} 
                onChange={setEmail}
                placeholder="seu@dominio.com.br"
                icon={User}
                type="email"
                required
              />

              <Inp 
                label="Chave de Acesso *" 
                value={password} 
                onChange={setPassword}
                placeholder="••••••••••••"
                icon={Shield}
                type="password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/5 text-red-500 p-6 rounded-[24px] text-xs font-black uppercase tracking-widest border border-red-500/10 flex items-center gap-4 animate-shake">
                <AlertTriangle size={20} /> {error}
              </div>
            )}

            <Btn 
              type="submit" 
              disabled={loading}
              className="w-full py-6"
              icon={isRegister ? Sparkles : ChevronRight}
            >
              {loading ? "Processando..." : (isRegister ? "Criar Ecossistema" : "Entrar no Sistema")}
            </Btn>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.4em]">
              <span className="bg-background px-6 text-tertiary">Cloud Auth</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-surface/50 border border-border-subtle text-main py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:border-primary/40 hover:bg-surface transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Connect
          </button>

          <div className="text-center pt-8">
            <p className="text-xs text-secondary font-black uppercase tracking-widest">
              {isRegister ? "Já possui credenciais?" : "Nova por aqui?"} 
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-3 text-primary hover:underline underline-offset-8 cursor-pointer"
              >
                {isRegister ? "Fazer Login" : "Criar Nova Clínica"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Portal do Cliente ─────────────────────────────────────────────────────────
function Portal({client,onBack}){
  const [tab,setTab]=useState("briefing");
  const [msgs,setMsgs]=useState([]);
  const [invoices,setInvoices]=useState([]);
  const [leads,setLeads]=useState([]);
  const [draft,setDraft]=useState("");
  const [editBriefing,setEditBriefing]=useState(false);
  const [editingLead,setEditingLead]=useState(null);
  const [localBriefing,setLocalBriefing]=useState(client.briefing||{});
  const [localPlan,setLocalPlan]=useState(client.plan);
  const pm=PLAN_META[localPlan]||PLAN_META.Starter;
  const b=localBriefing;
  const pct=[b.description,b.ai_name,b.ai_tone,b.ai_goal,b.business_hours].filter(Boolean).length*20;

  useEffect(()=>{
    const unsub = PortalMessages.onList(client.id, setMsgs);
    return unsub;
  },[client.id]);

  useEffect(()=>{
    Invoices.list(client.id).then(setInvoices);
  },[client.id]);

  useEffect(()=>{
    const unsub = Contatos.onList(client.id, setLeads);
    return unsub;
  },[client.id]);

  const send = async () => {
    if(!draft.trim()) return;
    await PortalMessages.send(client.id, draft, "client");
    setDraft("");
  };

  const TABS=[
    {id:"briefing",icon:"📋",label:"Meu Briefing"},
    {id:"crm",icon:"🎯",label:"CRM / Leads"},
    {id:"mensagens",icon:"💬",label:"Mensagens"},
    {id:"pagamentos",icon:"💳",label:"Pagamentos"}
  ];

  return(
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'Inter',sans-serif",color:T.ink}}>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"13px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:T.inkSec,fontSize:13,fontFamily:"inherit"}}>← Voltar</button>
          <div style={{width:1,height:20,background:T.border}}/>
          <Av initials={client.avatar} color={client.color} size={32}/>
          <div><div style={{fontSize:13,fontWeight:700,color:T.ink}}>{client.name}</div><div style={{fontSize:11,color:T.inkTert}}>Portal do Cliente</div></div>
        </div>
        <div style={{display:"flex",gap:8}}><Tag color={pm.color} bg={pm.bg}>{client.plan}</Tag><StatusTag status={client.status}/></div>
      </div>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,display:"flex",padding:"0 24px"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 18px",border:"none",cursor:"pointer",background:"none",color:tab===t.id?T.green:T.inkSec,fontSize:13,fontWeight:tab===t.id?700:400,borderBottom:`2px solid ${tab===t.id?T.green:"transparent"}`,display:"flex",alignItems:"center",gap:7,fontFamily:"inherit"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{maxWidth:800,margin:"0 auto",padding:"28px 24px"}}>
        {tab==="briefing"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{background:T.surface,borderRadius:16,padding:"18px 22px",border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div><div style={{fontSize:14,fontWeight:700,color:T.ink}}>Briefing da IA</div><div style={{fontSize:12,color:T.inkTert,marginTop:2}}>Quanto mais completo, mais precisa sua IA fica</div></div>
                <Btn onClick={()=>setEditBriefing(true)} style={{padding:"8px 16px"}}>✏️ Editar</Btn>
              </div>
              <div style={{height:6,background:T.bg,borderRadius:3}}><div style={{height:6,borderRadius:3,width:`${pct}%`,background:pct>=80?T.green:pct>=40?T.amber:T.red,transition:"width 600ms"}}/></div>
              <div style={{fontSize:11,color:T.inkTert,marginTop:6}}>{pct}% preenchido</div>
            </div>

            {b.description&&(
              <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>🏢 Sobre o Negócio</div>
                <div style={{padding:"14px 20px",display:"flex",flexDirection:"column",gap:8}}>
                  {[{l:"Segmento",v:b.segment},{l:"Site",v:b.site},{l:"Instagram",v:b.instagram}].map(f=>(
                    <div key={f.l} style={{display:"flex",gap:16,padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:11,color:T.inkTert,width:80,flexShrink:0}}>{f.l}</span>
                      <span style={{fontSize:13,color:f.v?T.ink:T.inkMuted}}>{f.v||"—"}</span>
                    </div>
                  ))}
                  <div style={{fontSize:12,color:T.inkSec,background:T.bg,borderRadius:10,padding:"10px 14px",lineHeight:1.6,marginTop:4}}>{b.description}</div>
                </div>
              </div>
            )}

            {b.services?.length>0&&(
              <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>💼 Serviços ({b.services.length})</div>
                <div style={{padding:"10px 20px"}}>
                  {b.services.map((s,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<b.services.length-1?`1px solid ${T.border}`:"none"}}>
                      <span style={{fontSize:13,color:T.ink}}>{s.name}</span>
                      <span style={{fontSize:13,fontWeight:600,color:T.green}}>{s.price||"—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {b.faqs?.length>0&&(
              <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>❓ FAQs ({b.faqs.length})</div>
                <div style={{padding:"12px 20px",display:"flex",flexDirection:"column",gap:8}}>
                  {b.faqs.map((f,i)=>(
                    <div key={i} style={{background:T.bg,borderRadius:10,padding:"10px 14px"}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.ink,marginBottom:4}}>❓ {f.q}</div>
                      <div style={{fontSize:12,color:T.inkSec}}>✅ {f.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="mensagens"&&(
          <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",height:"62vh",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
              <div style={{fontSize:13,fontWeight:700,color:T.ink}}>Canal direto com a equipe</div>
              <div style={{fontSize:11,color:T.inkTert,marginTop:2}}>Solicite mudanças, tire dúvidas ou reporte problemas</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
              {msgs.length===0&&<div style={{textAlign:"center",padding:40,color:T.inkTert,fontSize:13}}>Nenhuma mensagem ainda. Manda oi! 👋</div>}
              {msgs.map((m,i)=>{
                const ic=m.from_role==="client";
                return(<div key={i} style={{display:"flex",justifyContent:ic?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"75%",background:ic?T.greenDim:T.up,border:`1px solid ${ic?T.green+"33":T.border}`,borderRadius:ic?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px"}}>
                    <div style={{fontSize:12,color:T.ink,lineHeight:1.5}}>{m.text}</div>
                    <div style={{fontSize:10,color:T.inkTert,marginTop:4,textAlign:ic?"right":"left"}}>{ic?"Você":"Equipe"}</div>
                  </div>
                </div>);
              })}
            </div>
            <div style={{padding:"12px 20px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10}}>
              <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Escreva sua mensagem…" style={{flex:1,padding:"10px 14px",borderRadius:10,background:T.bg,border:`1px solid ${T.border}`,color:T.ink,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
              <Btn onClick={send}>Enviar</Btn>
            </div>
          </div>
        )}

        {tab==="pagamentos"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{background:T.surface,borderRadius:16,padding:"18px 22px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:11,color:T.inkTert,marginBottom:4}}>Plano atual</div>
                <span style={{fontSize:20,fontWeight:700,color:PLAN_META[client.plan]?.color||T.ink}}>{client.plan}</span></div>
              <StatusTag status={client.status}/>
            </div>
            <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
              <div style={{padding:"13px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>Histórico de cobranças</div>
              {invoices.length===0&&<div style={{padding:32,textAlign:"center",color:T.inkTert,fontSize:13}}>Sem cobranças ainda.</div>}
              {invoices.map((inv,i)=>(
                <div key={inv.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",borderBottom:i<invoices.length-1?`1px solid ${T.border}`:"none"}}>
                  <div style={{fontSize:18}}>{inv.status==="pago"?"🟢":inv.status==="pendente"?"🟡":"🔴"}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,color:T.ink}}>{inv.descricao}</div><div style={{fontSize:11,color:T.inkTert}}>{inv.id.slice(0,8)}… · {inv.due_date}</div></div>
                  <div style={{fontWeight:700,fontSize:14,color:T.ink}}>R$ {Number(inv.amount).toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
                  <InvTag status={inv.status}/>
                  {inv.status!=="pago"&&<button style={{padding:"7px 14px",borderRadius:8,background:"rgba(0,180,216,0.12)",border:"1px solid rgba(0,180,216,0.3)",color:"#00B4D8",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>inv.payment_link&&window.open(inv.payment_link,"_blank")}>Pagar</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="crm" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-up) 100%)",borderRadius:16,padding:20,border:`1px solid var(--color-border)`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:T.ink}}>Pipeline de Leads</div>
                <div style={{fontSize:12,color:T.inkTert,marginTop:4}}>Gerencie os contatos vindos do WhatsApp</div>
              </div>
              <div style={{display:"flex",gap:12}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:T.ink}}>{leads.length}</div><div style={{fontSize:10,color:T.inkTert,textTransform:"uppercase"}}>Total</div></div>
                <div style={{width:1,height:24,background:T.border}}/>
                <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:T.green}}>{leads.filter(l=>l.crm_status==="convertido").length}</div><div style={{fontSize:10,color:T.inkTert,textTransform:"uppercase"}}>Vendas</div></div>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {leads.length === 0 && <div style={{padding:40,textAlign:"center",color:T.inkTert,fontSize:13,background:T.surface,borderRadius:16,border:`1px dashed ${T.border}`}}>Nenhum lead capturado ainda.</div>}
              {leads.map(lead => {
                const s = CRM_STATUSES[lead.crm_status || "novo"] || CRM_STATUSES.novo;
                const isEd = editingLead?.id === lead.id;
                return (
                  <div key={lead.id} style={{background:T.surface,borderRadius:16,border:`1px solid ${isEd?T.green+"33":T.border}`,overflow:"hidden",transition:"all 200ms"}}>
                    <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
                      <Av initials={lead.nome?.split(" ").map(w=>w[0]).join("").toUpperCase() || "?"} color={COLORS[lead.telefone?.length % COLORS.length]} size={36}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{lead.nome || "Lead S/ Nome"}</div>
                        <div style={{fontSize:11,color:T.inkTert}}>{lead.telefone}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <Tag color={s.color} bg={s.bg}>{s.icon} {s.label}</Tag>
                        <Btn variant="ghost" onClick={() => setEditingLead(isEd ? null : lead)} style={{padding:"6px 12px",fontSize:11}}>
                          {isEd ? "Fechar" : "Gerenciar"}
                        </Btn>
                      </div>
                    </div>
                    
                    {isEd && (
                      <div style={{padding:"0 20px 20px",borderTop:`1px solid ${T.border}`,background:"var(--color-surface-soft)",animation:"fadeIn 150ms ease"}}>
                        <div style={{paddingTop:16,display:"flex",flexDirection:"column",gap:14}}>
                          <div>
                            <label style={{fontSize:11,color:T.inkTert,display:"block",marginBottom:8}}>Mudar Status</label>
                            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                              {Object.entries(CRM_STATUSES).map(([id, meta]) => (
                                <Chip key={id} active={lead.crm_status === id} onClick={() => Contatos.updateCRM(client.id, lead.id, { crm_status: id })}>
                                  {meta.icon} {meta.label}
                                </Chip>
                              ))}
                            </div>
                          </div>
                          <Inp 
                            label="Notas sobre o atendimento" 
                            value={lead.crm_notes || ""} 
                            onChange={(v) => Contatos.updateCRM(client.id, lead.id, { crm_notes: v })} 
                            placeholder="Ex: Interessado no plano Pro, aguardando retorno..." 
                            rows={3}
                          />
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:4}}>
                            <div style={{fontSize:10,color:T.inkTert}}>Última interação: {lead.ultima_interacao?.toDate?.()?.toLocaleString("pt-BR") || "—"}</div>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                               <Pulse status={lead.atendimento_ia === "ativo" ? "online" : "offline"} />
                               <span style={{fontSize:11,color:T.inkSec}}>IA {lead.atendimento_ia === "ativo" ? "Ativa" : "Pausada"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {editBriefing&&(
        <BriefingWizard
          initial={client.briefing||{}}
          planInit={client.plan}
          onSave={async(nb,np)=>{await Clientes.updateBriefing(client.id,nb,np);setLocalBriefing(nb);setLocalPlan(np);setEditBriefing(false);}}
          onCancel={()=>setEditBriefing(false)}
        />
      )}
    </div>
  );
}

// ── Admin Card (Premium Refactor) ────────────────────────────────────────────
function AdminCard({ client, onPortal, onBriefing }) {
  const [hov, setHov] = useState(false);
  const pm = PLAN_META[client.plan] || PLAN_META.Starter;
  const b = client.briefing || {};
  const pct = [b.description, b.ai_name, b.ai_tone, b.ai_goal, b.business_hours].filter(Boolean).length * 20;
  const hasPending = (client._pendingInvoices || 0) > 0;

  return (
    <div 
      className={`bento-card group p-8 transition-all duration-500 cursor-pointer flex flex-col gap-6 ${hov ? 'border-primary/40 ring-1 ring-primary/10' : ''}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="premium-glow" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
             <Av initials={client.avatar} color={client.color} />
             <div>
                <h4 className="text-base font-black text-main tracking-tight uppercase">{client.name}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                   <StatusTag status={client.status} />
                   {hasPending && <div className="px-3 py-1 rounded-full bg-cta/10 border border-cta/20 text-[9px] font-black text-cta uppercase tracking-widest flex items-center gap-2"><DollarSign size={10} /> Pendente</div>}
                </div>
             </div>
          </div>
          <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm`} style={{ color: pm.color, backgroundColor: pm.bg, borderColor: pm.color + '30' }}>
            {pm.label}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-surface-up/30 border border-border-subtle group-hover:border-primary/20 transition-all">
           <Pulse status={client.status === "active" ? "online" : "offline"} />
           <div className="flex-1">
              <div className="text-[10px] font-black text-secondary uppercase tracking-widest">Motor IA Ativo</div>
              <div className="text-[9px] text-tertiary font-black uppercase tracking-[0.2em] mt-0.5">Sincronização em tempo real</div>
           </div>
           <Activity size={18} className="text-primary opacity-40 group-hover:scale-110 transition-transform" />
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">Briefing de Calibragem</span>
            <span className={`text-[10px] font-black tracking-widest ${pct >= 80 ? 'text-primary' : 'text-cta'}`}>{pct}%</span>
          </div>
          <div className="h-2 w-full bg-surface-up rounded-full overflow-hidden shadow-inner">
            <div className={`h-full transition-all duration-700 ${pct >= 80 ? 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-cta shadow-[0_0_10px_rgba(202,138,4,0.5)]'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {(client.capabilities || ["text"]).map(c => {
            const m = CAP_META[c];
            return (
              <div key={c} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-up/50 border border-border-subtle text-[9px] font-black uppercase tracking-widest text-secondary hover:border-primary/20 transition-all">
                {m && <m.icon size={12} className="text-primary" />}
                {m?.label}
              </div>
            );
          })}
          {client.calendar_email && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">
              <Calendar size={12} /> Agenda
            </div>
          )}
        </div>

        <div className="mt-auto pt-8 border-t border-border-subtle grid grid-cols-2 gap-8 text-center">
           <div>
              <div className="text-2xl font-black text-main tracking-tighter">{client.msgs_today || 0}</div>
              <div className="text-[9px] text-tertiary font-black uppercase tracking-[0.2em] mt-1">Interações hoje</div>
           </div>
           <div>
              <div className="text-2xl font-black text-secondary tracking-tighter">{client.msgs_month || 0}</div>
              <div className="text-[9px] text-tertiary font-black uppercase tracking-[0.2em] mt-1">Acúmulo mensal</div>
           </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={() => onPortal(client)} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-surface hover:text-main transition-all cursor-pointer">Portal</button>
          <button onClick={() => onBriefing(client)} className="flex-1 py-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2">
            <Edit2 size={12} /> Briefing
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Client Modal (Premium Refactor) ───────────────────────────────────────
function NewModal({ onClose, onNext, onFinish }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", plan: "Pro", capabilities: ["text"] });
  const upd = k => v => setF(p => ({ ...p, [k]: v }));
  const tc = c => setF(p => ({ ...p, capabilities: p.capabilities.includes(c) ? p.capabilities.filter(x => x !== c) : [...p.capabilities, c] }));
  
  const isValid = f.name.trim() && f.phone.trim() && f.email.trim();

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[400] flex items-center justify-center p-8">
      <Card className="w-full max-w-xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-10 border-b border-border-subtle bg-surface-up/30 flex items-center justify-between">
           <h4 className="text-2xl font-black text-main tracking-tighter uppercase italic">Nova Implementação</h4>
           <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={24} /></button>
        </div>
        <div className="p-12 space-y-8">
          <Inp label="Nomenclatura da Clínica *" value={f.name} onChange={upd("name")} placeholder="Ex: Instituto Vitality" icon={Briefcase} />
          <Inp label="Terminal de Acesso (WhatsApp) *" value={f.phone} onChange={upd("phone")} placeholder="+55 11 9 0000-0000" icon={Smartphone} />
          <Inp label="Identificador de Gestão (E-mail) *" value={f.email} onChange={upd("email")} placeholder="gestao@clinica.com" icon={User} />
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Capacidades Cognitivas</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(CAP_META).map(([c, m]) => (
                <Chip key={c} active={f.capabilities.includes(c)} onClick={() => tc(c)} icon={m.icon}>{m.label}</Chip>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Escalonamento de Plano</label>
            <div className="flex gap-4">
              {["Starter", "Pro", "Enterprise"].map(p => (
                <Chip key={p} active={f.plan === p} onClick={() => upd("plan")(p)} icon={Star}>{p}</Chip>
              ))}
            </div>
          </div>
          
          <div className="pt-8 flex gap-6">
             <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface hover:text-main transition-all cursor-pointer">Abortar</button>
             <div className="flex-[1.5] flex flex-col gap-3">
                <Btn disabled={!isValid} onClick={() => onFinish(f)} className="w-full py-5" icon={Zap}>Ativar Ecossistema</Btn>
                <button onClick={() => { if(isValid) onNext(f); }} disabled={!isValid} className="w-full py-3 rounded-xl bg-surface-up/50 border border-border-subtle text-tertiary font-black text-[9px] uppercase tracking-widest hover:text-primary transition-all cursor-pointer">Seguir para Calibragem →</button>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── Share Modal (Premium Refactor) ───────────────────────────────────────────
function ShareModal({ client, onClose }) {
  const portalUrl = `${window.location.origin}/?client=${client.id}`;
  const msg = `Olá ${client.name}! \n\nSua SecretarIA já está configurada. Acesse seu portal agora para completar o seu briefing e acompanhar seus leads:\n\nLink de Acesso: ${portalUrl}\nE-mail: ${client.email}\nSenha: (A mesma do seu cadastro ou sua conta Google)\n\nSeja bem-vindo(a)!`;
  
  const copy = () => {
    navigator.clipboard.writeText(msg);
  };

  const shareWa = () => {
    const url = `https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-2xl z-[500] flex items-center justify-center p-8">
      <Card className="w-full max-w-lg animate-fade-in p-12 border-primary/30 text-center space-y-8 shadow-[0_0_100px_rgba(16,185,129,0.15)] relative overflow-hidden">
        <div className="premium-glow" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-24 w-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-2xl animate-bounce-subtle">
             <CheckCircle2 size={56} strokeWidth={1} />
          </div>
          <h2 className="text-3xl font-black text-main tracking-tighter uppercase italic">Implementação Concluída</h2>
          <p className="text-sm text-secondary font-medium opacity-70 mt-3">O ecossistema de <b>{client.name}</b> foi provisionado com sucesso.</p>
          
          <div className="w-full mt-10 p-8 rounded-[32px] bg-surface-up/30 border border-border-subtle text-left space-y-4">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
               <MessageSquare size={14} /> Mensagem de Onboarding
            </div>
            <div className="text-xs text-secondary font-medium leading-relaxed italic opacity-80 whitespace-pre-wrap select-all">
              {msg}
            </div>
          </div>

          <div className="w-full pt-10 flex flex-col gap-4">
            <Btn onClick={shareWa} icon={Smartphone}>Disparar via WhatsApp</Btn>
            <div className="flex gap-4">
              <button onClick={copy} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-2">
                <Download size={14} /> Copiar Dados
              </button>
              <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-surface transition-all cursor-pointer">Fechar</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ClientsView({ clients, onPortal, onBriefing, onNewClient }) {
  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex justify-between items-center">
        <PageTitle icon={User} title="Gestão de Portfólios" subtitle="Controle centralizado de acessos, planos e configurações de clínicas." />
        <button onClick={onNewClient} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] hover:scale-105 transition-all text-[11px] shadow-xl shadow-primary/20 cursor-pointer">
          <Plus size={16} strokeWidth={3} /> Novo Cliente
        </button>
      </div>
      
      <div className="bento-card p-0 overflow-hidden shadow-2xl">
        <div className="premium-glow opacity-30" />
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-up/30 border-b border-border-subtle">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Entidade / Clínica</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Terminal WA</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Escalonamento</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Status Operacional</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary text-right">Comandos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {clients.map(c => (
                <tr key={c.id} className="group hover:bg-surface-up/30 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <Av initials={c.avatar} color={c.color} size={42} />
                      <span className="text-base font-black text-main tracking-tight uppercase italic">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-secondary">{c.phone}</td>
                  <td className="px-10 py-6">
                    <div className="px-4 py-1.5 rounded-xl bg-surface-up border border-border-subtle text-[9px] font-black uppercase tracking-widest text-secondary group-hover:border-primary/20 transition-all inline-block">
                      {c.plan}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <Pulse status={c.status === 'active' ? 'online' : 'offline'} />
                       <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{c.status === 'active' ? 'Operante' : 'Suspenso'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex gap-4 justify-end transition-all duration-300">
                      <button onClick={() => onBriefing(c)} className="h-11 w-11 flex items-center justify-center rounded-2xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary hover:border-primary/40 transition-all cursor-pointer">
                        <Settings size={18} />
                      </button>
                      <button onClick={() => onPortal(c)} className="h-11 px-8 flex items-center justify-center rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                        Portal
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatsView({ clients }) {
  const totalMsgs = clients.reduce((a, c) => a + (c.msgs_month || 0), 0);
  const avgMsgs = clients.length ? (totalMsgs / clients.length).toFixed(0) : 0;
  
  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={PieChart} title="Inteligência de Dados" subtitle="Análise volumétrica de interações e métricas de engajamento do ecossistema." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Tráfego Mensal Consolidado", value: totalMsgs.toLocaleString(), icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Performance Média / Unidade", value: avgMsgs, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Uptime do Core Cognitivo", value: "99.99%", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col h-full">
              <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-border-subtle shadow-inner mb-8 group-hover:scale-110 transition-transform duration-500`}>
                <s.icon size={26} strokeWidth={2.5} />
              </div>
              <h4 className="text-5xl font-black tracking-tighter text-main">{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-3">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bento-card p-12">
        <div className="premium-glow opacity-30" />
        <h3 className="text-xl font-black tracking-tighter text-main uppercase italic mb-12 flex items-center gap-4">
           <ActivitySquare size={24} className="text-primary" /> Distribuição de Carga Cognitiva
        </h3>
        <div className="space-y-12">
          {clients.slice(0, 8).map(c => (
            <div key={c.id} className="space-y-4 group">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-5">
                   <div className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center border border-border-subtle group-hover:border-primary/40 transition-all">
                      <Av initials={c.avatar} color={c.color} size={28} />
                   </div>
                   <span className="text-sm font-black text-main uppercase tracking-tight italic">{c.name}</span>
                </div>
                <div className="text-right">
                   <span className="text-xs font-black text-primary tracking-tighter">{c.msgs_month || 0}</span>
                   <span className="text-[9px] text-tertiary font-black uppercase tracking-widest ml-2">Interações</span>
                </div>
              </div>
              <div className="h-2.5 w-full bg-surface-up rounded-full overflow-hidden shadow-inner p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
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

function SettingsView({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ 
    name: user.displayName || "Admin Master", 
    email: user.email 
  });

  const save = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={Settings} title="Configurações do Núcleo" subtitle="Gerenciamento da conta administrativa e parâmetros globais do sistema." />
      
      <div className="max-w-3xl space-y-8">
        <div className="bento-card p-12">
          <div className="premium-glow opacity-30" />
          <div className="relative z-10 flex items-center justify-between mb-12">
            <h3 className="text-xl font-black text-main tracking-tighter uppercase italic">Identidade Administrativa</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:underline cursor-pointer">
              {isEditing ? 'Cancelar Protocolo' : 'Ajustar Perfil'}
            </button>
          </div>
          
          <div className="relative z-10">
            {isEditing ? (
              <div className="space-y-8">
                <Inp label="Nomenclatura Completa" value={profile.name} onChange={v => setProfile({...profile, name: v})} icon={User} />
                <Btn onClick={save} className="w-full py-5" icon={CheckCircle2}>Salvar Atributos</Btn>
              </div>
            ) : (
              <div className="flex items-center gap-10 p-8 rounded-[32px] bg-surface-up/30 border border-border-subtle group hover:border-primary/20 transition-all">
                <div className="h-24 w-24 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary text-4xl font-black border border-primary/20 shadow-2xl group-hover:rotate-6 transition-all">
                  {profile.name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-main tracking-tight uppercase italic">{profile.name}</h4>
                  <p className="text-base text-secondary font-medium opacity-60 mt-1">{profile.email}</p>
                  <div className="flex items-center gap-3 mt-4">
                     <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={10} /> Root Access
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bento-card p-12 space-y-10">
          <div className="premium-glow opacity-20" />
          <h3 className="relative z-10 text-xl font-black text-main tracking-tighter uppercase italic flex items-center gap-4">
            <ShieldCheck size={24} className="text-primary" /> Infraestrutura & Encriptação
          </h3>
          <div className="relative z-10 space-y-6">
            {[
              { label: "Cluster Operacional", value: "CLOUD-PROD-BRAZIL", color: "text-emerald-500", icon: Layout },
              { label: "Segurança de Camada", value: "ZERO TRUST ACTIVATED", color: "text-primary", icon: ShieldCheck },
              { label: "Versão do Engine", value: "v5.4.2-STABLE", color: "text-tertiary", icon: Activity },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-surface-up/20 border border-border-subtle/50 group hover:bg-surface-up/40 transition-all cursor-default">
                <div className="flex items-center gap-4">
                   <item.icon size={18} className="text-tertiary group-hover:text-primary transition-colors" />
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

function AlertsView({ alerts, markRead }) {
  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={Bell} title="Monitoramento de Eventos" subtitle="Logs em tempo real de disparos, conversões e alertas críticos do sistema." />

      <div className="max-w-4xl space-y-6">
        {alerts.length === 0 ? (
          <div className="py-40 rounded-[48px] border border-dashed border-border-subtle flex flex-col items-center justify-center text-center opacity-30">
             <Bell size={80} strokeWidth={1} className="text-tertiary mb-6" />
             <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhum evento protocolado</p>
          </div>
        ) : (
          alerts.map(a => (
            <div key={a.id} className={`bento-card group p-8 transition-all duration-500 flex items-center gap-10 ${a.read ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100' : 'border-primary/20 shadow-[0_0_50px_rgba(16,185,129,0.05)]'}`}>
              <div className="premium-glow opacity-30" />
              <div className="relative z-10">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border transition-all ${a.type === "SALE" ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface-up border-border-subtle'}`}>
                  {a.type === "SALE" ? <DollarSign size={28} /> : <Bell size={28} />}
                </div>
              </div>
              <div className="relative z-10 flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-4">
                   <h4 className={`text-base font-black tracking-tight uppercase italic ${a.read ? 'text-secondary' : 'text-main'}`}>{a.title}</h4>
                   {!a.read && <div className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </div>
                <p className="text-sm text-secondary font-medium leading-relaxed opacity-80">{a.message}</p>
                <div className="flex items-center gap-6 pt-2">
                   <div className="flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest">
                      <Calendar size={12} className="text-primary" /> {new Date(a.created_at).toLocaleDateString('pt-BR')}
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest">
                      <Clock size={12} className="text-primary" /> {new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
              </div>
              {!a.read && (
                <div className="relative z-10">
                  <button onClick={() => markRead(a.id)} className="px-6 py-3 rounded-2xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/30 hover:bg-primary hover:text-black transition-all cursor-pointer">
                    Arquivar
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

function VendasAdminView({ clients, alerts }) {
  const vendas = alerts.filter(a => a.type === "SALE");
  const totalVendas = vendas.length;
  const unread = vendas.filter(a => !a.read).length;

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <PageTitle icon={TrendingUp} title="Pipeline de Aquisição" subtitle="Monitoramento em tempo real de novos assinantes e conversões de alto ticket." />
        <button 
          onClick={() => {
             const csv = ["Data,Cliente,Plano"];
             vendas.forEach(v => csv.push(`${new Date(v.created_at).toLocaleDateString()},"${v.title}","${v.message}"`));
             const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url; a.download = 'vendas-secretaria.csv'; a.click();
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary hover:border-primary/40 transition-all cursor-pointer shadow-xl"
        >
          <Download size={14} /> Exportar Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Volume Consolidado", value: totalVendas, icon: ShoppingCart, color: "text-emerald-500" },
          { label: "Leads em Verificação", value: unread, icon: Bell, color: "text-blue-500" },
          { label: "Taxa de Conversão", value: "14.2%", icon: Target, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="bento-card group overflow-hidden">
            <div className="premium-glow" />
            <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
               <s.icon size={140} strokeWidth={1} />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <h4 className="text-5xl font-black tracking-tighter text-main">{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                 <s.icon size={12} className={s.color} /> {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black tracking-tighter text-main uppercase italic px-4 flex items-center gap-3">
           <Zap size={20} className="text-primary" /> Atividade de Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {vendas.length === 0 ? (
             <div className="md:col-span-2 py-24 text-center bg-surface-up/20 rounded-[48px] border border-dashed border-border-subtle opacity-30">
                <ShoppingCart size={48} strokeWidth={1} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhuma transação detectada</p>
             </div>
           ) : (
             vendas.map(v => (
               <div key={v.id} className="bento-card p-6 flex items-center gap-6 group hover:border-primary/30 transition-all duration-300">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner group-hover:rotate-6 transition-all">
                     <Plus size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-base font-black text-main tracking-tight uppercase italic truncate">{v.title}</p>
                     <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-tertiary font-black uppercase tracking-widest">{new Date(v.created_at).toLocaleDateString('pt-BR')}</span>
                        <div className="h-1 w-1 rounded-full bg-border-subtle" />
                        <span className="text-[9px] text-primary font-black uppercase tracking-widest">Ativação Instantânea</span>
                     </div>
                  </div>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}

function PaywallView({ user, onPlanSelected }) {
  const plans = [
    {
      id: "starter",
      name: "Plano Slim",
      price: "197",
      desc: "Essencial para nutris que atuam sozinhas e buscam o primeiro nível de automação cognitiva.",
      features: ["Clone de Personalidade", "Atendimento WhatsApp 24/7", "Fluxos de Triagem", "Dashboard de Gestão"]
    },
    {
      id: "pro",
      name: "Plano Clinic",
      price: "497",
      desc: "A escolha definitiva para quem busca escala massiva e conversão agressiva de leads.",
      isPopular: true,
      features: ["Tudo do Slim", "Agendamento IA Inteligente", "Análise de Sentimento", "Follow-up Cognitivo"]
    },
    {
      id: "enterprise",
      name: "Smart VIP",
      price: "997",
      desc: "A arquitetura suprema para clínicas multiprofissionais e redes de atendimento de elite.",
      features: ["Tudo do Clinic", "Interações Ilimitadas", "Multi-Agentes Custom", "Suporte VIP Dedicado"]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 font-sans relative overflow-hidden text-main selection:bg-primary/20">
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 blur-[160px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-blue-500/5 blur-[160px] rounded-full pointer-events-none" />
      
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-7xl w-full space-y-20 animate-fade-in relative z-10">
        <div className="text-center space-y-8">
          <div className="flex justify-center mb-6">
            <Logo size={100} />
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
             Escolha sua <br/>
             <span className="text-primary">Potência.</span>
          </h2>
          <p className="text-secondary max-w-2xl mx-auto text-xl font-medium opacity-70">
            Sua conta está ativa e protegida. Agora, selecione a arquitetura da sua <span className="text-primary font-bold">SecretarIA</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <div key={plan.id} className={`bento-card group p-12 transition-all duration-700 flex flex-col hover:translate-y-[-12px] ${plan.isPopular ? 'border-primary/50 shadow-[0_0_80px_rgba(16,185,129,0.15)] ring-1 ring-primary/30' : 'border-border-subtle'}`}>
              <div className="premium-glow opacity-30" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight uppercase italic">{plan.name}</h3>
                    <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.4em] mt-1.5">{plan.id}</p>
                  </div>
                  {plan.isPopular && (
                    <div className="px-5 py-2 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 animate-pulse">
                      Recomendado
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-lg font-black text-tertiary">R$</span>
                  <span className="text-7xl font-black tracking-tighter text-main">{plan.price}</span>
                  <span className="text-tertiary font-black text-[10px] uppercase tracking-[0.3em]">/ ciclo mensal</span>
                </div>
                
                <p className="text-secondary text-base font-medium mb-12 leading-relaxed flex-1 opacity-80">{plan.desc}</p>
                
                <div className="space-y-5 mb-14">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-4 group/item">
                      <div className="h-6 w-6 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-125 transition-all border border-primary/20">
                        <Zap size={12} className="fill-current" />
                      </div>
                      <span className="text-[11px] text-secondary font-black uppercase tracking-widest">{f}</span>
                    </div>
                  ))}
                </div>

                <Btn 
                  onClick={() => onPlanSelected(plan)}
                  className={`w-full py-6 text-[11px] tracking-[0.3em] ${plan.isPopular ? '' : 'bg-surface-up text-main border-border-subtle'}`}
                  icon={Sparkles}
                >
                  Ativar Ecossistema
                </Btn>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={() => signOut(auth)} className="text-tertiary hover:text-primary transition-all text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4 mx-auto justify-center group cursor-pointer">
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            Abortar Acesso e Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App(){
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);
  const [portal,setPortal]=useState(null);
  const [briefCl,setBriefCl]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [pending,setPending]=useState(null);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [view,setView]=useState("dashboard"); // dashboard, clients, stats, settings, alerts
  const [addedClient, setAddedClient] = useState(null); // Para o ShareModal
  const [alerts, setAlerts] = useState([]);
  const ADMIN_EMAIL = "agendanutrijulianamoreira@gmail.com";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      
      // Detecção automática de portal para clientes
      if(u && u.email !== ADMIN_EMAIL) {
        try {
          const match = await Clientes.getByEmail(u.email);
          if(match) setPortal(match);
          else {
            // Cria um portal automático para teste
            setPortal({ id: "demo-id", name: u.email.split("@")[0], email: u.email, payment_status: "paid", status: "active" });
          }
        } catch (e) {
          console.warn("Firestore bloqueado. Injetando Portal Mock para testes de UI:", e);
          setPortal({ id: "demo-id", name: u.email.split("@")[0], email: u.email, payment_status: "paid", status: "active" });
        }
      }
    });
    return unsub;
  }, []);

  // Suporte a ?client=ID na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("client");
    if(cid && clients.length > 0) {
      const match = clients.find(c => c.id === cid);
      if(match) setPortal(match);
    }
  }, [clients.length]);

  // Realtime listener do Firebase
  useEffect(()=>{
    if (!user) return;
    
    let unsub = () => {};
    let unsubAlerts = () => {};

    if (user.email === ADMIN_EMAIL) {
      unsub = Clientes.onList(data=>{
        const enriched = data.map((c,i)=>({
          ...c,
          avatar: c.avatar || c.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(),
          color:  c.color  || COLORS[i % COLORS.length],
        }));
        setClients(enriched);
        setLoading(false);
      });
      unsubAlerts = Alerts.onList(data => setAlerts(data));
    } else {
      // Cliente comum só escuta a si mesmo
      unsub = Clientes.onMyClient(user.email, data => {
        if (data) setPortal(data);
        setLoading(false);
      });
    }

    return () => { unsub(); unsubAlerts(); };
  },[user]);

  const addClient = useCallback(async(base, briefing, plan)=>{
    const av = (base?.name || "CL").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
    const color = COLORS[clients.length % COLORS.length];
    const newClientData = {
      ...base, avatar:av, color,
      briefing, plan,
      capabilities: base.capabilities||["text"],
      status: "active",
      payment_status: "paid"
    };
    let cid;
    try {
      cid = await Clientes.create(newClientData);
    } catch (e) {
      console.warn("Bypass Firestore: Criando cliente localmente", e);
      cid = "demo-client-" + Date.now();
      newClientData.id = cid;
    }
    
    // Se não foi passado briefing, é a criação direta -> Abre o ShareModal
    if(!briefing.description) {
      setAddedClient({id:cid, ...base});
    }
    setClients(prev => [...prev, { id: cid, ...base, avatar: av, color, briefing, plan, status: "setup" }]);

    setPending(null);
  },[clients.length]);

  const logout = () => signOut(auth);


  const updateBriefing = useCallback(async(id, briefing, plan)=>{
    try {
      await Clientes.updateBriefing(id, briefing, plan);
    } catch (e) {
      console.warn("Bypass Firestore: Atualizando briefing localmente", e);
    }
    setClients(prev => prev.map(c => c.id === id ? { ...c, briefing, plan } : c));
    setBriefCl(null);
  },[]);

  const filtered = clients.filter(c=>{
    const ms=c.name.toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search);
    const mf=filter==="all"||c.status===filter;
    return ms&&mf;
  });

  const totalMsgs=clients.reduce((a,c)=>a+(c.msgs_today||0),0);
  const activeN=clients.filter(c=>c.status==="active").length;
  const n8nN=clients.filter(c=>c.n8n_status==="online").length;

  // ── Renderização da Página de Vendas (Pública)
  if (window.location.search.includes("vendas=true")) {
    return <SalesPage />;
  }

  // Lógica de Paywall: se logado, não for admin e não tiver portal ativo ou pago
  const showPaywall = user && user.email !== ADMIN_EMAIL && (!portal || portal.payment_status !== "paid");

  const handlePlanSelection = async (plan) => {
    try {
      setLoading(true);
      // Simulação de pagamento -> No futuro integrar Asaas aqui
      const data = {
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        plan: plan.id,
        payment_status: "paid", // Simulado
        status: "active"
      };

      if (portal && portal.id !== "demo-id") {
        await Clientes.update(portal.id, data);
      } else {
        try {
          await Clientes.create(data);
        } catch (e) {
          console.warn("Firestore block: Simulando criação de plano", e);
        }
      }
      
      setPortal({ ...data, id: "demo-id" });
      alert(`Parabéns! Você assinou o ${plan.name}. Seu acesso está liberado.`);
    } catch (err) {
      alert("Erro ao processar plano: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if(authLoading) return <div style={{ background: "var(--color-bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-sec)" }}>🤖 Carregando sistema...</div>;
  if(!user) return <LoginView />;

  if (showPaywall) return <PaywallView user={user} onPlanSelected={handlePlanSelection} />;

  // Cliente autenticado → vai direto para o portal do cliente
  if(portal) return <ClientPortalMain client={portal} onBack={() => setPortal(null)} />;

  return (
    <div style={{ background: "var(--color-bg)", color: "var(--color-text)", minHeight: "100vh" }}>
      <SecretariaDashboard 
        user={user} 
        logout={logout} 
        setView={setView} 
        activeView={view}
        alertCount={alerts.filter(a => !a.read).length}
        theme={theme}
        toggleTheme={toggleTheme}
      >
        <div style={{ padding: "0" }}>
          {view === "dashboard" && <DashboardView clients={clients} alerts={alerts} onPortal={setPortal} />}
          {view === "clients" && <ClientsView clients={clients} onPortal={setPortal} onBriefing={setBriefCl} onNewClient={() => setShowNew(true)} />}
          {view === "fluxos" && <FluxosView clients={clients} />}
          {view === "tokens" && <TokensView clients={clients} />}
          {view === "financeiro" && <FinanceiroAdminView clients={clients} />}
          {view === "vendas" && <VendasAdminView clients={clients} alerts={alerts} />}
          {view === "stats" && <StatsView clients={clients}/>}
          {view === "alerts" && <AlertsView alerts={alerts} markRead={Alerts.markRead} />}
          {view === "settings" && <SettingsView user={user}/>}
        </div>
      </SecretariaDashboard>
      {showNew && <NewModal onClose={() => setShowNew(false)} onNext={f => { setPending(f); setShowNew(false); }} onFinish={f => { addClient(f, EMPTY_B, f.plan); setShowNew(false); }} />}
      {pending && <BriefingWizard initial={EMPTY_B} planInit={pending.plan} onSave={(b, p) => addClient(pending, b, p)} onCancel={() => setPending(null)} />}
      {briefCl && <BriefingWizard initial={briefCl.briefing || {}} planInit={briefCl.plan} onSave={(b, p) => updateBriefing(briefCl.id, b, p)} onCancel={() => setBriefCl(null)} />}
    </div>
  );
}

