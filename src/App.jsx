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
import { Bot, Zap, Activity, TrendingUp, Target, Smartphone, MessageSquare, Plus, ArrowRight, Shield, Settings, Bell } from "lucide-react";
import { Logo, Badge } from "./components/UI";


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



const CAP_META={text:{label:"Texto",icon:"✍️"},audio:{label:"Áudio",icon:"🎙️"},image:{label:"Imagem",icon:"🖼️"},file:{label:"Arquivo",icon:"📎"}};
const CRM_STATUSES = {
  novo: { label: "Novo", color: T.cyan, bg: T.cyanDim, icon: "✨" },
  contatado: { label: "Em Contato", color: T.amber, bg: T.amberDim, icon: "💬" },
  qualificado: { label: "Qualificado", color: T.purple, bg: T.purpleDim, icon: "🔥" },
  convertido: { label: "Convertido", color: T.green, bg: T.greenDim, icon: "✅" },
  perdido: { label: "Perdido", color: T.red, bg: T.redDim, icon: "✖️" },
};
const PLAN_META={Starter:{color:T.inkSec,bg:"rgba(156,163,176,0.1)"},Pro:{color:T.green,bg:T.greenDim},Enterprise:{color:T.amber,bg:T.amberDim}};
const SEGMENTS=["Saúde / Clínica","Saúde / Odontologia","Beleza / Salão","Educação","Imobiliária","Jurídico","Alimentação","Varejo","Serviços Gerais","Outro"];
const TONES=["Acolhedora e profissional","Formal e sério","Descontraído e amigável","Jovial e animado","Técnico e objetivo"];
const GOALS=["Agendamentos","Vendas / Captação","Suporte ao cliente","Tirar dúvidas (FAQ)","Tudo acima"];
const EMPTY_B={segment:"",description:"",site:"",instagram:"",ai_name:"",ai_tone:"",ai_goal:"",business_hours:"",escalation_trigger:"",escalation_number:"",services:[],faqs:[],restrictions:"",promotions:""};
const COLORS=["#6366F1","#EC4899","#F59E0B","#0EA5E9","#10B981","#8B5CF6","#F43F5E"];
const STEPS=[{id:"negocio",icon:"🏢",label:"Negócio"},{id:"ia",icon:"🤖",label:"Persona da IA"},{id:"servicos",icon:"💼",label:"Serviços"},{id:"faqs",icon:"❓",label:"FAQ"},{id:"regras",icon:"🚫",label:"Regras"},{id:"plano",icon:"💳",label:"Plano"}];

// ── Primitives ────────────────────────────────────────────────────────────────
function Pulse({status}){
  const c={online:T.green,offline:T.red,pending:T.amber}[status]||T.inkTert;
  return(<span style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
    {status==="online"&&<span style={{position:"absolute",inset:-3,borderRadius:"50%",background:c,opacity:.25,animation:"pulse 2s infinite"}}/>}
    <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>
  </span>);
}
function Av({initials,color,size=40}){
  return(<div style={{width:size,height:size,borderRadius:12,background:color+"22",border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.3,fontWeight:700,color,flexShrink:0,letterSpacing:1}}>{initials}</div>);
}
function Tag({children,color,bg}){return<span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:6,color,background:bg,letterSpacing:.3,whiteSpace:"nowrap"}}>{children}</span>;}
function StatusTag({status}){
  const m={active:{l:"Ativo",c:T.green,b:T.greenDim},paused:{l:"Pausado",c:T.amber,b:T.amberDim},setup:{l:"Configurando",c:T.inkSec,b:"rgba(156,163,176,0.1)"}}[status]||{l:"—",c:T.inkTert,b:"transparent"};
  return<Tag color={m.c} bg={m.b}>{m.l}</Tag>;
}
function InvTag({status}){
  const m={pago:{l:"Pago",c:T.green,b:T.greenDim},pendente:{l:"Pendente",c:T.amber,b:T.amberDim},vencido:{l:"Vencido",c:T.red,b:T.redDim}}[status]||{l:status,c:T.inkSec,b:T.up};
  return<Tag color={m.c} bg={m.b}>{m.l}</Tag>;
}
function Inp({label,value,onChange,placeholder,rows}){
  const s={width:"100%",padding:"10px 12px",borderRadius:10,background:T.bg,border:`1px solid ${T.border}`,color:T.ink,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  return(<div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,color:T.inkTert}}>{label}</label>}
    {rows?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...s,resize:"vertical"}}/>
         :<input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s}/>}
  </div>);
}
function Selct({label,value,onChange,options}){
  return(<div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{fontSize:11,color:T.inkTert}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{padding:"10px 12px",borderRadius:10,background:T.bg,border:`1px solid ${T.border}`,color:value?T.ink:T.inkTert,fontSize:13,outline:"none",fontFamily:"inherit"}}>
      <option value="">Selecionar…</option>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>);
}
function Chip({active,onClick,children}){
  return(<button onClick={onClick} style={{padding:"6px 12px",borderRadius:8,fontSize:12,cursor:"pointer",border:`1px solid ${active?T.green+"44":T.border}`,background:active?T.greenDim:T.bg,color:active?T.green:T.inkSec,fontFamily:"inherit"}}>{children}</button>);
}
function Btn({children,onClick,variant="primary",style:sx={}}){
  const v={primary:{bg:T.green,color:"#000",border:"none"},ghost:{bg:"transparent",color:T.inkSec,border:`1px solid ${T.border}`}}[variant]||{bg:T.green,color:"#000",border:"none"};
  return(<button onClick={onClick} style={{padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",...v,...sx}}>{children}</button>);
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

// ── Briefing Wizard ───────────────────────────────────────────────────────────
function BriefingWizard({initial,planInit,onSave,onCancel}){
  const [step,setStep]=useState(0);
  const [b,setB]=useState({...EMPTY_B,...initial});
  const [plan,setPlan]=useState(planInit||"Pro");
  const [ns,setNs]=useState({name:"",price:""});
  const [nf,setNf]=useState({q:"",a:""});
  const [saving,setSaving]=useState(false);
  const upd=k=>v=>setB(p=>({...p,[k]:v}));

  const info=(t)=>(<div style={{background:T.up,borderRadius:12,padding:"12px 16px",border:`1px solid ${T.border}`,fontSize:12,color:T.inkSec,lineHeight:1.6}}>{t}</div>);

  const pages=[
    <div key="n" style={{display:"flex",flexDirection:"column",gap:14}}>
      {info("💡 Essas informações alimentam o contexto da IA — ela entende o negócio e fala com precisão.")}
      <Selct label="Segmento *" value={b.segment} onChange={upd("segment")} options={SEGMENTS}/>
      <Inp label="Descrição do negócio *" value={b.description} onChange={upd("description")} placeholder="O que a empresa faz, público-alvo, diferenciais…" rows={4}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Site" value={b.site} onChange={upd("site")} placeholder="meunegocio.com.br"/>
        <Inp label="Instagram" value={b.instagram} onChange={upd("instagram")} placeholder="@usuario"/>
      </div>
    </div>,
    <div key="ia" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label='Nome da assistente *' value={b.ai_name} onChange={upd("ai_name")} placeholder='"Ana", "Max", "Luna"'/>
        <Selct label="Tom de voz *" value={b.ai_tone} onChange={upd("ai_tone")} options={TONES}/>
      </div>
      <div><label style={{fontSize:11,color:T.inkTert,display:"block",marginBottom:8}}>Objetivo principal *</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{GOALS.map(g=><Chip key={g} active={b.ai_goal===g} onClick={()=>upd("ai_goal")(g)}>{g}</Chip>)}</div>
      </div>
      <Inp label="Horário de atendimento *" value={b.business_hours} onChange={upd("business_hours")} placeholder="Seg–Sex 8h–18h | Sáb 8h–13h"/>
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
        <div style={{fontSize:11,fontWeight:700,color:T.inkTert,letterSpacing:1.2,textTransform:"uppercase",marginBottom:12}}>Transferência para humano</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <Inp label="Quando transferir?" value={b.escalation_trigger} onChange={upd("escalation_trigger")} placeholder="Urgências, reclamações…" rows={2}/>
          <Inp label="Número WhatsApp para transferência" value={b.escalation_number} onChange={upd("escalation_number")} placeholder="+55 11 9 0000-0000"/>
        </div>
      </div>
    </div>,
    <div key="s" style={{display:"flex",flexDirection:"column",gap:14}}>
      {info("📋 Liste os principais serviços/produtos. A IA usará para responder preços e disponibilidade.")}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {b.services.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:T.bg,padding:"10px 14px",borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{flex:1}}><div style={{fontSize:13,color:T.ink}}>{s.name}</div><div style={{fontSize:11,color:T.inkTert}}>{s.price||"Preço a consultar"}</div></div>
            <button onClick={()=>setB(p=>({...p,services:p.services.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:16}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"end"}}>
        <Inp label="Nome do serviço" value={ns.name} onChange={v=>setNs(p=>({...p,name:v}))} placeholder="Ex: Consulta de avaliação"/>
        <Inp label="Valor" value={ns.price} onChange={v=>setNs(p=>({...p,price:v}))} placeholder="R$ 0"/>
        <Btn onClick={()=>{if(!ns.name.trim())return;setB(p=>({...p,services:[...p.services,{...ns}]}));setNs({name:"",price:""});}} style={{whiteSpace:"nowrap"}}>+ Add</Btn>
      </div>
    </div>,
    <div key="f" style={{display:"flex",flexDirection:"column",gap:14}}>
      {info("❓ Cada resposta vira conhecimento direto da IA — sem invenção, sem erro.")}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {b.faqs.map((f,i)=>(
          <div key={i} style={{background:T.bg,padding:"12px 14px",borderRadius:10,border:`1px solid ${T.border}`,display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:T.ink,marginBottom:4}}>❓ {f.q}</div>
              <div style={{fontSize:12,color:T.inkSec}}>✅ {f.a}</div>
            </div>
            <button onClick={()=>setB(p=>({...p,faqs:p.faqs.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:16}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{background:T.bg,padding:14,borderRadius:12,border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:10}}>
        <Inp label="Pergunta" value={nf.q} onChange={v=>setNf(p=>({...p,q:v}))} placeholder="Vocês atendem aos sábados?"/>
        <Inp label="Resposta que a IA deve dar" value={nf.a} onChange={v=>setNf(p=>({...p,a:v}))} placeholder="Sim! Atendemos sábados das 8h às 13h." rows={2}/>
        <Btn onClick={()=>{if(!nf.q.trim()||!nf.a.trim())return;setB(p=>({...p,faqs:[...p.faqs,{...nf}]}));setNf({q:"",a:""});}}>+ Adicionar</Btn>
      </div>
    </div>,
    <div key="r" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"rgba(239,68,68,0.06)",borderRadius:12,padding:"12px 16px",border:`1px solid ${T.red}33`,fontSize:12,color:T.inkSec}}>
        🚫 Defina o que a IA <strong style={{color:T.ink}}>jamais</strong> deve fazer ou dizer.
      </div>
      <Inp label="O que a IA NUNCA deve dizer ou fazer" value={b.restrictions} onChange={upd("restrictions")} placeholder="Ex: nunca confirmar diagnóstico…" rows={4}/>
      <Inp label="Promoções e avisos temporários ativos" value={b.promotions} onChange={upd("promotions")} placeholder="Ex: 20% off em março…" rows={3}/>
    </div>,
    <div key="p" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[{p:"Starter",price:"R$ 197/mês",impl:"R$ 900",f:["Texto + Imagem","1 workflow n8n","Suporte chat"]},
          {p:"Pro",price:"R$ 397/mês",impl:"R$ 1.200",f:["Texto+Áudio+Imagem+Arquivo","2 workflows n8n","Google Agenda","Suporte prioritário"]},
          {p:"Enterprise",price:"R$ 897/mês",impl:"R$ 2.500",f:["Tudo do Pro","Workflows ilimitados","Integrações custom","Onboarding dedicado"]}
        ].map(({p,price,impl,f})=>{
          const pm=PLAN_META[p];const sel=plan===p;
          return(<div key={p} onClick={()=>setPlan(p)} style={{cursor:"pointer",background:sel?pm.bg:T.bg,border:`2px solid ${sel?pm.color+"66":T.border}`,borderRadius:14,padding:16,transition:"all 150ms"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:700,color:sel?pm.color:T.ink}}>{p}</span>
              {sel&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:pm.color,color:"#000",fontWeight:700}}>✓</span>}
            </div>
            <div style={{fontSize:16,fontWeight:700,color:T.ink,marginBottom:2}}>{price}</div>
            <div style={{fontSize:11,color:T.inkTert,marginBottom:10}}>Impl.: {impl}</div>
            {f.map(x=><div key={x} style={{fontSize:11,color:T.inkSec,marginBottom:3}}>✓ {x}</div>)}
          </div>);
        })}
      </div>
      <div style={{background:T.greenDim,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.green}33`,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22}}>💳</span>
        <div><div style={{fontSize:13,fontWeight:600,color:T.ink}}>Cobrança via Asaas</div>
          <div style={{fontSize:12,color:T.inkSec}}>Link de pagamento gerado automaticamente após salvar.</div></div>
      </div>
    </div>,
  ];

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(b, plan); } finally { setSaving(false); }
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}}>
      <div style={{background:T.surface,borderRadius:24,width:640,maxHeight:"90vh",display:"flex",flexDirection:"column",border:`1px solid ${T.borderSt}`,overflow:"hidden",animation:"fadeIn 150ms ease"}}>
        <div style={{padding:"18px 28px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontSize:15,fontWeight:700,color:T.ink}}>Briefing do Cliente</div>
            <div style={{fontSize:12,color:T.inkTert,marginTop:2}}>Configure a IA para o negócio dele</div></div>
          <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",color:T.inkTert,fontSize:18}}>✕</button>
        </div>
        <div style={{display:"flex",padding:"0 28px",borderBottom:`1px solid ${T.border}`,overflowX:"auto",gap:2}}>
          {STEPS.map((s,i)=>(
            <button key={s.id} onClick={()=>setStep(i)} style={{padding:"11px 10px",border:"none",cursor:"pointer",background:"none",color:step===i?T.green:T.inkTert,fontSize:11,fontWeight:step===i?700:500,borderBottom:`2px solid ${step===i?T.green:"transparent"}`,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}}>
              {s.icon} {s.label} {i<step&&<span style={{color:T.green,fontSize:10}}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"22px 28px"}}>{pages[step]}</div>
        <div style={{padding:"14px 28px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,color:T.inkTert}}>Passo {step+1} de {STEPS.length}</div>
          <div style={{display:"flex",gap:10}}>
            {step>0&&<Btn variant="ghost" onClick={()=>setStep(s=>s-1)}>← Anterior</Btn>}
            {step<STEPS.length-1&&<Btn onClick={()=>setStep(s=>s+1)}>Próximo →</Btn>}
            {step===STEPS.length-1&&<Btn onClick={handleSave} style={{opacity:saving?.6:1}}>{saving?"Salvando…":"✅ Salvar"}</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Login Page ───────────────────────────────────────────────────────────────
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
      setError("E-mail ou senha incorretos.");
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
      setError("Falha na autenticação com Google.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 selection:text-primary overflow-hidden font-sans">
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-16 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)] animate-pulse" />
           <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="absolute top-12 left-12 z-20">
          <Logo size={42} />
        </div>

        <div className="relative z-20 space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Shield size={12} className="text-primary fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Ambiente Seguro (Zero Trust)</span>
            </div>
            <h1 className="text-6xl font-black leading-tight tracking-tighter text-white">
              O futuro da sua <br/>
              <span className="text-primary">clínica</span> começa aqui.
            </h1>
            <p className="text-xl text-secondary leading-relaxed max-w-md font-medium">
              Evolua o atendimento da sua clínica com IA avançada e gestão inteligente de dados.
            </p>
          </div>

          <div className="flex items-center gap-6">
             <div className="h-px flex-1 bg-border-subtle" />
             <div className="flex gap-4">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <div className="h-2 w-2 rounded-full bg-surface-up" />
                <div className="h-2 w-2 rounded-full bg-surface-up" />
             </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-background">
        <div className="absolute top-8 left-8 lg:hidden">
          <Logo size={32} />
        </div>

        <div className="w-full max-w-md space-y-10 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-main tracking-tight">
              {isRegister ? "Criar Conta" : "Bem-vinda"}
            </h2>
            <p className="text-secondary font-medium">
              Acesse o núcleo de inteligência da sua clínica.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {isRegister && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-tertiary uppercase tracking-widest ml-1">Nome da Clínica</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-surface border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-main placeholder:text-tertiary/30"
                    placeholder="Ex: Clínica Equilíbrio"
                    required={isRegister}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-tertiary uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-surface border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-main placeholder:text-tertiary/30"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-tertiary uppercase tracking-widest">Sua Senha</label>
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-surface border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-main placeholder:text-tertiary/30"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-500/10 flex items-center gap-3">
                <Shield size={16} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Verificando..." : (isRegister ? "Começar Agora" : "Entrar no Sistema")}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-tertiary font-black tracking-widest">Ou continue com</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-surface border border-border-subtle text-main py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Account
          </button>

          <div className="text-center pt-4">
            <p className="text-sm text-secondary font-medium">
              {isRegister ? "Já possui conta?" : "Ainda não faz parte?"} 
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-2 text-primary font-black hover:underline underline-offset-8"
              >
                {isRegister ? "Fazer Login" : "Criar Conta Grátis"}
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

// ── Admin Card ────────────────────────────────────────────────────────────────
function AdminCard({client,onPortal,onBriefing}){
  const [hov,setHov]=useState(false);
  const pm=PLAN_META[client.plan]||PLAN_META.Starter;
  const b=client.briefing||{};
  const pct=[b.description,b.ai_name,b.ai_tone,b.ai_goal,b.business_hours].filter(Boolean).length*20;
  const hasPending=(client._pendingInvoices||0)>0;
  return(
    <div style={{background:hov?T.up:T.surface,border:`1px solid ${hov?T.borderSt:T.border}`,borderRadius:16,padding:20,display:"flex",flexDirection:"column",gap:14,transition:"all 150ms"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <Av initials={client.avatar} color={client.color}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:14,fontWeight:600,color:T.ink}}>{client.name}</span>
            <StatusTag status={client.status}/>
            {hasPending&&<Tag color={T.amber} bg={T.amberDim}>💰 Pendente</Tag>}
          </div>
          <div style={{fontSize:11,color:T.inkTert,marginTop:2}}>{client.phone}</div>
        </div>
        <Tag color={pm.color} bg={pm.bg}>{client.plan}</Tag>
      </div>
      <div style={{background:T.bg,borderRadius:10,padding:"9px 12px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
        <Pulse status={client.status === "active" ? "online" : "offline"}/>
        <span style={{fontSize:11,color:T.green,fontWeight:600}}>IA Ativa</span>
        <span style={{fontSize:11,color:T.inkTert,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>Motor Multi-Agente</span>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:11,color:T.inkTert}}>Briefing</span>
          <span style={{fontSize:11,color:pct>=80?T.green:pct>=40?T.amber:T.red}}>{pct}%</span>
        </div>
        <div style={{height:4,background:T.bg,borderRadius:2}}><div style={{height:4,borderRadius:2,width:`${pct}%`,background:pct>=80?T.green:pct>=40?T.amber:T.red,transition:"width 600ms"}}/></div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {(client.capabilities||["text"]).map(c=>{const m=CAP_META[c];return<span key={c} style={{fontSize:10,padding:"2px 7px",borderRadius:6,background:"var(--color-surface-soft)",border:`1px solid ${T.border}`,color:T.inkSec}}>{m?.icon} {m?.label}</span>;})}
        {client.calendar_email&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:6,background:T.cyanDim,border:`1px solid ${T.cyan}33`,color:T.cyan}}>📅 Agenda</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
        <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:T.ink}}>{client.msgs_today||0}</div><div style={{fontSize:10,color:T.inkTert}}>msgs hoje</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:20,fontWeight:700,color:T.inkSec}}>{client.msgs_month||0}</div><div style={{fontSize:10,color:T.inkTert}}>este mês</div></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:10}}>
        <button onClick={()=>onPortal(client)} style={{flex:1,padding:"8px",borderRadius:9,background:"transparent",border:`1px solid ${T.border}`,color:T.inkSec,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Portal</button>
        <button onClick={()=>onBriefing(client)} style={{flex:1,padding:"8px",borderRadius:9,background:T.greenDim,border:`1px solid ${T.green}44`,color:T.green,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✏️ Briefing</button>
      </div>
    </div>
  );
}

// ── New Client Modal ──────────────────────────────────────────────────────────
function NewModal({onClose,onNext,onFinish}){
  const [f,setF]=useState({name:"",phone:"",email:"",plan:"Pro",capabilities:["text"]});
  const upd=k=>v=>setF(p=>({...p,[k]:v}));
  const tc=c=>setF(p=>({...p,capabilities:p.capabilities.includes(c)?p.capabilities.filter(x=>x!==c):[...p.capabilities,c]}));
  
  const isValid = f.name.trim() && f.phone.trim() && f.email.trim();

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}}>
      <div style={{background:T.surface,borderRadius:20,width:460,border:`1px solid ${T.borderSt}`,overflow:"hidden",animation:"fadeIn 150ms ease"}}>
        <div style={{padding:"18px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:15,fontWeight:700,color:T.ink}}>Novo Cliente</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.inkTert,fontSize:18}}>✕</button>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:14,maxHeight:"70vh",overflowY:"auto"}}>
          <Inp label="Nome do cliente *" value={f.name} onChange={upd("name")} placeholder="Ex: Clínica Saúde Total"/>
          <Inp label="Número WhatsApp *" value={f.phone} onChange={upd("phone")} placeholder="+55 11 9 0000-0000"/>
          <Inp label="E-mail de acesso *" value={f.email} onChange={upd("email")} placeholder="cliente@email.com"/>
          
          <div><label style={{fontSize:11,color:T.inkTert,display:"block",marginBottom:8}}>Capacidades da IA</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{Object.entries(CAP_META).map(([c,m])=><Chip key={c} active={f.capabilities.includes(c)} onClick={()=>tc(c)}>{m.icon} {m.label}</Chip>)}</div>
          </div>
          <div><label style={{fontSize:11,color:T.inkTert,display:"block",marginBottom:8}}>Plano inicial</label>
            <div style={{display:"flex",gap:8}}>{["Starter","Pro","Enterprise"].map(p=><Chip key={p} active={f.plan===p} onClick={()=>upd("plan")(p)}>{p}</Chip>)}</div>
          </div>
        </div>
        <div style={{padding:"14px 22px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Cancelar</Btn>
            <button 
              onClick={()=>{if(isValid) onFinish(f);}} 
              disabled={!isValid}
              style={{flex:1.5,padding:10,borderRadius:10,fontSize:13,fontWeight:700,cursor:isValid?"pointer":"default",background:T.bg,border:`1px solid ${T.border}`,color:T.ink,opacity:isValid?1:0.5,fontFamily:"inherit"}}
            >
              🚀 Criar Direto
            </button>
          </div>
          <button 
            onClick={()=>{if(isValid) onNext(f);}} 
            disabled={!isValid}
            style={{padding:12,borderRadius:10,fontSize:13,fontWeight:700,cursor:isValid?"pointer":"default",background:T.green,border:"none",color:"#000",opacity:isValid?1:0.5,fontFamily:"inherit"}}
          >
            Avançar: Briefing →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Share Modal ───────────────────────────────────────────────────────────────
function ShareModal({client, onClose}){
  const portalUrl = `${window.location.origin}/?client=${client.id}`;
  const msg = `Olá ${client.name}! 🚀\n\nSua SecretarIA já está configurada. Acesse seu portal agora para completar o seu briefing e acompanhar seus leads:\n\n🔗 *Link de Acesso:* ${portalUrl}\n📧 *E-mail:* ${client.email}\n🔑 *Senha:* (A mesma do seu cadastro ou sua conta Google)\n\nSeja bem-vindo(a)!`;
  
  const copy = () => {
    navigator.clipboard.writeText(msg);
    alert("Dados copiados para a área de transferência!");
  };

  const shareWa = () => {
    const url = `https://wa.me/${client.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(8px)"}}>
      <div style={{background:T.surface,borderRadius:24,width:480,border:`1px solid ${T.green}33`,padding:32,animation:"fadeIn 200ms ease",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>🎉</div>
        <h2 style={{margin:"0 0 8px",fontSize:20,fontWeight:700}}>Cliente Cadastrado!</h2>
        <p style={{margin:"0 0 24px",fontSize:14,color:T.inkTert}}>O acesso de <b>{client.name}</b> foi gerado com sucesso.</p>
        
        <div style={{background:T.bg,borderRadius:16,padding:20,textAlign:"left",marginBottom:24,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:11,color:T.inkTert,marginBottom:8,textTransform:"uppercase"}}>Mensagem formatada:</div>
          <div style={{fontSize:12,color:T.inkSec,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{msg}</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Btn onClick={shareWa} style={{background:T.green,color:"#000",padding:14}}>📱 Enviar via WhatsApp</Btn>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={copy} style={{flex:1}}>📋 Copiar Dados</Btn>
            <Btn variant="ghost" onClick={onClose} style={{flex:1}}>Fechar</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientsView({clients, onPortal, onBriefing}){
  return(
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-main">Gestão de Clientes</h1>
        <p className="text-secondary font-medium mt-1">Controle total dos portfólios e acessos dos seus clientes.</p>
      </div>
      
      <div className="bg-surface border border-border-subtle rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-soft/50 border-b border-border-subtle">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-tertiary">Cliente / Clínica</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-tertiary">WhatsApp</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-tertiary">Plano</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-tertiary">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-tertiary text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {clients.map(c=>(
                <tr key={c.id} className="group hover:bg-surface-up transition-colors duration-300">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shadow-inner">
                        {c.avatar}
                      </div>
                      <span className="text-sm font-bold text-main">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-secondary">{c.phone}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-full bg-surface-soft border border-border-subtle text-[10px] font-black uppercase tracking-tighter text-secondary group-hover:border-primary/20 transition-colors">
                      {c.plan}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`h-1.5 w-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-tertiary'}`} />
                       <span className="text-[11px] font-bold text-secondary uppercase tracking-tight">{c.status === 'active' ? 'Ativo' : 'Pausado'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={()=>onBriefing(c)} className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-up border border-border-subtle text-secondary hover:text-primary hover:border-primary/30 transition-all">
                        <Settings size={14} />
                      </button>
                      <button onClick={()=>onPortal(c)} className="h-9 px-4 flex items-center justify-center rounded-lg bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all">
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

function StatsView({clients}){
  const totalMsgs = clients.reduce((a,c)=>a+(c.msgs_month||0),0);
  const avgMsgs = clients.length ? (totalMsgs/clients.length).toFixed(0) : 0;
  
  return(
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-main">Estatísticas</h1>
        <p className="text-secondary font-medium mt-1">Análise de performance e volume de interações.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Volume Total (Mês)", value: totalMsgs.toLocaleString(), icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Média por Unidade", value: avgMsgs, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Uptime do Sistema", value: "99.9%", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map(s=>(
          <div key={s.label} className="p-8 rounded-[32px] bg-surface border border-border-subtle hover:border-primary/20 transition-all">
            <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} mb-6`}>
              <s.icon size={24} />
            </div>
            <h4 className="text-4xl font-black tracking-tight text-main">{s.value}</h4>
            <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-[32px] bg-surface border border-border-subtle">
        <h3 className="text-lg font-black tracking-tight mb-8">Uso de Mensagens por Cliente</h3>
        <div className="space-y-8">
          {clients.slice(0,6).map(c=>(
            <div key={c.id} className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-3">
                   <div className="h-6 w-6 rounded-md" style={{ background: c.color + '33', border: `1px solid ${c.color}66` }} />
                   <span className="text-sm font-bold text-main">{c.name}</span>
                </div>
                <span className="text-xs font-black text-tertiary uppercase">{c.msgs_month || 0} interações</span>
              </div>
              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ background: c.color, width: `${Math.min(100,(c.msgs_month||0)/10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsView({user}){
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ 
    name: user.displayName || "Dra. Juliana", 
    email: user.email 
  });

  const save = () => {
    setIsEditing(false);
    alert("Perfil administrativo atualizado.");
  };

  return(
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-main">Configurações</h1>
        <p className="text-secondary font-medium mt-1">Gerenciamento da conta administrativa e sistema.</p>
      </div>
      
      <div className="max-w-2xl space-y-6">
        <div className="p-8 rounded-[32px] bg-surface border border-border-subtle">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black tracking-tight">Perfil Administrativo</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>
          
          {isEditing ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-tertiary uppercase tracking-widest ml-1">Nome Completo</label>
                <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-5 py-4 bg-background border border-border-subtle rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-main" />
              </div>
              <button onClick={save} className="w-full py-4 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Salvar Alterações</button>
            </div>
          ) : (
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-surface-soft border border-border-subtle">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black border border-primary/20">
                {profile.name[0].toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-black text-main">{profile.name}</h4>
                <p className="text-sm text-secondary font-medium">{profile.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 rounded-[32px] bg-surface border border-border-subtle space-y-6">
          <h3 className="text-lg font-black tracking-tight">Infraestrutura & Segurança</h3>
          <div className="space-y-4 divide-y divide-border-subtle/50">
            {[
              { label: "Ambiente", value: "Produção", color: "text-emerald-500" },
              { label: "Segurança", value: "Ativa (Zero Trust)", color: "text-primary" },
              { label: "Versão", value: "v5.0.0-gold", color: "text-tertiary" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center pt-4 first:pt-0">
                <span className="text-xs font-bold text-secondary uppercase tracking-tight">{item.label}</span>
                <span className={`text-xs font-black uppercase tracking-widest ${item.color}`}>{item.value}</span>
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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-main">Central de Alertas</h1>
        <p className="text-secondary font-medium mt-1">Histórico completo de eventos e disparos do sistema.</p>
      </div>

      <div className="max-w-4xl space-y-3">
        {alerts.length === 0 ? (
          <div className="p-20 rounded-[40px] border border-dashed border-border-subtle flex flex-col items-center justify-center text-center opacity-50">
             <Bell size={48} className="text-tertiary mb-4" />
             <p className="text-sm font-medium">Nenhum alerta pendente.</p>
          </div>
        ) : (
          alerts.map(a => (
            <div key={a.id} className={`p-6 rounded-[28px] border transition-all duration-300 flex items-center gap-6 ${a.read ? 'bg-surface/50 border-border-subtle opacity-60' : 'bg-surface border-primary/20 shadow-lg shadow-primary/5'}`}>
              <div className="h-14 w-14 rounded-2xl bg-surface-up flex items-center justify-center text-3xl shadow-inner">
                {a.type === "SALE" ? "🎉" : "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                   <h4 className={`text-sm font-black truncate ${a.read ? 'text-secondary' : 'text-main'}`}>{a.title}</h4>
                   {!a.read && <span className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </div>
                <p className="text-xs text-tertiary font-medium truncate mb-2">{a.message}</p>
                <div className="flex items-center gap-3 text-[10px] font-black text-tertiary uppercase tracking-widest">
                   <span>{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                   <div className="h-1 w-1 rounded-full bg-border-subtle" />
                   <span>{new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              {!a.read && (
                <button onClick={() => markRead(a.id)} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-black transition-all">
                  Lido
                </button>
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-main">Vendas & Pipeline</h1>
          <p className="text-secondary font-medium mt-1">Acompanhamento em tempo real de novos assinantes.</p>
        </div>
        <button 
          onClick={() => {
             const csv = ["Data,Cliente,Plano"];
             vendas.forEach(v => csv.push(`${new Date(v.created_at).toLocaleDateString()},"${v.title}","${v.message}"`));
             const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url; a.download = 'vendas-secretaria.csv'; a.click();
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all"
        >
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Vendas Totais", value: totalVendas, icon: ShoppingCart, color: "text-emerald-500" },
          { label: "Aguardando Leitura", value: unread, icon: Bell, color: "text-blue-500" },
          { label: "Taxa de Conversão", value: "14.2%", icon: Target, color: "text-amber-500" },
        ].map(s=>(
          <div key={s.label} className="p-8 rounded-[32px] bg-surface border border-border-subtle relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <s.icon size={100} />
            </div>
            <h4 className="text-4xl font-black tracking-tight text-main relative z-10">{s.value}</h4>
            <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-2 relative z-10">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight px-2">Pipeline Recente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {vendas.length === 0 ? (
             <div className="md:col-span-2 p-12 text-center text-tertiary font-medium bg-surface/50 rounded-[32px] border border-dashed border-border-subtle">
                Nenhuma venda registrada no pipeline.
             </div>
           ) : (
             vendas.map(v => (
               <div key={v.id} className="p-6 rounded-[28px] bg-surface border border-border-subtle flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                     <Plus size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-main truncate">{v.title}</p>
                     <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-0.5">{new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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
      desc: "Essencial para nutris que atuam sozinhas e buscam o primeiro nível de automação.",
      features: ["Clone da sua Personalidade", "Atendimento WhatsApp Automático", "500 interações/mês", "Dashboard de Gestão"]
    },
    {
      id: "pro",
      name: "Plano Clinic",
      price: "497",
      desc: "A escolha definitiva para quem busca escala e conversão agressiva.",
      isPopular: true,
      features: ["Tudo do Slim", "Agendamento Inteligente via IA", "2.000 interações/mês", "Follow-up de Leads Perdidos"]
    },
    {
      id: "enterprise",
      name: "Smart VIP",
      price: "997",
      desc: "A arquitetura suprema para clínicas multiprofissionais e redes.",
      features: ["Tudo do Clinic", "Interações Ilimitadas", "Suporte 24h Dedicado", "Multi-Agentes Customizados"]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 font-sans relative overflow-hidden text-main">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl w-full space-y-16 animate-fade-in relative z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <Logo size={80} />
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter">Escolha seu Nível.</h2>
          <p className="text-secondary max-w-2xl mx-auto text-lg font-medium">
            Sua conta está ativa e protegida. Agora, selecione a potência da sua <span className="text-primary font-bold">SecretarIA</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.id} className={`group p-10 rounded-[40px] bg-surface border transition-all duration-500 flex flex-col hover:translate-y-[-8px] ${plan.isPopular ? 'border-primary/40 shadow-2xl shadow-primary/10 ring-1 ring-primary/20' : 'border-border-subtle'}`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-tertiary font-bold uppercase tracking-widest mt-1">{plan.id}</p>
                </div>
                {plan.isPopular && (
                  <div className="px-3 py-1 rounded-full bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    Popular
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-sm font-bold text-tertiary">R$</span>
                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-tertiary font-bold text-xs uppercase tracking-widest">/mês</span>
              </div>
              
              <p className="text-secondary text-sm font-medium mb-10 leading-relaxed flex-1">{plan.desc}</p>
              
              <div className="space-y-4 mb-12">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Zap size={10} className="fill-current" />
                    </div>
                    <span className="text-xs text-secondary font-bold">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onPlanSelected(plan)}
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${plan.isPopular ? 'bg-primary text-black shadow-primary/20' : 'bg-surface-up text-main border border-border-subtle hover:border-primary/30 shadow-none'}`}
              >
                Ativar Plano
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={() => signOut(auth)} className="text-tertiary hover:text-main transition-colors text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mx-auto justify-center">
            <ArrowRight size={14} className="rotate-180" />
            Sair da Conta
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
        const match = await Clientes.getByEmail(u.email);
        if(match) setPortal(match);
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
    const av = base.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    const color = COLORS[clients.length % COLORS.length];
    const cid = await Clientes.create({
      ...base, avatar:av, color,
      briefing, plan,
      capabilities: base.capabilities||["text"]
    });
    
    // Se não foi passado briefing, é a criação direta -> Abre o ShareModal
    if(!briefing.description) {
      setAddedClient({id:cid, ...base});
    }

    setPending(null);
  },[clients.length]);

  const logout = () => signOut(auth);


  const updateBriefing = useCallback(async(id, briefing, plan)=>{
    await Clientes.updateBriefing(id, briefing, plan);
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

      if (portal) {
        await Clientes.update(portal.id, data);
      } else {
        await Clientes.create(data);
      }
      
      // O listener onAuthStateChanged cuidará de recarregar o portal
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
  if(portal) return <ClientPortalMain client={portal} onBack={null} />;

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
          {view === "clients" && <ClientsView clients={clients} onPortal={setPortal} onBriefing={setBriefCl}/>}
          {view === "fluxos" && <FluxosView clients={clients} />}
          {view === "tokens" && <TokensView clients={clients} />}
          {view === "financeiro" && <FinanceiroAdminView clients={clients} />}
          {view === "vendas" && <VendasAdminView clients={clients} alerts={alerts} />}
          {view === "stats" && <StatsView clients={clients}/>}
          {view === "alerts" && <AlertsView alerts={alerts} markRead={Alerts.markRead} />}
          {view === "settings" && <SettingsView user={user}/>}
        </div>
      </SecretariaDashboard>
      {showNew && <NewModal onClose={() => setShowNew(false)} onNext={f => { setPending(f); setShowNew(false); }} />}
      {pending && <BriefingWizard initial={EMPTY_B} planInit={pending.plan} onSave={(b, p) => addClient(pending, b, p)} onCancel={() => setPending(null)} />}
      {briefCl && <BriefingWizard initial={briefCl.briefing || {}} planInit={briefCl.plan} onSave={(b, p) => updateBriefing(briefCl.id, b, p)} onCancel={() => setBriefCl(null)} />}
    </div>
  );
}

