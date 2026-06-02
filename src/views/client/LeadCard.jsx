import { useState, useEffect } from "react";
import {
  Pause, Play, MessageSquare, ChevronDown, ChevronUp, Send, User, Bot,
  Clock, Edit3, Sparkles, Target, CheckCircle2, XCircle, Zap, X, Save,
} from "lucide-react";
import { Contatos, ChatMessages } from "../../lib/db";
import { Btn, Inp, Pulse, COLORS } from "../../pages/ClientPortal";

const CRM_STATUS = {
  novo:        { label: "Lead Novo",    color: "var(--color-cta)",     bg: "rgba(202,138,4,0.1)",   icon: Sparkles },
  contatado:   { label: "Conversando",  color: "#E3B341",              bg: "rgba(227,179,65,0.1)",  icon: MessageSquare },
  qualificado: { label: "Interessado",  color: "#8B5CF6",              bg: "rgba(139,92,246,0.1)",  icon: Target },
  convertido:  { label: "Agendado",     color: "var(--color-primary)", bg: "rgba(16,185,129,0.1)",  icon: CheckCircle2 },
  perdido:     { label: "Arquivado",    color: "#F85149",              bg: "rgba(248,81,73,0.1)",   icon: XCircle },
};

export function LeadCard({ lead, clientId }) {
  const [open,      setOpen]      = useState(false);
  const [msgs,      setMsgs]      = useState([]);
  const [draft,     setDraft]     = useState("");
  const [tab,       setTab]       = useState("conversa");
  const [editIA,    setEditIA]    = useState(false);
  const [iaNome,    setIaNome]    = useState(lead.ia_nome || "");
  const [editLead,  setEditLead]  = useState(false);
  const [leadForm,  setLeadForm]  = useState({ nome: lead.nome || "", telefone: lead.telefone || "" });

  const s       = CRM_STATUS[lead.crm_status || "novo"] || CRM_STATUS.novo;
  const ia      = lead.atendimento_ia === "ativo";
  const initials = lead.nome?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const color   = COLORS[lead.telefone?.length % COLORS.length] || COLORS[0];

  useEffect(() => {
    if (!open || tab !== "conversa") return;
    return ChatMessages.onList(clientId, lead.telefone, setMsgs);
  }, [open, tab, lead.telefone, clientId]);

  const toggleIA    = () => Contatos.setPause(clientId, lead.id, ia);
  const saveIANome  = async () => { await Contatos.updateCRM(clientId, lead.id, { ia_nome: iaNome }); setEditIA(false); };
  const sendMsg     = async () => { if (!draft.trim()) return; await ChatMessages.add(clientId, { telefone: lead.telefone, role: "user", content: draft }); setDraft(""); };
  const setStatus   = (status) => Contatos.updateCRM(clientId, lead.id, { crm_status: status });
  const saveLeadEdit = async () => {
    if (!leadForm.nome.trim()) return;
    await Contatos.updateCRM(clientId, lead.id, { nome: leadForm.nome, telefone: leadForm.telefone });
    setEditLead(false);
  };

  return (
    <div className={`group glass-card border rounded-[32px] overflow-hidden transition-all duration-500 ${open ? 'border-primary/40 ring-1 ring-primary/20 shadow-2xl' : 'hover:border-primary/20'}`}>
      {editLead && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-surface border border-border rounded-[32px] overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between bg-surface-up/20">
              <h4 className="text-base font-black text-main uppercase tracking-tight">Editar Lead</h4>
              <button onClick={() => setEditLead(false)} className="h-9 w-9 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-8 space-y-5">
              <Inp label="Nome *" value={leadForm.nome} onChange={v => setLeadForm(p => ({ ...p, nome: v }))} placeholder="Nome do lead" icon={User} />
              <Inp label="Telefone" value={leadForm.telefone} onChange={v => setLeadForm(p => ({ ...p, telefone: v }))} placeholder="+55 11 9 0000-0000" icon={Zap} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditLead(false)} className="flex-1 py-3 rounded-2xl bg-surface-up border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer">Cancelar</button>
                <Btn onClick={saveLeadEdit} className="flex-1" icon={Save}>Salvar</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 flex items-center gap-6 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-black text-base border shadow-inner transition-transform duration-500 group-hover:scale-105" style={{ backgroundColor: color + '15', color, borderColor: color + '30' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-black text-main truncate tracking-tight">{lead.nome || "Lead S/ Nome"}</h4>
          <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
            <Zap size={10} className="text-primary" />{lead.telefone}
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
          <button onClick={e => { e.stopPropagation(); setLeadForm({ nome: lead.nome || "", telefone: lead.telefone || "" }); setEditLead(true); }} className="h-10 w-10 rounded-xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-tertiary hover:text-primary transition-all">
            <Edit3 size={16} />
          </button>
          <button className="h-10 w-10 rounded-xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-tertiary hover:text-primary transition-all">
            {open ? <ChevronUp size={18} strokeWidth={3} /> : <ChevronDown size={18} strokeWidth={3} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border-subtle animate-fade-in bg-surface-up/10">
          <div className="p-5 flex flex-wrap items-center gap-4 border-b border-border-subtle bg-surface-up/20">
            <Btn variant={ia ? "danger" : "primary"} onClick={toggleIA} size="sm" icon={ia ? Pause : Play}>
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
                <button key={id} onClick={() => setStatus(id)} className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${lead.crm_status === id ? 'bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/10' : 'bg-surface-up/50 border-border-subtle text-tertiary hover:text-secondary hover:border-border'}`} title={m.label}>
                  <m.icon size={16} strokeWidth={2.5} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-8 mb-8 border-b border-border-subtle">
              {[['conversa', 'Fluxo de Diálogo'], ['notas', 'Notas Estratégicas']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 cursor-pointer ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}>
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
                  ) : msgs.map((m, i) => {
                    const isAI = m.role === "assistant";
                    return (
                      <div key={i} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-5 rounded-[28px] text-sm leading-relaxed shadow-xl ${isAI ? 'bg-surface border border-border-subtle rounded-bl-none' : 'bg-primary/10 border border-primary/20 text-main rounded-br-none ring-1 ring-primary/10'}`}>
                          <p className="font-medium">{m.content}</p>
                          <div className={`mt-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ${isAI ? '' : 'justify-end'}`}>
                            {isAI ? <Bot size={12} className="text-primary" /> : <User size={12} className="text-cta" />}
                            {isAI ? (lead.ia_nome || "SecretarIA") : "Cliente"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-6 bg-surface-up/50 border-t border-border-subtle flex gap-4">
                  <Inp value={draft} onChange={v => setDraft(v)} placeholder="Intervir no atendimento..." icon={User} />
                  <button onClick={sendMsg} className="h-[54px] w-[54px] shrink-0 rounded-2xl bg-primary text-black flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    <Send size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {tab === "notas" && (
              <div className="space-y-8 animate-fade-in">
                <Inp label="Contexto e Observações" value={lead.crm_notes || ""} onChange={v => Contatos.updateCRM(clientId, lead.id, { crm_notes: v })} placeholder="Descreva dores, objetivos e qualificações deste lead..." rows={8} />
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
