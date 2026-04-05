import { useState } from "react";

const T = {
  bg:"#0D0F14",surface:"#13161D",up:"#1A1D26",border:"rgba(255,255,255,0.07)",borderSt:"rgba(255,255,255,0.13)",
  green:"#25D366",greenDim:"rgba(37,211,102,0.12)",amber:"#F59E0B",amberDim:"rgba(245,158,11,0.12)",
  red:"#EF4444",redDim:"rgba(239,68,68,0.1)",n8n:"#EA4B71",n8nDim:"rgba(234,75,113,0.12)",
  blue:"#4285F4",blueDim:"rgba(66,133,244,0.1)",ink:"#F0F2F7",inkSec:"#9CA3B0",inkTert:"#5C6270",inkMuted:"#3A3F4A",
  asaas:"#00B4D8",
};

const INIT_CLIENTS = [
  {
    id:1,name:"Clínica Bella Saúde",phone:"+55 11 9 9999-0001",waba_id:"WABA_001",status:"active",
    n8n_url:"https://n8n.bellasaude.com.br/webhook/wa",n8n_status:"online",
    capabilities:["text","audio","image","file"],calendar:"clinica@bellasaude.com.br",plan:"Pro",
    msgs_today:342,msgs_month:8920,last_active:"há 2 min",avatar:"BS",color:"#6366F1",
    briefing:{
      segment:"Saúde / Clínica",description:"Clínica de saúde integrativa com foco em medicina preventiva.",
      site:"bellasaude.com.br",instagram:"@clinicabellasaude",
      ai_name:"Bela",ai_tone:"Acolhedora e profissional",ai_goal:"Agendamentos",
      business_hours:"Seg–Sex 8h–18h | Sáb 8h–12h",
      escalation_trigger:"Urgências, exames de alto custo, reclamações",escalation_number:"+55 11 9 8888-0000",
      services:[{name:"Consulta Clínica Geral",price:"R$ 180"},{name:"Consulta Nutricional",price:"R$ 220"},{name:"Check-up Completo",price:"R$ 480"}],
      faqs:[{q:"Vocês atendem convênios?",a:"Atendemos Unimed, SulAmérica e Bradesco Saúde."},{q:"Como agendar?",a:"Basta informar o serviço desejado e verifico os horários disponíveis."}],
      restrictions:"Nunca confirmar diagnóstico. Não informar valores de exames laboratoriais.",
      promotions:"Desconto de 10% em check-up para novos pacientes em março.",
    },
    invoices:[
      {id:"ASS-001",desc:"Implementação",amount:1200,status:"pago",date:"10/12/2025"},
      {id:"ASS-002",desc:"Mensalidade Jan/26",amount:397,status:"pago",date:"05/01/2026"},
      {id:"ASS-003",desc:"Mensalidade Fev/26",amount:397,status:"pago",date:"05/02/2026"},
      {id:"ASS-004",desc:"Mensalidade Mar/26",amount:397,status:"pendente",date:"05/03/2026"},
    ],
    messages:[
      {from:"client",text:"Oi! Posso adicionar o número da Dra. Ana para transferência?",ts:"10/03 14:32"},
      {from:"admin",text:"Claro! Me passa o número que atualizo o fluxo ainda hoje.",ts:"10/03 15:01"},
      {from:"client",text:"+55 11 9 7777-5555. Obrigada!",ts:"10/03 15:10"},
      {from:"admin",text:"Feito ✅ já está ativo no fluxo.",ts:"10/03 16:40"},
    ],
  },
  {
    id:2,name:"Studio Fio de Ouro",phone:"+55 21 9 8888-0002",waba_id:"WABA_002",status:"active",
    n8n_url:"https://n8n.fiodeouro.io/webhook/wa",n8n_status:"online",
    capabilities:["text","image"],calendar:"agenda@fiodeouro.io",plan:"Starter",
    msgs_today:89,msgs_month:2100,last_active:"há 15 min",avatar:"FO",color:"#EC4899",
    briefing:{segment:"Beleza / Salão",description:"",site:"",instagram:"",ai_name:"",ai_tone:"",ai_goal:"",business_hours:"",escalation_trigger:"",escalation_number:"",services:[],faqs:[],restrictions:"",promotions:""},
    invoices:[
      {id:"ASS-010",desc:"Implementação",amount:900,status:"pago",date:"15/01/2026"},
      {id:"ASS-011",desc:"Mensalidade Mar/26",amount:197,status:"vencido",date:"01/03/2026"},
    ],
    messages:[],
  },
  {
    id:3,name:"Odonto Prime",phone:"+55 41 9 6666-0004",waba_id:"WABA_004",status:"active",
    n8n_url:"https://n8n.odontoprime.com.br/webhook/wa",n8n_status:"online",
    capabilities:["text","audio","image","file"],calendar:"recepcao@odontoprime.com.br",plan:"Enterprise",
    msgs_today:721,msgs_month:18300,last_active:"agora",avatar:"OP",color:"#0EA5E9",
    briefing:{segment:"Saúde / Odontologia",description:"",site:"",instagram:"",ai_name:"",ai_tone:"",ai_goal:"",business_hours:"",escalation_trigger:"",escalation_number:"",services:[],faqs:[],restrictions:"",promotions:""},
    invoices:[
      {id:"ASS-020",desc:"Implementação",amount:2500,status:"pago",date:"01/11/2025"},
      {id:"ASS-021",desc:"Mensalidade Mar/26",amount:897,status:"pendente",date:"05/03/2026"},
    ],
    messages:[],
  },
];

const CAP_META={text:{label:"Texto",icon:"✍️"},audio:{label:"Áudio",icon:"🎙️"},image:{label:"Imagem",icon:"🖼️"},file:{label:"Arquivo",icon:"📎"}};
const PLAN_META={Starter:{color:T.inkSec,bg:"rgba(156,163,176,0.1)"},Pro:{color:T.green,bg:T.greenDim},Enterprise:{color:T.amber,bg:T.amberDim}};
const SEGMENTS=["Saúde / Clínica","Saúde / Odontologia","Beleza / Salão","Educação","Imobiliária","Jurídico","Alimentação","Varejo","Serviços Gerais","Outro"];
const TONES=["Acolhedora e profissional","Formal e sério","Descontraído e amigável","Jovial e animado","Técnico e objetivo"];
const GOALS=["Agendamentos","Vendas / Captação","Suporte ao cliente","Tirar dúvidas (FAQ)","Tudo acima"];
const EMPTY_BRIEFING={segment:"",description:"",site:"",instagram:"",ai_name:"",ai_tone:"",ai_goal:"",business_hours:"",escalation_trigger:"",escalation_number:"",services:[],faqs:[],restrictions:"",promotions:""};

// ── Primitives ─────────────────────────────────────────────────────────────
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
function Sel({label,value,onChange,options}){
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
  const v={primary:{bg:T.green,color:"#000",border:"none"},ghost:{bg:"transparent",color:T.inkSec,border:`1px solid ${T.border}`},danger:{bg:T.redDim,color:T.red,border:`1px solid ${T.red}33`}}[variant];
  return(<button onClick={onClick} style={{padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",...v,...sx}}>{children}</button>);
}
function SH({children}){return<div style={{fontSize:11,fontWeight:700,color:T.inkTert,letterSpacing:1.2,textTransform:"uppercase",marginBottom:14,marginTop:4}}>{children}</div>;}

// ── Briefing Wizard ───────────────────────────────────────────────────────────
const STEPS=[{id:"negocio",icon:"🏢",label:"Negócio"},{id:"ia",icon:"🤖",label:"Persona da IA"},{id:"servicos",icon:"💼",label:"Serviços"},{id:"faqs",icon:"❓",label:"Perguntas Freq."},{id:"regras",icon:"🚫",label:"Regras"},{id:"plano",icon:"💳",label:"Plano"}];

function BriefingWizard({initial,planInit,onSave,onCancel}){
  const [step,setStep]=useState(0);
  const [b,setB]=useState({...EMPTY_BRIEFING,...initial});
  const [plan,setPlan]=useState(planInit||"Pro");
  const [ns,setNs]=useState({name:"",price:""});
  const [nf,setNf]=useState({q:"",a:""});
  const upd=k=>v=>setB(p=>({...p,[k]:v}));

  const info=(text)=>(
    <div style={{background:T.up,borderRadius:12,padding:"12px 16px",border:`1px solid ${T.border}`,fontSize:12,color:T.inkSec,lineHeight:1.6}}>{text}</div>
  );

  const pages=[
    <div key="n" style={{display:"flex",flexDirection:"column",gap:14}}>
      {info("💡 Essas informações alimentam o contexto da IA — ela entende o negócio e fala com precisão sobre o que é oferecido.")}
      <Sel label="Segmento *" value={b.segment} onChange={upd("segment")} options={SEGMENTS}/>
      <Inp label="Descrição do negócio *" value={b.description} onChange={upd("description")} placeholder="O que a empresa faz, público-alvo, diferenciais…" rows={4}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label="Site" value={b.site} onChange={upd("site")} placeholder="meunegocio.com.br"/>
        <Inp label="Instagram" value={b.instagram} onChange={upd("instagram")} placeholder="@usuario"/>
      </div>
    </div>,

    <div key="ia" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Inp label='Nome da assistente virtual *' value={b.ai_name} onChange={upd("ai_name")} placeholder='"Ana", "Max", "Luna"'/>
        <Sel label="Tom de voz *" value={b.ai_tone} onChange={upd("ai_tone")} options={TONES}/>
      </div>
      <div>
        <label style={{fontSize:11,color:T.inkTert,display:"block",marginBottom:8}}>Objetivo principal da IA *</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{GOALS.map(g=><Chip key={g} active={b.ai_goal===g} onClick={()=>upd("ai_goal")(g)}>{g}</Chip>)}</div>
      </div>
      <Inp label="Horário de atendimento *" value={b.business_hours} onChange={upd("business_hours")} placeholder="Seg–Sex 8h–18h | Sáb 8h–13h"/>
      <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
        <SH>Transferência para humano</SH>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Quando transferir?" value={b.escalation_trigger} onChange={upd("escalation_trigger")} placeholder="Urgências, reclamações, valores acima de R$500…" rows={2}/>
          <Inp label="Número WhatsApp para transferência" value={b.escalation_number} onChange={upd("escalation_number")} placeholder="+55 11 9 0000-0000"/>
        </div>
      </div>
    </div>,

    <div key="s" style={{display:"flex",flexDirection:"column",gap:14}}>
      {info("📋 Liste os principais serviços/produtos. A IA usará isso para responder preços, disponibilidade e recomendações.")}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {b.services.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:T.bg,padding:"10px 14px",borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:T.ink}}>{s.name}</div>
              <div style={{fontSize:11,color:T.inkTert}}>{s.price||"Preço a consultar"}</div>
            </div>
            <button onClick={()=>setB(p=>({...p,services:p.services.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:16,padding:4}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,alignItems:"end"}}>
        <Inp label="Nome do serviço / produto" value={ns.name} onChange={v=>setNs(p=>({...p,name:v}))} placeholder="Ex: Consulta de avaliação"/>
        <Inp label="Valor (opcional)" value={ns.price} onChange={v=>setNs(p=>({...p,price:v}))} placeholder="R$ 0"/>
        <Btn onClick={()=>{if(!ns.name.trim())return;setB(p=>({...p,services:[...p.services,{...ns}]}));setNs({name:"",price:""});}} style={{whiteSpace:"nowrap"}}>+ Add</Btn>
      </div>
    </div>,

    <div key="f" style={{display:"flex",flexDirection:"column",gap:14}}>
      {info("❓ Quais perguntas seus clientes mais fazem? Cada resposta vira conhecimento direto da IA — sem invenção, sem erro.")}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {b.faqs.map((f,i)=>(
          <div key={i} style={{background:T.bg,padding:"12px 14px",borderRadius:10,border:`1px solid ${T.border}`,display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:T.ink,marginBottom:4}}>❓ {f.q}</div>
              <div style={{fontSize:12,color:T.inkSec}}>✅ {f.a}</div>
            </div>
            <button onClick={()=>setB(p=>({...p,faqs:p.faqs.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:16,padding:4,flexShrink:0}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{background:T.bg,padding:14,borderRadius:12,border:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:10}}>
        <Inp label="Pergunta" value={nf.q} onChange={v=>setNf(p=>({...p,q:v}))} placeholder="Vocês atendem aos sábados?"/>
        <Inp label="Resposta que a IA deve dar" value={nf.a} onChange={v=>setNf(p=>({...p,a:v}))} placeholder="Sim! Atendemos sábados das 8h às 13h." rows={2}/>
        <Btn onClick={()=>{if(!nf.q.trim()||!nf.a.trim())return;setB(p=>({...p,faqs:[...p.faqs,{...nf}]}));setNf({q:"",a:""});}}>+ Adicionar pergunta</Btn>
      </div>
    </div>,

    <div key="r" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{background:"rgba(239,68,68,0.06)",borderRadius:12,padding:"12px 16px",border:`1px solid ${T.red}33`,fontSize:12,color:T.inkSec,lineHeight:1.6}}>
        🚫 Defina o que a IA <strong style={{color:T.ink}}>jamais</strong> deve fazer ou dizer. Isso evita erros, problemas legais e situações constrangedoras.
      </div>
      <Inp label="O que a IA NUNCA deve dizer ou fazer" value={b.restrictions} onChange={upd("restrictions")} placeholder="Ex: nunca confirmar diagnóstico, nunca falar de concorrentes…" rows={4}/>
      <Inp label="Promoções e avisos temporários ativos" value={b.promotions} onChange={upd("promotions")} placeholder="Ex: 20% off em consultas de março, frete grátis até dia 31…" rows={3}/>
      {info("💡 Avise sempre por mensagem quando promoções mudarem — atualizamos o contexto na hora.")}
    </div>,

    <div key="p" style={{display:"flex",flexDirection:"column",gap:14}}>
      <SH>Escolha o plano</SH>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {p:"Starter",price:"R$ 197/mês",impl:"R$ 900",f:["Texto + Imagem","1 workflow n8n","Suporte chat"]},
          {p:"Pro",price:"R$ 397/mês",impl:"R$ 1.200",f:["Texto+Áudio+Imagem+Arquivo","2 workflows n8n","Google Agenda","Suporte prioritário"]},
          {p:"Enterprise",price:"R$ 897/mês",impl:"R$ 2.500",f:["Tudo do Pro","Workflows ilimitados","Integrações custom","Onboarding dedicado"]},
        ].map(({p,price,impl,f})=>{
          const pm=PLAN_META[p];const sel=plan===p;
          return(
            <div key={p} onClick={()=>setPlan(p)} style={{cursor:"pointer",background:sel?pm.bg:T.bg,border:`2px solid ${sel?pm.color+"66":T.border}`,borderRadius:14,padding:16,transition:"all 150ms"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:sel?pm.color:T.ink}}>{p}</span>
                {sel&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:pm.color,color:"#000",fontWeight:700}}>✓</span>}
              </div>
              <div style={{fontSize:16,fontWeight:700,color:T.ink,marginBottom:2}}>{price}</div>
              <div style={{fontSize:11,color:T.inkTert,marginBottom:10}}>Impl.: {impl}</div>
              {f.map(x=><div key={x} style={{fontSize:11,color:T.inkSec,marginBottom:3}}>✓ {x}</div>)}
            </div>
          );
        })}
      </div>
      <div style={{background:T.n8nDim,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.n8n}33`,display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:24}}>💳</span>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:T.ink}}>Cobrança via Asaas</div>
          <div style={{fontSize:12,color:T.inkSec}}>Após salvar, link de pagamento gerado automaticamente e enviado ao cliente por WhatsApp e e-mail.</div>
        </div>
      </div>
    </div>,
  ];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}}>
      <div style={{background:T.surface,borderRadius:24,width:640,maxHeight:"90vh",display:"flex",flexDirection:"column",border:`1px solid ${T.borderSt}`,overflow:"hidden",animation:"fadeIn 150ms ease"}}>
        <div style={{padding:"18px 28px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:T.ink}}>Briefing do Cliente</div>
            <div style={{fontSize:12,color:T.inkTert,marginTop:2}}>Configure a IA para o negócio dele</div>
          </div>
          <button onClick={onCancel} style={{background:"none",border:"none",cursor:"pointer",color:T.inkTert,fontSize:18}}>✕</button>
        </div>
        <div style={{display:"flex",padding:"0 28px",borderBottom:`1px solid ${T.border}`,overflowX:"auto",gap:2}}>
          {STEPS.map((s,i)=>(
            <button key={s.id} onClick={()=>setStep(i)} style={{padding:"11px 10px",border:"none",cursor:"pointer",background:"none",color:step===i?T.green:T.inkTert,fontSize:11,fontWeight:step===i?700:500,borderBottom:`2px solid ${step===i?T.green:"transparent"}`,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,fontFamily:"inherit",transition:"color 150ms"}}>
              {s.icon} {s.label} {i<step&&<span style={{fontSize:10,color:T.green}}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"22px 28px"}}>{pages[step]}</div>
        <div style={{padding:"14px 28px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:12,color:T.inkTert}}>Passo {step+1} de {STEPS.length}</div>
          <div style={{display:"flex",gap:10}}>
            {step>0&&<Btn variant="ghost" onClick={()=>setStep(s=>s-1)}>← Anterior</Btn>}
            {step<STEPS.length-1&&<Btn onClick={()=>setStep(s=>s+1)}>Próximo →</Btn>}
            {step===STEPS.length-1&&<Btn onClick={()=>onSave(b,plan)}>✅ Salvar briefing</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Client Portal ─────────────────────────────────────────────────────────────
function Portal({client,onBack}){
  const [tab,setTab]=useState("briefing");
  const [msgs,setMsgs]=useState(client.messages||[]);
  const [draft,setDraft]=useState("");
  const [editBriefing,setEditBriefing]=useState(false);
  const pm=PLAN_META[client.plan]||PLAN_META.Starter;
  const b=client.briefing;
  const pct=[b.description,b.ai_name,b.ai_tone,b.ai_goal,b.business_hours].filter(Boolean).length*20;
  const send=()=>{if(!draft.trim())return;setMsgs(m=>[...m,{from:"client",text:draft,ts:new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}]);setDraft("");};

  const TABS=[{id:"briefing",icon:"📋",label:"Meu Briefing"},{id:"mensagens",icon:"💬",label:"Mensagens"},{id:"pagamentos",icon:"💳",label:"Pagamentos"}];

  return(
    <div style={{background:T.bg,minHeight:"100vh",fontFamily:"-apple-system,BlinkMacSystemFont,'Inter',sans-serif",color:T.ink}}>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"13px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:T.inkSec,fontSize:13,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>← Voltar</button>
          <div style={{width:1,height:20,background:T.border}}/>
          <Av initials={client.avatar} color={client.color} size={32}/>
          <div><div style={{fontSize:13,fontWeight:700,color:T.ink}}>{client.name}</div><div style={{fontSize:11,color:T.inkTert}}>Portal do Cliente</div></div>
        </div>
        <div style={{display:"flex",gap:8}}><Tag color={pm.color} bg={pm.bg}>{client.plan}</Tag><StatusTag status={client.status}/></div>
      </div>
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,display:"flex",padding:"0 24px"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"13px 18px",border:"none",cursor:"pointer",background:"none",color:tab===t.id?T.green:T.inkSec,fontSize:13,fontWeight:tab===t.id?700:400,borderBottom:`2px solid ${tab===t.id?T.green:"transparent"}`,display:"flex",alignItems:"center",gap:7,fontFamily:"inherit",transition:"color 150ms"}}>
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
              <div style={{height:6,background:T.bg,borderRadius:3}}>
                <div style={{height:6,borderRadius:3,width:`${pct}%`,background:pct>=80?T.green:pct>=40?T.amber:T.red,transition:"width 600ms"}}/>
              </div>
              <div style={{fontSize:11,color:T.inkTert,marginTop:6}}>{pct}% preenchido</div>
            </div>

            {[
              {title:"🏢 Sobre o Negócio",rows:[{l:"Segmento",v:b.segment},{l:"Site",v:b.site},{l:"Instagram",v:b.instagram}],extra:b.description&&<div style={{fontSize:12,color:T.inkSec,background:T.bg,borderRadius:10,padding:"10px 14px",lineHeight:1.6,marginTop:8}}>{b.description}</div>},
              {title:"🤖 Persona da IA",cols:[{l:"Nome",v:b.ai_name},{l:"Tom",v:b.ai_tone},{l:"Objetivo",v:b.ai_goal},{l:"Horário",v:b.business_hours},{l:"Transferir quando",v:b.escalation_trigger},{l:"Número human.",v:b.escalation_number}]},
            ].map(sec=>(
              <div key={sec.title} style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>{sec.title}</div>
                <div style={{padding:"14px 20px"}}>
                  {sec.rows&&sec.rows.map(f=>(
                    <div key={f.l} style={{display:"flex",gap:16,alignItems:"baseline",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                      <span style={{fontSize:11,color:T.inkTert,width:80,flexShrink:0}}>{f.l}</span>
                      <span style={{fontSize:13,color:f.v?T.ink:T.inkMuted}}>{f.v||"—"}</span>
                    </div>
                  ))}
                  {sec.cols&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{sec.cols.map(f=>(
                    <div key={f.l}><div style={{fontSize:10,color:T.inkTert,marginBottom:3}}>{f.l}</div><div style={{fontSize:12,color:f.v?T.ink:T.inkMuted}}>{f.v||"—"}</div></div>
                  ))}</div>}
                  {sec.extra}
                </div>
              </div>
            ))}

            {b.services?.length>0&&(
              <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>💼 Serviços / Produtos</div>
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
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>❓ Perguntas Frequentes ({b.faqs.length})</div>
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

            {(b.restrictions||b.promotions)&&(
              <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>🚫 Regras & Restrições</div>
                <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
                  {b.restrictions&&<div><div style={{fontSize:11,color:T.red,marginBottom:4}}>Proibido</div><div style={{fontSize:12,color:T.inkSec,background:T.redDim,borderRadius:8,padding:"8px 12px"}}>{b.restrictions}</div></div>}
                  {b.promotions&&<div><div style={{fontSize:11,color:T.amber,marginBottom:4}}>Promoções ativas</div><div style={{fontSize:12,color:T.inkSec,background:T.amberDim,borderRadius:8,padding:"8px 12px"}}>{b.promotions}</div></div>}
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
                const ic=m.from==="client";
                return(
                  <div key={i} style={{display:"flex",justifyContent:ic?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"75%",background:ic?T.greenDim:T.up,border:`1px solid ${ic?T.green+"33":T.border}`,borderRadius:ic?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px"}}>
                      <div style={{fontSize:12,color:T.ink,lineHeight:1.5}}>{m.text}</div>
                      <div style={{fontSize:10,color:T.inkTert,marginTop:4,textAlign:ic?"right":"left"}}>{m.ts} · {ic?"Você":"Equipe"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:"12px 20px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10}}>
              <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Escreva sua mensagem…" style={{flex:1,padding:"10px 14px",borderRadius:10,background:T.bg,border:`1px solid ${T.border}`,color:T.ink,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
              <Btn onClick={send} style={{flexShrink:0}}>Enviar</Btn>
            </div>
          </div>
        )}

        {tab==="pagamentos"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div style={{background:T.surface,borderRadius:16,padding:"18px 22px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:11,color:T.inkTert,marginBottom:4}}>Plano atual</div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20,fontWeight:700,color:PLAN_META[client.plan]?.color||T.ink}}>{client.plan}</span><StatusTag status={client.status}/></div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:11,color:T.inkTert,marginBottom:4}}>Próximo vencimento</div><div style={{fontSize:14,fontWeight:600,color:T.ink}}>05/04/2026</div></div>
            </div>
            <div style={{background:`linear-gradient(135deg,rgba(0,180,216,0.12),rgba(0,180,216,0.04))`,borderRadius:14,padding:"14px 18px",border:`1px solid rgba(0,180,216,0.25)`,display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:42,height:42,borderRadius:12,background:"rgba(0,180,216,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>💳</div>
              <div><div style={{fontSize:13,fontWeight:700,color:T.ink}}>Pagamentos via Asaas</div><div style={{fontSize:12,color:T.inkSec,marginTop:2}}>Boleto, Pix, ou cartão de crédito. Recibos automáticos por e-mail.</div></div>
            </div>
            <div style={{background:T.surface,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
              <div style={{padding:"13px 20px",borderBottom:`1px solid ${T.border}`,fontSize:13,fontWeight:700,color:T.ink}}>Histórico de cobranças</div>
              {(client.invoices||[]).map((inv,i)=>(
                <div key={inv.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",borderBottom:i<(client.invoices.length-1)?`1px solid ${T.border}`:"none"}}>
                  <div style={{fontSize:18}}>{inv.status==="pago"?"🟢":inv.status==="pendente"?"🟡":"🔴"}</div>
                  <div style={{flex:1}}><div style={{fontSize:13,color:T.ink}}>{inv.desc}</div><div style={{fontSize:11,color:T.inkTert}}>{inv.id} · Venc. {inv.date}</div></div>
                  <div style={{fontWeight:700,fontSize:14,color:T.ink}}>{inv.amount.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</div>
                  <InvTag status={inv.status}/>
                  {inv.status!=="pago"&&<button style={{padding:"7px 14px",borderRadius:8,background:T.asaas+"22",border:`1px solid ${T.asaas}44`,color:T.asaas,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Pagar agora</button>}
                </div>
              ))}
              {(!client.invoices||client.invoices.length===0)&&<div style={{padding:32,textAlign:"center",color:T.inkTert,fontSize:13}}>Sem cobranças ainda.</div>}
            </div>
            <div style={{background:T.up,borderRadius:14,padding:"13px 18px",border:`1px solid ${T.border}`,fontSize:12,color:T.inkSec,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>💬</span> Dúvidas sobre sua cobrança? Fale com a equipe na aba <strong style={{color:T.ink}}>Mensagens</strong>.
            </div>
          </div>
        )}
      </div>

      {editBriefing&&(
        <BriefingWizard
          initial={client.briefing}
          planInit={client.plan}
          onSave={(nb,np)=>{client.briefing={...nb};client.plan=np;setEditBriefing(false);}}
          onCancel={()=>setEditBriefing(false)}
        />
      )}
    </div>
  );
}

// ── Admin Card ─────────────────────────────────────────────────────────────────
function AdminCard({client,onPortal,onBriefing}){
  const [hov,setHov]=useState(false);
  const pm=PLAN_META[client.plan]||PLAN_META.Starter;
  const b=client.briefing;
  const pct=b?[b.description,b.ai_name,b.ai_tone,b.ai_goal,b.business_hours].filter(Boolean).length*20:0;
  const hasPending=(client.invoices||[]).some(i=>i.status!=="pago");
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
        <Pulse status={client.n8n_status}/>
        <span style={{fontSize:11,color:T.n8n,fontWeight:600}}>n8n</span>
        <span style={{fontSize:11,color:T.inkTert,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{client.n8n_url||"Webhook não configurado"}</span>
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontSize:11,color:T.inkTert}}>Briefing</span>
          <span style={{fontSize:11,color:pct>=80?T.green:pct>=40?T.amber:T.red}}>{pct}%</span>
        </div>
        <div style={{height:4,background:T.bg,borderRadius:2}}>
          <div style={{height:4,borderRadius:2,width:`${pct}%`,background:pct>=80?T.green:pct>=40?T.amber:T.red,transition:"width 600ms"}}/>
        </div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {client.capabilities.map(c=>{const m=CAP_META[c];return<span key={c} style={{fontSize:10,padding:"2px 7px",borderRadius:6,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.inkSec}}>{m.icon} {m.label}</span>;})}
        {client.calendar&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:6,background:T.blueDim,border:"1px solid rgba(66,133,244,0.2)",color:T.blue}}>📅 Agenda</span>}
      </div>
      <div style={{display:"flex",gap:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
        <button onClick={()=>onPortal(client)} style={{flex:1,padding:"8px",borderRadius:9,background:"transparent",border:`1px solid ${T.border}`,color:T.inkSec,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Portal Cliente</button>
        <button onClick={()=>onBriefing(client)} style={{flex:1,padding:"8px",borderRadius:9,background:T.greenDim,border:`1px solid ${T.green}44`,color:T.green,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✏️ Briefing</button>
      </div>
    </div>
  );
}

// ── New Client Flow ────────────────────────────────────────────────────────────
function NewModal({onClose,onNext}){
  const [f,setF]=useState({name:"",phone:"",plan:"Pro",capabilities:["text"]});
  const upd=k=>v=>setF(p=>({...p,[k]:v}));
  const tc=c=>setF(p=>({...p,capabilities:p.capabilities.includes(c)?p.capabilities.filter(x=>x!==c):[...p.capabilities,c]}));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)"}}>
      <div style={{background:T.surface,borderRadius:20,width:460,border:`1px solid ${T.borderSt}`,overflow:"hidden",animation:"fadeIn 150ms ease"}}>
        <div style={{padding:"18px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:15,fontWeight:700,color:T.ink}}>Novo Cliente</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:T.inkTert,fontSize:18}}>✕</button>
        </div>
        <div style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
          <Inp label="Nome do cliente *" value={f.name} onChange={upd("name")} placeholder="Ex: Clínica Saúde Total"/>
          <Inp label="Número WhatsApp *" value={f.phone} onChange={upd("phone")} placeholder="+55 11 9 0000-0000"/>
          <div>
            <label style={{fontSize:11,color:T.inkTert,display:"block",marginBottom:8}}>Capacidades da IA</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{Object.entries(CAP_META).map(([c,m])=><Chip key={c} active={f.capabilities.includes(c)} onClick={()=>tc(c)}>{m.icon} {m.label}</Chip>)}</div>
          </div>
          <div>
            <label style={{fontSize:11,color:T.inkTert,display:"block",marginBottom:8}}>Plano inicial</label>
            <div style={{display:"flex",gap:8}}>{["Starter","Pro","Enterprise"].map(p=><Chip key={p} active={f.plan===p} onClick={()=>upd("plan")(p)}>{p}</Chip>)}</div>
          </div>
        </div>
        <div style={{padding:"14px 22px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10}}>
          <Btn variant="ghost" onClick={onClose} style={{flex:1,textAlign:"center"}}>Cancelar</Btn>
          <button onClick={()=>{if(!f.name.trim()||!f.phone.trim())return;onNext(f);}} style={{flex:2,padding:10,borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",background:T.green,border:"none",color:"#000",fontFamily:"inherit"}}>Próximo: Briefing →</button>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
const COLORS=["#6366F1","#EC4899","#F59E0B","#0EA5E9","#10B981","#8B5CF6","#F43F5E"];

export default function App(){
  const [clients,setClients]=useState(INIT_CLIENTS);
  const [portal,setPortal]=useState(null);
  const [briefCl,setBriefCl]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [pending,setPending]=useState(null);
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");

  const addClient=(base,briefing,plan)=>{
    const av=base.name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
    setClients(p=>[...p,{id:Date.now(),...base,waba_id:`WABA_${String(p.length+1).padStart(3,"0")}`,status:"setup",n8n_url:"",n8n_status:"pending",calendar:null,plan,msgs_today:0,msgs_month:0,last_active:"—",avatar:av,color:COLORS[p.length%COLORS.length],briefing,invoices:[],messages:[]}]);
    setPending(null);
  };

  const updateBriefing=(id,b,p)=>{setClients(cl=>cl.map(c=>c.id===id?{...c,briefing:b,plan:p}:c));setBriefCl(null);};

  const filtered=clients.filter(c=>{
    const ms=c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search);
    const mf=filter==="all"||c.status===filter;
    return ms&&mf;
  });

  const totalMsgs=clients.reduce((a,c)=>a+c.msgs_today,0);
  const activeN=clients.filter(c=>c.status==="active").length;
  const n8nN=clients.filter(c=>c.n8n_status==="online").length;
  const pendAmt=clients.reduce((a,c)=>a+(c.invoices||[]).filter(i=>i.status!=="pago").reduce((s,i)=>s+i.amount,0),0);

  if(portal) return <Portal client={portal} onBack={()=>setPortal(null)}/>;

  return(
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Inter',sans-serif",background:T.bg,minHeight:"100vh",color:T.ink}}>
      <style>{`@keyframes pulse{0%,100%{opacity:.25}50%{opacity:.5}}@keyframes fadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}`}</style>
      <div style={{position:"fixed",top:0,left:0,bottom:0,width:64,background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:20,paddingBottom:20,gap:8,zIndex:40}}>
        <div style={{width:36,height:36,borderRadius:10,background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:16,flexShrink:0}}>🤖</div>
        {[{i:"⚡",a:true},{i:"👥"},{i:"📊"},{i:"⚙️"}].map((x,i)=><button key={i} style={{width:40,height:40,borderRadius:10,border:"none",cursor:"pointer",background:x.a?T.greenDim:"transparent",fontSize:17,color:x.a?T.green:T.inkTert}}>{x.i}</button>)}
        <div style={{flex:1}}/>
        <button style={{width:32,height:32,borderRadius:"50%",border:"none",cursor:"pointer",background:"#6366F122",color:"#6366F1",fontSize:13,fontWeight:700}}>JM</button>
      </div>
      <div style={{marginLeft:64,padding:32}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
          <div>
            <h1 style={{margin:0,fontSize:22,fontWeight:700,color:T.ink}}>WA<span style={{color:T.green}}>AI</span> Manager</h1>
            <p style={{margin:"4px 0 0",fontSize:13,color:T.inkTert}}>Implementações de IA para WhatsApp</p>
          </div>
          <Btn onClick={()=>setShowNew(true)}>+ Novo Cliente</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
          {[{icon:"👥",val:activeN,label:"Clientes ativos",sub:`de ${clients.length}`,accent:T.green},{icon:"💬",val:totalMsgs.toLocaleString("pt-BR"),label:"Mensagens hoje"},{icon:"⚡",val:n8nN,label:"n8n online",sub:`de ${clients.length}`,accent:T.n8n},{icon:"💰",val:pendAmt.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}),label:"A receber (Asaas)",accent:T.amber}].map(s=>(
            <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 22px",display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:20}}>{s.icon}</span>{s.sub&&<span style={{fontSize:11,color:T.inkTert}}>{s.sub}</span>}</div>
              <div style={{fontSize:26,fontWeight:700,color:s.accent||T.ink,lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:12,color:T.inkSec}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginBottom:22,alignItems:"center"}}>
          <div style={{flex:1,position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.inkTert}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar…" style={{width:"100%",padding:"9px 12px 9px 34px",borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,color:T.ink,fontSize:13,outline:"none"}}/>
          </div>
          {["all","active","paused","setup"].map(f=><Chip key={f} active={filter===f} onClick={()=>setFilter(f)}>{{all:"Todos",active:"Ativos",paused:"Pausados",setup:"Configurando"}[f]}</Chip>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:16}}>
          {filtered.map(c=><AdminCard key={c.id} client={c} onPortal={setPortal} onBriefing={setBriefCl}/>)}
          {filtered.length===0&&<div style={{gridColumn:"1/-1",padding:60,textAlign:"center",color:T.inkTert,fontSize:14}}>Nenhum cliente encontrado</div>}
        </div>
      </div>
      {showNew&&<NewModal onClose={()=>setShowNew(false)} onNext={f=>{setPending(f);setShowNew(false);}}/>}
      {pending&&<BriefingWizard initial={EMPTY_BRIEFING} planInit={pending.plan} onSave={(b,p)=>addClient(pending,b,p)} onCancel={()=>setPending(null)}/>}
      {briefCl&&<BriefingWizard initial={briefCl.briefing} planInit={briefCl.plan} onSave={(b,p)=>updateBriefing(briefCl.id,b,p)} onCancel={()=>setBriefCl(null)}/>}
    </div>
  );
}
