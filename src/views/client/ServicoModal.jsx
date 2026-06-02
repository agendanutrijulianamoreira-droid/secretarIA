import { useState } from "react";
import { X, Briefcase, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { Servicos } from "../../lib/db";
import { Btn, Inp, Card } from "../../pages/ClientPortal";

export function ServicoModal({ clientId, initial, onClose }) {
  const [f,      setF]      = useState(initial || { nome: "", descricao: "", preco: "", duracao_minutos: "60" });
  const [saving, setSaving] = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.nome.trim()) return;
    setSaving(true);
    try {
      const data = { ...f, preco: Number(String(f.preco).replace(/\D/g, "")) / 100 || 0, duracao_minutos: Number(f.duracao_minutos) || 60 };
      if (f.id) await Servicos.update(clientId, f.id, data);
      else      await Servicos.create(clientId, data);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
          <h4 className="text-xl font-black text-main tracking-tighter uppercase">{f.id ? "Ajustar Serviço" : "Novo Item de Portfólio"}</h4>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-10 space-y-8">
          <Inp label="Nomenclatura do Serviço *" value={f.nome} onChange={up("nome")} placeholder="Ex: Avaliação Bioimpedância" icon={Briefcase} />
          <Inp label="Escopo do Atendimento" value={f.descricao} onChange={up("descricao")} placeholder="Breve resumo para orientação da IA..." rows={3} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Inp label="Honorários Sugeridos (R$)" value={f.preco} onChange={up("preco")} placeholder="0,00" icon={DollarSign} />
            <Inp label="Tempo Estimado (min)" value={f.duracao_minutos} onChange={up("duracao_minutos")} placeholder="60" icon={Clock} />
          </div>
          <div className="pt-6 flex gap-4">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
            <Btn disabled={saving || !f.nome} onClick={save} className="flex-1" icon={CheckCircle2}>
              {saving ? "Processando..." : "Salvar Configuração"}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
