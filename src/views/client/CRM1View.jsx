import { useState, useEffect } from "react";
import { Pause, Play, MessageSquare, ChevronDown, ChevronUp, Send, User, Bot, Clock, Edit3, Trash2, Search, Target, Activity, Sparkles, TrendingUp } from "lucide-react";
import { Contatos, ChatMessages } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill, Pulse, COLORS } from "../../pages/ClientPortal";

const CRM_STATUS = {
  novo:        { label: "Lead Novo",   color: "var(--color-cta)",     bg: "rgba(14,165,233,0.1)"  },
  contatado:   { label: "Conversando", color: "#E3B341",              bg: "rgba(227,179,65,0.1)"  },
  qualificado: { label: "Interessado", color: "#8B5CF6",              bg: "rgba(139,92,246,0.1)"  },
  convertido:  { label: "Agendado",    color: "var(--color-primary)", bg: "rgba(16,185,129,0.1)"  },
  perdido:     { label: "Arquivado",   color: "#F85149",              bg: "rgba(248,81,73,0.1)"   },
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
    <div className={`group bg-surface border transition-all duration-300 rounded-[28px] overflow-hidden ${open ? 'border-primary/30 shadow-xl shadow-primary/5' : 'border-border-subtle hover:border-primary/20'}`}>
      <div className="p-5 flex items-center gap-5">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm border shadow-inner" style={{ backgroundColor: color + '22', color: color, borderColor: color + '44' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black text-main truncate leading-tight">{lead.nome || "Lead S/ Nome"}</h4>
          <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">{lead.telefone}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-2">
             <Pulse status={ia ? "online" : "offline"} />
             <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{ia ? "IA Ativa" : "IA Pausada"}</span>
          </div>
          <Pill color={s.color} bg={s.bg}>{s.label}</Pill>
          <button onClick={() => setOpen(!open)} className="h-10 w-10 rounded-xl bg-surface-up border border-border-subtle flex items-center justify-center text-tertiary hover:text-primary transition-all">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border-subtle animate-fade-in bg-surface-soft/30">
          {/* Action Bar */}
          <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border-subtle">
            <button 
              onClick={toggleIA}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ia ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}
            >
              {ia ? <><Pause size={12} /> Pausar Atendimento</> : <><Play size={12} /> Assumir IA</>}
            </button>

            {!editIA ? (
              <button onClick={() => setEditIA(true)} className="px-4 py-2 rounded-xl bg-surface-up border border-border-subtle text-[10px] font-black uppercase tracking-widest text-secondary hover:border-primary/20 flex items-center gap-2">
                <Edit3 size={12} /> IA: {lead.ia_nome || "Original"}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-surface-up p-1 rounded-xl border border-primary/30">
                 <input value={iaNome} onChange={e => setIaNome(e.target.value)} className="bg-transparent border-none outline-none text-[10px] font-black uppercase px-3 w-32" />
                 <button onClick={saveIANome} className="bg-primary text-black px-3 py-1.5 rounded-lg text-[9px] font-black">Salvar</button>
              </div>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {Object.entries(CRM_STATUS).map(([id, m]) => (
                <button
                  key={id}
                  onClick={() => setStatus(id)}
                  title={m.label}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all border-2 ${lead.crm_status === id ? 'scale-110 shadow-sm' : 'border-transparent opacity-40 hover:opacity-70'}`}
                  style={{
                    borderColor: lead.crm_status === id ? m.color : 'transparent',
                    backgroundColor: lead.crm_status === id ? m.bg : 'transparent',
                  }}
                >
                  <span className="h-3 w-3 rounded-full block" style={{ backgroundColor: m.color }} />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex px-4 pt-4 gap-4">
             {[['conversa', 'Conversa'], ['notas', 'Notas']].map(([id, label]) => (
               <button 
                 key={id}
                 onClick={() => setTab(id)}
                 className={`pb-2 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary'}`}
               >
                 {label}
               </button>
             ))}
          </div>

          <div className="p-4">
            {tab === "conversa" && (
              <div className="flex flex-col h-[400px] bg-surface rounded-[24px] border border-border-subtle overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {msgs.length === 0 ? (
                    <EmptyState Icon={MessageSquare} title="Sem mensagens" subtitle="Aguardando início de conversa..." />
                  ) : (
                    msgs.map((m, i) => {
                      const isAI = m.role === "assistant";
                      return (
                        <div key={i} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] p-4 rounded-[22px] text-sm leading-relaxed ${isAI ? 'bg-surface-soft border border-border-subtle rounded-bl-none' : 'bg-primary/10 border border-primary/20 text-primary rounded-br-none'}`}>
                            <p className="font-medium">{m.content}</p>
                            <div className={`mt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40 ${isAI ? '' : 'justify-end'}`}>
                               {isAI ? <Bot size={10} /> : <User size={10} />}
                               {isAI ? (lead.ia_nome || "SecretarIA") : "Humano"}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 bg-surface-soft border-t border-border-subtle flex gap-3">
                   <input 
                    value={draft} 
                    onChange={e => setDraft(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && sendMsg()} 
                    placeholder="Responda como humano..."
                    className="flex-1 bg-surface border border-border-subtle rounded-2xl px-5 py-3 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-tertiary/30"
                   />
                   <button onClick={sendMsg} className="h-12 w-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                      <Send size={18} />
                   </button>
                </div>
              </div>
            )}

            {tab === "notas" && (
              <div className="p-4 space-y-6">
                <Inp 
                  label="Notas do Atendimento" 
                  value={lead.crm_notes || ""} 
                  onChange={v => Contatos.updateCRM(clientId, lead.id, { crm_notes: v })} 
                  placeholder="Dores do paciente, objetivos, orçamento..." 
                  rows={6} 
                />
                <div className="flex items-center gap-2 text-[10px] font-black text-tertiary uppercase tracking-widest px-2">
                   <Clock size={12} />
                   Última Interação: {lead.ultima_interacao?.toDate?.()?.toLocaleString("pt-BR") || "Aguardando"}
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
    <div className="space-y-10 animate-fade-in">
      <PageTitle icon={MessageSquare} title="Funil de Leads" subtitle="Acompanhe as prospecções e atendimentos da sua IA." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Prospecção", value: stats.total, color: "text-main", icon: Target },
          { label: "IA em Turno", value: stats.ativos, color: "text-primary", icon: Activity },
          { label: "Novos Hoje", value: stats.novos, color: "text-blue-500", icon: Sparkles },
          { label: "Taxa Agendamento", value: stats.convertidos, color: "text-purple-500", icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="p-6 rounded-[32px] bg-surface border border-border-subtle flex flex-col justify-between hover:border-primary/20 transition-all">
            <div className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary">
               <s.icon size={20} />
            </div>
            <div className="mt-6">
              <h4 className={`text-3xl font-black tracking-tight ${s.color}`}>{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
           <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Pesquisar por nome ou celular..." 
            className="w-full pl-12 pr-6 py-4 rounded-[22px] bg-surface border border-border-subtle focus:border-primary/50 outline-none transition-all text-sm font-medium"
           />
           <MessageSquare size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {["todos", ...Object.keys(CRM_STATUS)].map(s => (
            <button 
              key={s} 
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filterStatus === s ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border-subtle text-secondary hover:border-primary/30'}`}
            >
              {s === "todos" ? "Todos" : CRM_STATUS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-20 text-center border border-dashed border-border-subtle rounded-[40px] opacity-40">
             <Target size={60} className="mx-auto mb-4" />
             <p className="text-sm font-bold uppercase tracking-widest">Nenhum lead encontrado</p>
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
