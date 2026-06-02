import { useState } from "react";
import { Smartphone, Plus, Edit2, X, User, Brain, ShieldCheck, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { PLAN_LIMITS } from "../../design-system/tokens";
import { PageTitle, Btn, Inp, Card, Pulse } from "../../components/shared/ClientUI";

export function WhatsAppView({ client, numbers }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({ nome_display: "", ia_nome: "", ia_funcao: "", waba_id: "", phone_number_id: "" });

  const limit  = PLAN_LIMITS[client.plan] || 1;
  const canAdd = numbers.length < limit;

  const save = async () => {
    if (!form.nome_display.trim() || !form.phone_number_id.trim()) return;
    setSaving(true);
    setTimeout(() => { setShowAdd(false); setSaving(false); }, 1000);
  };

  const startEdit = (num) => {
    setForm({ nome_display: num.nome_display || "", ia_nome: num.ia_nome || "", ia_funcao: num.ia_funcao || "", waba_id: num.waba_id || "", phone_number_id: num.phone_number_id || "" });
    setEditing(num.id);
    setShowAdd(true);
  };

  const openAdd = () => { setEditing(null); setForm({ nome_display: "", ia_nome: "", ia_funcao: "", waba_id: "", phone_number_id: "" }); setShowAdd(true); };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <PageTitle icon={Smartphone} title="WhatsApp Enterprise" subtitle={`Gestão de canais oficiais Cloud API. Cota do plano: ${limit} terminal.`} />
        <Btn onClick={openAdd} disabled={!canAdd} icon={Plus}>Novo Canal</Btn>
      </div>

      {!canAdd && (
        <div className="p-5 rounded-3xl bg-cta/10 border border-cta/20 flex items-center gap-4 animate-fade-in">
          <AlertCircle size={20} className="text-cta shrink-0" strokeWidth={2.5} />
          <p className="text-[10px] text-cta font-black uppercase tracking-[0.2em]">Cota Máxima Atingida. Realize upgrade para escalar sua operação.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {numbers.map(num => (
          <div key={num.id} className="bento-card group flex flex-col md:flex-row items-center gap-8 p-8 transition-all duration-500 cursor-pointer">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 w-full">
              <div className={`h-20 w-20 rounded-[28px] flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-105 ${num.status === 'ativo' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-up/50 text-tertiary border border-border-subtle'}`}>
                <Smartphone size={32} strokeWidth={1} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h4 className="text-xl font-black text-main tracking-tight uppercase">{num.nome_display}</h4>
                  <div className="flex items-center justify-center md:justify-start gap-3 px-3 py-1 rounded-full bg-surface-up/50 border border-border-subtle">
                    <Pulse status={num.status === "ativo" ? "online" : num.status === "pendente" ? "pendente" : "offline"} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{num.status}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2">Persona: <strong className="text-primary">{num.ia_nome || "PADRÃO"}</strong></span>
                  <span className="flex items-center gap-2">Terminal ID: <span className="text-secondary">{num.phone_number_id || "PENDENTE"}</span></span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => startEdit(num)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-up/80 border border-border-subtle text-tertiary hover:text-primary hover:border-primary/40 transition-all cursor-pointer"><Edit2 size={18} /></button>
                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"><X size={18} /></button>
              </div>
            </div>
          </div>
        ))}
        {numbers.length === 0 && (
          <div className="py-32 rounded-[48px] border border-dashed border-border-subtle flex flex-col items-center text-center opacity-30">
            <Smartphone size={80} strokeWidth={1} className="text-tertiary mb-6" />
            <h4 className="text-sm font-black text-secondary uppercase tracking-[0.3em]">Ambiente Desconectado</h4>
            <p className="text-xs text-tertiary mt-3">Sincronize seu Phone Number ID para ativar a IA.</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[200] flex items-center justify-center p-8">
          <Card className="w-full max-w-xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
            <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
              <h4 className="text-xl font-black text-main tracking-tighter uppercase">{editing ? "Refinar Canal" : "Novo Canal Enterprise"}</h4>
              <button onClick={() => setShowAdd(false)} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-10 space-y-8">
              <Inp label="Identificação da Operação *" value={form.nome_display} onChange={v => setForm(p => ({ ...p, nome_display: v }))} placeholder="Ex: Recepção Central" icon={Activity} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Inp label="Persona IA" value={form.ia_nome} onChange={v => setForm(p => ({ ...p, ia_nome: v }))} placeholder="Ex: Clara" icon={User} />
                <Inp label="Função IA" value={form.ia_funcao} onChange={v => setForm(p => ({ ...p, ia_funcao: v }))} placeholder="Ex: Concierge" icon={Brain} />
              </div>
              <Inp label="Phone Number ID *" value={form.phone_number_id} onChange={v => setForm(p => ({ ...p, phone_number_id: v }))} placeholder="ID Oficial da Meta" icon={ShieldCheck} />
              <div className="pt-6 flex gap-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
                <Btn disabled={saving || !form.nome_display || !form.phone_number_id} onClick={save} className="flex-1" icon={CheckCircle2}>
                  {saving ? "Processando..." : (editing ? "Salvar" : "Adicionar")}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
