import { useState, useEffect } from "react";
import { 
  Pause, Play, MessageSquare, ChevronDown, ChevronUp, Send, User, Bot, 
  Clock, Edit3, Trash2, Search, Target, Activity, Sparkles, TrendingUp,
  Zap, Star, ShieldCheck, XCircle, CheckCircle2
} from "lucide-react";
import { Contatos, ChatMessages } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill, Pulse, COLORS } from "../../pages/ClientPortal";

const CRM_STATUS = {
  novo:        { label: "Lead Novo",     color: "var(--color-cta)",     bg: "rgba(202,138,4,0.1)",   icon: Sparkles },
  contatado:   { label: "Conversando",   color: "#E3B341",              bg: "rgba(227,179,65,0.1)", icon: MessageSquare },
  qualificado: { label: "Interessado",   color: "#8B5CF6",              bg: "rgba(139,92,246,0.1)", icon: Target },
  convertido:  { label: "Agendado",      color: "var(--color-primary)", bg: "rgba(16,185,129,0.1)", icon: CheckCircle2 },
  perdido:     { label: "Arquivado",     color: "#F85149",              bg: "rgba(248,81,73,0.1)", icon: XCircle },
};

function LeadCard({ lead, clientId }) {
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState([]);
  const [draft, setDraft]   = useState("");
  const [tab, setTab]       = useState("conversa"); 
  const [editIA, setEditIA] = useState(false);
  const [iaNome, setIaNome] = useState(lead.ia_nome || "");
  const s = CRM_STATUS[lead.crm_status || "novo"] || CRM_STATUS.novo;
  const ia = lead.atendimento_ia === "ativo";
  const initials = lead.nome?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const color = COLORS[lead.telefone?.length % COLORS.length] || COLORS[0];

  useEffect(() => {
    if (!open || tab !== "conversa") return;
    const unsub = ChatMessages.onList(clientId, lead.telefone, setMsgs);
    return unsub;
  }, [open, tab, lead.telefone, clientId]);

  const toggleIA = async () => {
    await Contatos.setPause(clientId, lead.id, ia);
  };

  const saveIANome = async () => {
    await Contatos.updateCRM(clientId, lead.id, { ia_nome: iaNome });
    setEditIA(false);
  };

  const sendMsg = async () => {
    if (!draft.trim()) return;
    await ChatMessages.add(clientId, { telefone: lead.telefone, role: "user", content: draft });
    setDraft("");
  };

  const setStatus = (status) => Contatos.updateCRM(clientId, lead.id, { crm_status: status });

  return (
    <div className={`group glass-card border rounded-[32px] overflow-hidden transition-all duration-500 ${open ? 'border-primary/40 ring-1 ring-primary/20 shadow-2xl' : 'hover:border-primary/20'}`}>
      <div className="p-6 flex items-center gap-6 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-black text-base border shadow-inner transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: color + '15', color: color, borderColor: color + '30' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-black text-main truncate tracking-tight">{lead.nome || "Lead S/ Nome"}</h4>
          <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <Zap size={10} className="text-primary" />
            {lead.telefone}
          </p>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-up/30 border border-border-subtle">
             <Pulse status={ia ? "online" : "offline"} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">{ia ? "Inteligência Ativa" : "IA em Pausa"}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ color: s.color, backgroundColor: s.bg, borderColor: s.color + '20' }}>
            <s.icon size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
          </div>
          <button className="h-10 w-10 rounded-xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-tertiary hover:text-primary transition-all">
            {open ? <ChevronUp size={18} strokeWidth={3} /> : <ChevronDown size={18} strokeWidth={3} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border-subtle animate-fade-in bg-surface-up/10">
          {/* Action Bar Refactored */}
          <div className="p-5 flex flex-wrap items-center gap-4 border-b border-border-subtle bg-surface-up/20">
            <Btn 
              variant={ia ? "danger" : "primary"}
              onClick={toggleIA}
              size="sm"
              icon={ia ? Pause : Play}
            >
              {ia ? 'Pausar IA' : 'Assumir Controle'}
            </Btn>

            {!editIA ? (
              <button onClick={() => setEditIA(true)} className="px-5 py-2.5 rounded-2xl bg-surface-up border border-border-subtle text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:border-primary/40 hover:text-primary flex items-center gap-3 transition-all cursor-pointer">
                <Edit3 size={14} /> Persona IA: {lead.ia_nome || "Padrão"}
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-surface-up p-1.5 rounded-2xl border border-primary/40">
                 <input value={iaNome} onChange={e => setIaNome(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest px-4 w-40 text-main" placeholder="NOME DA PERSONA" />
                 <button onClick={saveIANome} className="bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer">Salvar</button>
              </div>
            )}

            <div className="ml-auto flex gap-2">
              {Object.entries(CRM_STATUS).map(([id, m]) => (
                <button 
                  key={id} 
                  onClick={() => setStatus(id)}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${lead.crm_status === id ? 'bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/10' : 'bg-surface-up/50 border-border-subtle text-tertiary hover:text-secondary hover:border-border'}`}
                  title={m.label}
                >
                  <m.icon size={16} strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-8 mb-8 border-b border-border-subtle">
               {[['conversa', 'Fluxo de Diálogo'], ['notas', 'Notas Estratégicas']].map(([id, label]) => (
                 <button 
                   key={id}
                   onClick={() => setTab(id)}
                   className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 cursor-pointer ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}
                 >
                   {label}
                 </button>
               ))}
            </div>

            {tab === "conversa" && (
              <div className="flex flex-col h-[500px] bg-surface-up/30 rounded-[32px] border border-border-subtle overflow-hidden relative shadow-inner">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
                  {msgs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                       <MessageSquare size={60} strokeWidth={1} className="mb-4" />
                       <p className="text-xs font-black uppercase tracking-[0.2em]">Aguardando interação...</p>
                    </div>
                  ) : (
                    msgs.map((m, i) => {
                      const isAI = m.role === "assistant";
                      return (
                        <div key={i} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] p-5 rounded-[28px] text-sm leading-relaxed shadow-xl ${isAI ? 'bg-surface border border-border-subtle rounded-bl-none' : 'bg-primary/10 border border-primary/20 text-main rounded-br-none ring-1 ring-primary/10'}`}>
                            <p className="font-medium">{m.content}</p>
                            <div className={`mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ${isAI ? '' : 'justify-end'}`}>
                               {isAI ? <Bot size={12} className="text-primary" /> : <User size={12} className="text-cta" />}
                               {isAI ? (lead.ia_nome || "SecretarIA") : "Paciente"}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-6 bg-surface-up/50 border-t border-border-subtle flex gap-4">
                   <Inp 
                    value={draft} 
                    onChange={v => setDraft(v)} 
                    placeholder="Intervir no atendimento..."
                    icon={User}
                    onKeyDown={e => e.key === "Enter" && sendMsg()}
                   />
                   <button onClick={sendMsg} className="h-[54px] w-[54px] shrink-0 rounded-2xl bg-primary text-black flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                      <Send size={20} strokeWidth={2.5} />
                   </button>
                </div>
              </div>
            )}

            {tab === "notas" && (
              <div className="space-y-8 animate-fade-in">
                <Inp 
                  label="Contexto e Observações" 
                  value={lead.crm_notes || ""} 
                  onChange={v => Contatos.updateCRM(clientId, lead.id, { crm_notes: v })} 
                  placeholder="Descreva dores, objetivos e qualificações deste lead..." 
                  rows={8} 
                />
                <div className="flex items-center gap-3 text-[10px] font-black text-tertiary uppercase tracking-[0.2em] px-4 py-3 rounded-xl bg-surface-up/30 border border-border-subtle">
                   <Clock size={14} className="text-primary" />
                   Sincronizado em: {lead.ultima_interacao?.toDate?.()?.toLocaleString("pt-BR") || "Pendente"}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CRM1View({ client, leads }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filtered = leads.filter(l => {
    const ms = (l.nome || "").toLowerCase().includes(search.toLowerCase()) || l.telefone?.includes(search);
    const mf = filterStatus === "todos" || l.crm_status === filterStatus;
    return ms && mf;
  });

  const stats = {
    total: leads.length,
    ativos: leads.filter(l => l.atendimento_ia === "ativo").length,
    convertidos: leads.filter(l => l.crm_status === "convertido").length,
    novos: leads.filter(l => l.crm_status === "novo").length,
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={MessageSquare} title="Funil de Leads" subtitle="Acompanhe as prospecções e atendimentos da sua IA." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Total Prospecção", value: stats.total, color: "text-main", icon: Target },
          { label: "IA em Turno", value: stats.ativos, color: "text-primary", icon: Activity },
          { label: "Leads Qualificados", value: stats.novos, color: "text-cta", icon: Sparkles },
          { label: "Taxa de Sucesso", value: stats.convertidos, color: "text-emerald-500", icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-surface-up/50 flex items-center justify-center text-tertiary group-hover:text-primary group-hover:scale-110 transition-all duration-500 mb-6">
                 <s.icon size={22} strokeWidth={2.5} />
              </div>
              <h4 className={`text-4xl font-black tracking-tighter ${s.color}`}>{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-2.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 w-full">
           <Inp 
            value={search} 
            onChange={v => setSearch(v)} 
            placeholder="Pesquisar prospecções por nome ou terminal..." 
            icon={Search}
           />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 lg:pb-0 w-full lg:w-auto no-scrollbar scroll-smooth">
          {["todos", ...Object.keys(CRM_STATUS)].map(s => (
            <button 
              key={s} 
              onClick={() => setFilterStatus(s)}
              className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border cursor-pointer ${filterStatus === s ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40 hover:bg-surface-up'}`}
            >
              {s === "todos" ? "Todos os Leads" : CRM_STATUS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-border-subtle rounded-[48px] opacity-30">
             <ShieldCheck size={80} strokeWidth={1} className="mx-auto mb-6 text-tertiary" />
             <p className="text-sm font-black uppercase tracking-[0.3em]">Ambiente Livre de Leads</p>
          </div>
        ) : (
          filtered.map(lead => (
            <LeadCard key={lead.id} lead={lead} clientId={client.id} />
          ))
        )}
      </div>
    </div>
  );
}
