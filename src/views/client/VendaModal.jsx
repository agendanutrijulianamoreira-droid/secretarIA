import { useState } from "react";
import { X, Search, DollarSign, CheckCircle2 } from "lucide-react";
import { Vendas } from "../../lib/db";
import { Btn, Inp, Card } from "../../pages/ClientPortal";

const PAGAMENTOS = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto", "Convênio"];

export function VendaModal({ clientId, servicos, onClose }) {
  const [f,      setF]      = useState({ paciente_nome: "", servico_id: "", servico_nome: "", valor: "", forma_pagamento: "PIX", observacoes: "", status: "confirmado" });
  const [saving, setSaving] = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const pickServico = (id) => {
    const s = servicos.find(s => s.id === id);
    setF(p => ({ ...p, servico_id: id, servico_nome: s?.nome || "", valor: s?.preco ? String(s.preco) : "" }));
  };

  const save = async () => {
    if (!f.paciente_nome.trim()) return;
    setSaving(true);
    try {
      await Vendas.create(clientId, { ...f, valor: Number(f.valor) || 0 });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
          <h4 className="text-xl font-black text-main tracking-tighter uppercase">Protocolar Recebimento</h4>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-10 space-y-8">
          <Inp label="Identificação do Paciente *" value={f.paciente_nome} onChange={up("paciente_nome")} placeholder="Nome completo" icon={Search} />
          <div className="space-y-3">
            <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Especificação do Serviço</label>
            <select value={f.servico_id} onChange={e => pickServico(e.target.value)} className="w-full px-6 py-4 bg-surface-up/20 border border-border-subtle rounded-2xl text-main text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300">
              <option value="">Item não catalogado...</option>
              {servicos.map(s => <option key={s.id} value={s.id} className="bg-surface">{s.nome} — R$ {Number(s.preco).toLocaleString("pt-BR")}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Inp label="Valor Final (R$)" value={f.valor} onChange={up("valor")} placeholder="0,00" icon={DollarSign} />
            <div className="space-y-3">
              <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Método de Liquidação</label>
              <select value={f.forma_pagamento} onChange={e => up("forma_pagamento")(e.target.value)} className="w-full px-6 py-4 bg-surface-up/20 border border-border-subtle rounded-2xl text-main text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300">
                {PAGAMENTOS.map(p => <option key={p} value={p} className="bg-surface">{p}</option>)}
              </select>
            </div>
          </div>
          <Inp label="Notas" value={f.observacoes} onChange={up("observacoes")} placeholder="Observações financeiras..." rows={3} />
          <div className="pt-6 flex gap-4">
            <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
            <Btn disabled={saving || !f.paciente_nome} onClick={save} className="flex-1" icon={DollarSign}>
              {saving ? "Processando..." : "Confirmar Receita"}
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
