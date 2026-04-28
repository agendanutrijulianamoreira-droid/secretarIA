import { useState } from "react";
import { 
  CheckCircle, XCircle, Edit2, X, Brain, Check, MessageCircle, 
  AlertTriangle, ShieldCheck, PenTool, History, CheckCircle2,
  Sparkles, Activity, Zap, Search, ActivitySquare
} from "lucide-react";
import { IAAprendizados } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill } from "../../pages/ClientPortal";

const STATUS_COLORS = {
  pendente:  { color: "text-amber-500",  bg: "bg-amber-500/10",  label: "Em Revisão" },
  aprovado:  { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Arquivado" },
  rejeitado: { color: "text-red-500",     bg: "bg-red-500/10",     label: "Ignorado" },
};

const TIPO_META = {
  conversa: { label: "Diálogo", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  correcao: { label: "Ajuste", icon: PenTool, color: "text-amber-500", bg: "bg-amber-500/10" },
  manual:   { label: "Diretriz", icon: ShieldCheck, color: "text-cta", bg: "bg-cta/10" },
};

export default function IAAprendizadosView({ client, aprendizados }) {
  const [filter, setFilter] = useState("pendente");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const filtered = aprendizados.filter(a => filter === "todos" || a.status === filter);
  const pendentes = aprendizados.filter(a => a.status === "pendente").length;

  const aprovar = async (id) => { await IAAprendizados.aprovar(client.id, id); };
  const rejeitar = async (id) => { await IAAprendizados.rejeitar(client.id, id); };
  const salvarCorrecao = async (id) => {
    await IAAprendizados.corrigir(client.id, id, editText);
    setEditId(null);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={Brain} title="Cérebro da IA" subtitle="Refine o conhecimento e as regras de atendimento da sua SecretarIA." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            {pendentes > 0 && (
              <div className="bento-card bg-amber-500/5 border-amber-500/20 flex items-center gap-8 p-10 ring-1 ring-amber-500/10">
                <div className="h-20 w-20 rounded-[28px] bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                   <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-black text-amber-600 uppercase tracking-[0.2em]">{pendentes} novos aprendizados</h4>
                  <p className="text-xs text-amber-700/70 font-medium mt-2 leading-relaxed">Sua IA processou conversas recentes e extraiu novos insights. Revise-os para oficializar o conhecimento operacional.</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {["todos", "pendente", "aprovado", "rejeitado"].map(f => {
                const count = f === "todos" ? aprendizados.length : aprendizados.filter(a => a.status === f).length;
                const sc = STATUS_COLORS[f] || { color: "text-tertiary", bg: "bg-surface-up/30" };
                return (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border cursor-pointer ${filter === f ? 'bg-primary text-black border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40 hover:bg-surface-up'}`}
                  >
                    {f === "todos" ? `Base Completa (${count})` : `${sc.label} (${count})`}
                  </button>
                );
              })}
            </div>

            <div className="space-y-6">
              {filtered.length === 0 ? (
                <div className="py-32 text-center border border-dashed border-border-subtle rounded-[48px] opacity-30 flex flex-col items-center">
                   <ShieldCheck size={80} strokeWidth={1} className="mb-6 text-tertiary" />
                   <p className="text-sm font-black uppercase tracking-[0.3em]">Ambiente de Conhecimento Limpo</p>
                </div>
              ) : (
                filtered.map(a => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pendente;
                  const meta = TIPO_META[a.tipo] || TIPO_META.conversa;
                  const isEditing = editId === a.id;

                  return (
                    <div key={a.id} className={`bento-card group p-0 overflow-hidden transition-all duration-500 ${a.status === 'pendente' ? 'border-primary/30 ring-1 ring-primary/10' : 'opacity-80'}`}>
                      <div className="premium-glow" />
                      <div className="relative z-10 p-10 flex flex-col gap-8">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 rounded-2xl ${meta.bg} ${meta.color} flex items-center justify-center border border-border-subtle shadow-inner group-hover:scale-110 transition-transform`}>
                                 <meta.icon size={20} strokeWidth={2.5} />
                              </div>
                              <div>
                                 <h5 className="text-[10px] font-black text-main uppercase tracking-[0.2em]">{meta.label}</h5>
                                 <p className="text-[9px] text-tertiary font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                   <Clock size={10} />
                                   {a.created_at?.toDate?.()?.toLocaleDateString() || "HOJE"}
                                 </p>
                              </div>
                           </div>
                           <div className={`px-5 py-2 rounded-full ${sc.bg} ${sc.color} text-[9px] font-black uppercase tracking-[0.2em] border border-border-subtle shadow-sm`}>
                              {sc.label}
                           </div>
                        </div>

                        {a.resumo && (
                          <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-surface-up/30 border border-border-subtle">
                             <div className="h-2 w-2 rounded-full bg-primary/40" />
                             <p className="text-xs text-secondary font-medium italic opacity-70 truncate flex-1">{a.resumo}</p>
                          </div>
                        )}

                        {isEditing ? (
                          <div className="space-y-6">
                            <textarea 
                              value={editText} 
                              onChange={e => setEditText(e.target.value)} 
                              rows={5} 
                              className="w-full p-8 rounded-[32px] bg-surface-up/50 border border-primary/40 text-main text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all italic leading-relaxed shadow-inner"
                            />
                            <div className="flex gap-4">
                               <button onClick={() => setEditId(null)} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-widest hover:bg-surface transition-all cursor-pointer">Cancelar</button>
                               <Btn onClick={() => salvarCorrecao(a.id)} className="flex-1" icon={CheckCircle2}>Validar Conhecimento</Btn>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 rounded-[32px] bg-surface-up/20 border border-border-subtle border-dashed relative group/box">
                             <p className="text-base text-main font-medium leading-relaxed italic opacity-90">"{a.aprendizado}"</p>
                             {a.corrigido && (
                               <div className="absolute -top-4 -right-4 h-10 w-10 rounded-2xl bg-primary text-black flex items-center justify-center shadow-2xl shadow-primary/40 ring-4 ring-background">
                                  <Edit2 size={16} strokeWidth={3} />
                               </div>
                             )}
                          </div>
                        )}

                        {!isEditing && a.status === "pendente" && (
                          <div className="flex gap-4">
                             <button onClick={() => aprovar(a.id)} className="flex-[2] py-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-emerald-500/5">
                                <Check size={16} strokeWidth={3} /> Incorporar ao Cérebro
                             </button>
                             <button onClick={() => { setEditId(a.id); setEditText(a.aprendizado); }} className="flex-1 py-5 rounded-2xl bg-surface-up/80 border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-3 cursor-pointer">
                                <Edit2 size={14} /> Refinar
                             </button>
                             <button onClick={() => rejeitar(a.id)} className="h-[60px] w-[60px] rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer">
                                <X size={20} strokeWidth={3} />
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
         </div>

         <div className="space-y-8">
            <Card className="p-10 space-y-8 border-primary/20 bg-primary/5 group">
               <div className="premium-glow" />
               <div className="h-20 w-20 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={40} strokeWidth={1} />
               </div>
               <div>
                  <h4 className="text-xl font-black text-main leading-tight tracking-tight uppercase">Protocolos de Segurança</h4>
                  <p className="text-xs text-secondary font-medium mt-4 leading-relaxed italic opacity-80">"Minha IA opera sob diretrizes éticas e clínicas. Ela nunca processa transações ou orçamentos sem minha validação explícita."</p>
               </div>
               <div className="pt-8 border-t border-border-subtle">
                  <div className="flex items-center justify-between text-[10px] font-black text-tertiary uppercase tracking-[0.3em]">
                     <span className="flex items-center gap-2"><CheckCircle size={12} className="text-primary" /> Filtro Orçamentário</span>
                     <span className="text-primary">Blindado</span>
                  </div>
               </div>
            </Card>

            <div className="bento-card p-10 space-y-10 group">
               <div className="flex items-center gap-4">
                  <Activity size={20} className="text-primary" />
                  <h4 className="text-sm font-black text-main uppercase tracking-[0.3em]">Métricas de Evolução</h4>
               </div>
               <div className="space-y-6">
                  {[
                    { label: "Acurácia de Diálogo", value: "98.2%", icon: Sparkles },
                    { label: "Base de Conhecimento", value: `${aprendizados.length} itens`, icon: Brain },
                    { label: "Refinamentos Manuais", value: "14", icon: History },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between group/item">
                       <span className="text-[11px] text-tertiary font-bold flex items-center gap-3 uppercase tracking-widest">
                         <stat.icon size={14} className="group-hover/item:text-primary transition-colors" />
                         {stat.label}
                       </span>
                       <span className="text-sm font-black text-main tracking-tighter">{stat.value}</span>
                    </div>
                  ))}
               </div>
               <div className="pt-6">
                  <div className="h-2 w-full bg-surface-up rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[98%] shadow-lg shadow-primary/50 animate-pulse" />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
