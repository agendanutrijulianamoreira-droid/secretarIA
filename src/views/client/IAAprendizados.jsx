import { useState } from "react";
import { CheckCircle, XCircle, Edit2, X, Brain, Check, MessageCircle, AlertTriangle, ShieldCheck, PenTool, History } from "lucide-react";
import { IAAprendizados } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill } from "../../pages/ClientPortal";

const STATUS_COLORS = {
  pendente:  { color: "text-amber-500",  bg: "bg-amber-500/10",  label: "Revisão" },
  aprovado:  { color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Arquivado" },
  rejeitado: { color: "text-red-500",     bg: "bg-red-500/10",     label: "Ignorado" },
};

const TIPO_META = {
  conversa: { label: "Diálogo", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  correcao: { label: "Correção", icon: PenTool, color: "text-amber-500", bg: "bg-amber-500/10" },
  manual:   { label: "Diretriz", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
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
    <div className="space-y-10 animate-fade-in">
      <PageTitle icon={Brain} title="Cérebro da IA" subtitle="Refine o conhecimento e as regras de atendimento da sua IA." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            {pendentes > 0 && (
              <div className="p-6 rounded-[32px] bg-amber-500/5 border border-amber-500/20 flex items-center gap-6">
                <div className="h-14 w-14 rounded-[22px] bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                   <AlertTriangle size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-600 uppercase tracking-widest">{pendentes} novos aprendizados</h4>
                  <p className="text-xs text-amber-700/60 font-medium mt-1">Sua IA extraiu informações de conversas recentes. Revise para oficializar o conhecimento.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {["todos", "pendente", "aprovado", "rejeitado"].map(f => {
                const count = f === "todos" ? aprendizados.length : aprendizados.filter(a => a.status === f).length;
                const sc = STATUS_COLORS[f] || { color: "text-tertiary", bg: "bg-surface-up" };
                return (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filter === f ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border-subtle text-secondary hover:border-primary/30'}`}
                  >
                    {f === "todos" ? `Total (${count})` : `${sc.label} (${count})`}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {filtered.length === 0 ? (
                <EmptyState icon="🧠" title="Tudo revisado" subtitle="Aguardando novas interações para extrair insights." />
              ) : (
                filtered.map(a => {
                  const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pendente;
                  const meta = TIPO_META[a.tipo] || TIPO_META.conversa;
                  const isEditing = editId === a.id;

                  return (
                    <div key={a.id} className={`p-8 rounded-[36px] bg-surface border transition-all duration-300 ${a.status === 'pendente' ? 'border-primary/20 shadow-xl shadow-primary/5' : 'border-border-subtle opacity-80 hover:opacity-100'}`}>
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center border ${meta.bg.replace('/10', '/20')}`}>
                                 <meta.icon size={18} />
                              </div>
                              <div>
                                 <h5 className="text-xs font-black text-main uppercase tracking-widest">{meta.label}</h5>
                                 <p className="text-[9px] text-tertiary font-black uppercase tracking-widest mt-0.5">{a.created_at?.toDate?.()?.toLocaleDateString() || "Hoje"}</p>
                              </div>
                           </div>
                           <div className={`px-4 py-1.5 rounded-full ${sc.bg} ${sc.color} text-[9px] font-black uppercase tracking-widest border ${sc.bg.replace('/10', '/20')}`}>
                              {sc.label}
                           </div>
                        </div>

                        {a.resumo && (
                          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-soft/50 border border-border-subtle">
                             <span className="text-[9px] font-black text-tertiary uppercase tracking-widest shrink-0">Contexto:</span>
                             <p className="text-xs text-secondary font-medium truncate">{a.resumo}</p>
                          </div>
                        )}

                        {isEditing ? (
                          <div className="space-y-4">
                            <textarea 
                              value={editText} 
                              onChange={e => setEditText(e.target.value)} 
                              rows={4} 
                              className="w-full p-6 rounded-[28px] bg-surface-up border border-primary/30 text-main text-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all italic"
                            />
                            <div className="flex gap-3">
                               <button onClick={() => setEditId(null)} className="flex-1 py-3 rounded-xl bg-surface-up text-secondary text-[10px] font-black uppercase">Cancelar</button>
                               <button onClick={() => salvarCorrecao(a.id)} className="flex-1 py-3 rounded-xl bg-primary text-black text-[10px] font-black uppercase shadow-lg shadow-primary/20">Salvar Verbo</button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 rounded-[28px] bg-surface-up/50 border border-border-subtle border-dashed relative">
                             <p className="text-sm text-main font-medium leading-relaxed italic opacity-80">"{a.aprendizado}"</p>
                             {a.corrigido && (
                               <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg">
                                  <Edit2 size={12} />
                               </div>
                             )}
                          </div>
                        )}

                        {!isEditing && a.status === "pendente" && (
                          <div className="flex gap-2">
                             <button onClick={() => aprovar(a.id)} className="flex-1 py-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                <Check size={14} /> Incorporar
                             </button>
                             <button onClick={() => { setEditId(a.id); setEditText(a.aprendizado); }} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary text-[10px] font-black uppercase tracking-widest hover:border-primary/20 transition-all flex items-center justify-center gap-2">
                                <Edit2 size={14} /> Corrigir
                             </button>
                             <button onClick={() => rejeitar(a.id)} className="h-14 w-14 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                <X size={18} />
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

         <div className="space-y-6">
            <Card className="p-8 space-y-6 border-primary/20 bg-primary/5">
               <div className="h-16 w-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <ShieldCheck size={32} />
               </div>
               <div>
                  <h4 className="text-lg font-black text-main leading-tight">Segurança de Dados</h4>
                  <p className="text-xs text-secondary font-medium mt-2 leading-relaxed">Sua IA segue diretrizes rígidas. Ela está programada para <span className="text-primary font-bold">nunca passar orçamentos</span> sem confirmação humana.</p>
               </div>
               <div className="pt-4 border-t border-border-subtle">
                  <div className="flex items-center justify-between text-[10px] font-black text-tertiary uppercase tracking-widest">
                     <span>Filtro de Preço</span>
                     <span className="text-emerald-500">Ativado</span>
                  </div>
               </div>
            </Card>

            <div className="p-8 rounded-[32px] bg-surface border border-border-subtle space-y-6">
               <div className="flex items-center gap-3">
                  <History size={18} className="text-primary" />
                  <h4 className="text-sm font-black text-main uppercase tracking-widest">Evolução da IA</h4>
               </div>
               <div className="space-y-4">
                  {[
                    { label: "Acurácia Média", value: "98.2%" },
                    { label: "Knowledge Base", value: `${aprendizados.length} items` },
                    { label: "Auto-Correções", value: "14" },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                       <span className="text-xs text-tertiary font-medium">{stat.label}</span>
                       <span className="text-xs font-black text-main">{stat.value}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
