import { useState } from "react";
import { Bot, Plus, Edit2, X, User, Brain, Smartphone, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { PLAN_LIMITS } from "../../design-system/tokens";
import { PageTitle, Btn, Inp, Card, Pulse } from "../../components/shared/ClientUI";
import { WhatsAppNumbers } from "../../lib/db";

const FUNCOES = ["Agendamentos", "Atendimento geral", "FAQ / Dúvidas", "Vendas / Captação", "Suporte", "Recepção"];

function AgentForm({ editing, form, upd, saving, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[200] flex items-center justify-center p-8">
      <Card className="w-full max-w-xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
          <h4 className="text-xl font-black text-main tracking-tighter uppercase">{editing ? "Editar Agente" : "Novo Agente"}</h4>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-10 space-y-6">
          <Inp label="Nome do agente *" value={form.nome_display} onChange={upd('nome_display')} placeholder="Ex: Recepção, Vendas VIP, Suporte..." icon={Bot} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Inp label="Nome da IA" value={form.ia_nome} onChange={upd('ia_nome')} placeholder="Ex: Ana, Clara, Sofia..." icon={User} />
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Função</label>
              <div className="flex flex-wrap gap-2">
                {FUNCOES.map(f => (
                  <button key={f} onClick={() => upd('ia_funcao')(f)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${form.ia_funcao === f ? 'bg-primary text-black border-primary' : 'bg-surface-up/30 border-border-subtle text-secondary hover:border-primary/40'}`}>
                    {f}
                  </button>
                ))}
              </div>
              <Inp value={form.ia_funcao} onChange={upd('ia_funcao')} placeholder="Ou digite uma função personalizada..." icon={Brain} />
            </div>
          </div>
          <Inp label="Número de telefone vinculado" value={form.numero} onChange={upd('numero')} placeholder="+55 11 9 0000-0000" icon={Smartphone} />
          <Inp label="Phone Number ID (Meta — opcional)" value={form.phone_number_id} onChange={upd('phone_number_id')} placeholder="ID Oficial da Meta" icon={CheckCircle2} />
          <div className="pt-4 flex gap-4">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
            <Btn disabled={saving || !form.nome_display.trim()} onClick={onSave} className="flex-1" icon={CheckCircle2}>
              {saving ? "Salvando..." : (editing ? "Salvar" : "Criar Agente")}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}

const EMPTY = { nome_display: "", ia_nome: "", ia_funcao: "", numero: "", phone_number_id: "" };

export function WhatsAppView({ client, numbers, reload }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState(EMPTY);

  const limit  = PLAN_LIMITS[client.plan] || 1;
  const canAdd = numbers.length < limit;
  const upd    = k => v => setForm(p => ({ ...p, [k]: v }));

  const openAdd   = () => { setEditing(null); setForm(EMPTY); setShowAdd(true); };
  const startEdit = num => { setForm({ nome_display: num.nome_display || "", ia_nome: num.ia_nome || "", ia_funcao: num.ia_funcao || "", numero: num.numero || "", phone_number_id: num.phone_number_id || "" }); setEditing(num.id); setShowAdd(true); };

  const save = async () => {
    if (!form.nome_display.trim()) return;
    setSaving(true);
    try {
      if (editing) await WhatsAppNumbers.update(client.id, editing, form);
      else         await WhatsAppNumbers.add(client.id, { ...form, status: "pendente" });
      reload?.();
      setShowAdd(false);
    } catch (e) { alert("Erro ao salvar agente: " + e.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm("Remover este agente?")) return;
    try { await WhatsAppNumbers.delete(client.id, id); reload?.(); }
    catch (e) { alert("Erro: " + e.message); }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <PageTitle icon={Bot} title="Agentes IA" subtitle={`Crie e configure os agentes de atendimento. Cota do plano: ${numbers.length}/${limit}`} />
        <Btn onClick={openAdd} disabled={!canAdd} icon={Plus}>Novo Agente</Btn>
      </div>

      {!canAdd && (
        <div className="p-5 rounded-3xl bg-cta/10 border border-cta/20 flex items-center gap-4 animate-fade-in">
          <AlertCircle size={20} className="text-cta shrink-0" strokeWidth={2.5} />
          <p className="text-[10px] text-cta font-black uppercase tracking-[0.2em]">Cota máxima atingida. Faça upgrade para adicionar mais agentes.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {numbers.map(num => (
          <div key={num.id} className="bento-card group flex flex-col md:flex-row items-center gap-8 p-8 transition-all duration-500">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
              <div className={`h-20 w-20 rounded-[28px] flex items-center justify-center shadow-inner border ${num.status === 'ativo' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-up/50 text-tertiary border-border-subtle'}`}>
                <Bot size={32} strokeWidth={1} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h4 className="text-xl font-black text-main tracking-tight uppercase">{num.nome_display}</h4>
                  <div className="flex items-center gap-3 px-3 py-1 rounded-full bg-surface-up/50 border border-border-subtle">
                    <Pulse status={num.status === "ativo" ? "online" : num.status === "pendente" ? "pendente" : "offline"} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{num.status}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">
                  {num.ia_nome    && <span>Persona: <strong className="text-primary">{num.ia_nome}</strong></span>}
                  {num.ia_funcao  && <span>Função: <strong className="text-secondary">{num.ia_funcao}</strong></span>}
                  {num.numero     && <span className="flex items-center gap-2"><Smartphone size={10} />{num.numero}</span>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(num)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-up/80 border border-border-subtle text-tertiary hover:text-primary hover:border-primary/40 transition-all cursor-pointer"><Edit2 size={18} /></button>
                <button onClick={() => remove(num.id)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
        {numbers.length === 0 && (
          <div className="py-32 rounded-[48px] border border-dashed border-border-subtle flex flex-col items-center text-center opacity-40">
            <Bot size={80} strokeWidth={1} className="text-tertiary mb-6" />
            <h4 className="text-sm font-black text-secondary uppercase tracking-[0.3em]">Nenhum Agente Configurado</h4>
            <p className="text-xs text-tertiary mt-3">Crie seu primeiro agente de atendimento.</p>
          </div>
        )}
      </div>

      {showAdd && <AgentForm editing={editing} form={form} upd={upd} saving={saving} onSave={save} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
