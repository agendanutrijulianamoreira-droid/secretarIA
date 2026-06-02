import { useState } from "react";
import { X, ShieldCheck, Activity, Clock, Users, Megaphone } from "lucide-react";
import { Campanhas } from "../../lib/db";
import { Btn, Inp, Card } from "../../pages/ClientPortal";

const CAMP_TIPOS = Campanhas.TIPOS;

export function CampanhaModal({ clientId, pacientes, onClose }) {
  const [f,      setF]      = useState({ tipo: "", titulo: "", mensagem: "", pacientes_alvo: "todos", agendada_para: "" });
  const [saving, setSaving] = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.tipo || !f.mensagem.trim()) return;
    setSaving(true);
    try {
      await Campanhas.create(clientId, { ...f, status: f.agendada_para ? "agendada" : "rascunho" });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-3xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20 max-h-[90vh] flex flex-col">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
          <div>
            <h4 className="text-xl font-black text-main tracking-tighter uppercase">Disparo de Inteligência</h4>
            <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
              <ShieldCheck size={12} className="text-primary" /> Regras de Anti-Ban e cadência humana ativadas.
            </p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <div>
            <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1 mb-5 block">Arquétipo da Campanha</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(CAMP_TIPOS).map(([id, m]) => (
                <button key={id} onClick={() => up("tipo")(id)} className={`p-5 rounded-2xl border transition-all duration-300 text-left group cursor-pointer ${f.tipo === id ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/10' : 'bg-surface-up/30 border-border-subtle hover:border-primary/20'}`}>
                  <div className={`text-[10px] font-black uppercase tracking-[0.1em] ${f.tipo === id ? 'text-primary' : 'text-tertiary group-hover:text-secondary'}`}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <Inp label="Identificador Interno" value={f.titulo} onChange={up("titulo")} placeholder="Ex: Lembrete de Retorno — Fluxo Automático" icon={Activity} />
          <div className="space-y-3">
            <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Conteúdo da Mensagem</label>
            <textarea value={f.mensagem} onChange={e => up("mensagem")(e.target.value)} placeholder="Olá {nome}! Como está sua evolução? Use {nome} para variáveis dinâmicas." rows={8} className="w-full p-6 bg-surface-up/20 border border-border-subtle rounded-[24px] text-main placeholder:text-tertiary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1 mb-5 block">Segmentação de Público</label>
              <div className="flex gap-3 p-1.5 bg-surface-up/50 rounded-2xl border border-border-subtle shadow-inner">
                {["todos", "selecionados"].map(op => (
                  <button key={op} onClick={() => up("pacientes_alvo")(op)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${f.pacientes_alvo === op ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-tertiary hover:text-secondary'}`}>
                    {op === "todos" ? `Base Geral (${pacientes.length})` : "Filtro Ativo"}
                  </button>
                ))}
              </div>
            </div>
            <Inp label="Agendamento Futuro" value={f.agendada_para} onChange={up("agendada_para")} placeholder="Ex: Amanhã às 09:00" icon={Clock} />
          </div>
        </div>

        <div className="p-10 border-t border-border-subtle bg-surface-up/30 flex gap-6">
          <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[11px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
          <Btn disabled={saving || !f.tipo || !f.mensagem} onClick={save} className="flex-1" icon={Megaphone}>
            {saving ? "Preparando Motores..." : "🚀 Lançar Campanha"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
