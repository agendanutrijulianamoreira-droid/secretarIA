import { useState } from "react";
import { X, Users, Smartphone, MessageSquare, Calendar, CheckCircle2 } from "lucide-react";
import { Pacientes } from "../../lib/db";
import { Btn, Inp, Card } from "../../pages/ClientPortal";

export function PacienteModal({ clientId, initial, onClose }) {
  const [f,       setF]       = useState(initial || { nome: "", telefone: "", email: "", data_nascimento: "", observacoes: "" });
  const [saving,  setSaving]  = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.nome.trim() || !f.telefone.trim()) return;
    setSaving(true);
    try {
      if (f.id) await Pacientes.update(clientId, f.id, f);
      else      await Pacientes.create(clientId, f);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
          <div>
            <h4 className="text-xl font-black text-main tracking-tighter uppercase">{f.id ? "Editar Cadastro" : "Novo Cadastro"}</h4>
            <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1.5">Sincronização imediata com o cérebro da IA.</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-10 space-y-8">
          <Inp label="Nome Completo *" value={f.nome} onChange={up("nome")} placeholder="Ex: Dra. Maria Oliveira" icon={Users} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Inp label="WhatsApp Operacional *" value={f.telefone} onChange={up("telefone")} placeholder="+55..." icon={Smartphone} />
            <Inp label="E-mail de Contato" value={f.email} onChange={up("email")} placeholder="contato@exemplo.com" icon={MessageSquare} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Inp label="Data de Nascimento" value={f.data_nascimento} onChange={up("data_nascimento")} placeholder="DD/MM/AAAA" icon={Calendar} />
          </div>
          <Inp label="Observações" value={f.observacoes} onChange={up("observacoes")} placeholder="Objetivos, restrições, informações relevantes..." rows={5} />
          <div className="pt-6 flex gap-4">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
            <Btn disabled={saving || !f.nome || !f.telefone} onClick={save} className="flex-1" icon={CheckCircle2}>
              {saving ? "Processando..." : "Salvar Registro"}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
