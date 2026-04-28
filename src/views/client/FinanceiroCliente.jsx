import { useState } from "react";
import { Plus, X, Edit2, DollarSign, TrendingUp, Wallet, Download, Briefcase, ShoppingBag, PieChart, CreditCard, Clock } from "lucide-react";
import { Servicos, Vendas, Invoices } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill } from "../../pages/ClientPortal";

const PAGAMENTOS = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto", "Convênio"];

function ServicoModal({ clientId, initial, onClose }) {
  const [f, setF] = useState(initial || { nome: "", descricao: "", preco: "", duracao_minutos: "60" });
  const [saving, setSaving] = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.nome.trim()) return;
    setSaving(true);
    try {
      const data = { ...f, preco: Number(String(f.preco).replace(/\D/g, "")) / 100 || 0, duracao_minutos: Number(f.duracao_minutos) || 60 };
      if (f.id) await Servicos.update(clientId, f.id, data);
      else await Servicos.create(clientId, data);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface border border-border-subtle rounded-[32px] shadow-2xl overflow-hidden animate-zoom-in">
        <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between">
           <h4 className="text-lg font-black text-main tracking-tight">{f.id ? "Editar Serviço" : "Novo Serviço"}</h4>
           <button onClick={onClose} className="text-tertiary hover:text-main transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <Inp label="Nome do Serviço *" value={f.nome} onChange={up("nome")} placeholder="Ex: Consulta Nutricional" />
          <Inp label="O que inclui?" value={f.descricao} onChange={up("descricao")} placeholder="Breve descrição para a IA informar..." rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Valor Sugerido (R$)" value={f.preco} onChange={up("preco")} placeholder="0,00" />
            <Inp label="Duração (minutos)" value={f.duracao_minutos} onChange={up("duracao_minutos")} placeholder="60" />
          </div>
          
          <div className="pt-4 flex gap-3">
             <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest">Cancelar</button>
             <button onClick={save} disabled={saving || !f.nome} className="flex-1 py-4 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                {saving ? "Salvando..." : "Salvar Serviço"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VendaModal({ clientId, servicos, onClose }) {
  const [f, setF] = useState({ paciente_nome: "", servico_id: "", servico_nome: "", valor: "", forma_pagamento: "PIX", observacoes: "", status: "confirmado" });
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface border border-border-subtle rounded-[32px] shadow-2xl overflow-hidden animate-zoom-in">
        <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between">
           <h4 className="text-lg font-black text-main tracking-tight">Registrar Pagamento</h4>
           <button onClick={onClose} className="text-tertiary hover:text-main transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <Inp label="Paciente *" value={f.paciente_nome} onChange={up("paciente_nome")} placeholder="Nome do paciente" />
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-tertiary uppercase tracking-widest ml-1">Serviço Realizado</label>
            <select 
              value={f.servico_id} 
              onChange={e => pickServico(e.target.value)} 
              className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-2xl text-main text-sm outline-none focus:border-primary/50"
            >
              <option value="">Selecionar...</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} — R$ {Number(s.preco).toLocaleString("pt-BR")}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Inp label="Valor (R$)" value={f.valor} onChange={up("valor")} placeholder="0,00" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-tertiary uppercase tracking-widest ml-1">Método</label>
              <select 
                value={f.forma_pagamento} 
                onChange={e => up("forma_pagamento")(e.target.value)} 
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-2xl text-main text-sm outline-none focus:border-primary/50"
              >
                {PAGAMENTOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <Inp label="Notas" value={f.observacoes} onChange={up("observacoes")} placeholder="Observações..." rows={2} />
          
          <div className="pt-4 flex gap-3">
             <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest">Cancelar</button>
             <button onClick={save} disabled={saving || !f.paciente_nome} className="flex-1 py-4 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                {saving ? "Registrando..." : "Confirmar Recebimento"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinanceiroClienteView({ client, servicos, vendas, invoices }) {
  const [tab, setTab]         = useState("servicos");
  const [editServ, setEditServ] = useState(null);
  const [showVenda, setShowVenda] = useState(false);

  const totalVendas = vendas.filter(v => v.status === "confirmado").reduce((a, v) => a + (Number(v.valor) || 0), 0);
  const pendentes   = vendas.filter(v => v.status === "pendente").length;

  const exportCSV = () => {
    const csv = ["Data,Paciente,Serviço,Valor,Forma,Status"];
    vendas.forEach(v => csv.push(`"${new Date(v.created_at).toLocaleDateString()}","${v.paciente_nome}","${v.servico_nome || '—'}","${v.valor}","${v.forma_pagamento}","${v.status}"`));
    const blob = new Blob([csv.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${client.name}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const delServ = async (s) => {
    if (!confirm(`Remover serviço "${s.nome}"?`)) return;
    await Servicos.delete(client.id, s.id);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageTitle icon={Wallet} title="Gestão Financeira" subtitle="Controle de serviços, faturamento e vendas." />
        <div className="flex gap-3">
          <button onClick={exportCSV} className="h-12 w-12 rounded-2xl bg-surface-up border border-border-subtle flex items-center justify-center text-secondary hover:text-primary transition-all">
             <Download size={18} />
          </button>
          <button onClick={() => setShowVenda(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-up border border-border-subtle text-main font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all">
             <DollarSign size={14} className="text-primary" /> Venda
          </button>
          <button onClick={() => setEditServ({})} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
             <Plus size={14} /> Novo Serviço
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Receita Confirmada", value: `R$ ${totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Vendas Concluídas", value: vendas.filter(v => v.status === "confirmado").length, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
          { label: "Pacientes em Aberto", value: pendentes, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map(s => (
          <div key={s.label} className="p-8 rounded-[32px] bg-surface border border-border-subtle flex flex-col justify-between hover:border-primary/20 transition-all">
            <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
               <s.icon size={22} />
            </div>
            <div className="mt-8">
              <h4 className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 border-b border-border-subtle">
        {[["servicos", "Portfólio"], ["vendas", "Fluxo de Caixa"], ["plano", "Assinatura"]].map(([id, label]) => (
          <button 
            key={id} 
            onClick={() => setTab(id)}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === "servicos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicos.length === 0 && <EmptyState Icon={Briefcase} title="Nenhum serviço" subtitle='Cadastre seus atendimentos para a IA vender por você.' />}
            {servicos.map(s => (
              <div key={s.id} className="p-6 rounded-[32px] bg-surface border border-border-subtle flex items-center gap-6 group hover:border-primary/20 transition-all">
                <div className="h-12 w-12 rounded-2xl bg-surface-up border border-border-subtle flex items-center justify-center text-primary shadow-inner">
                   <Briefcase size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-main leading-tight">{s.nome}</h4>
                  <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">{s.duracao_minutos} min {s.descricao ? ` · ${s.descricao}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">R$ {Number(s.preco).toLocaleString("pt-BR")}</p>
                  <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditServ(s)} className="text-tertiary hover:text-primary"><Edit2 size={14} /></button>
                    <button onClick={() => delServ(s)} className="text-tertiary hover:text-red-500"><X size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "vendas" && (
          <div className="bg-surface border border-border-subtle rounded-[32px] overflow-hidden">
            {vendas.length === 0 ? (
              <EmptyState Icon={PieChart} title="Sem histórico" subtitle='Suas vendas aparecerão aqui após o registro.' />
            ) : (
              <div className="divide-y divide-border-subtle/50">
                {vendas.map(v => (
                  <div key={v.id} className="p-6 flex items-center gap-6 group hover:bg-surface-soft transition-colors">
                    <div className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-secondary">
                       <ShoppingCart size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-main">{v.paciente_nome}</p>
                      <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">{v.servico_nome || "Avulso"} · {v.forma_pagamento}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-main">R$ {Number(v.valor).toLocaleString("pt-BR")}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${v.status === 'confirmado' ? 'text-emerald-500' : 'text-amber-500'}`}>{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "plano" && (
          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Licença Ativa</p>
                 <h4 className="text-2xl font-black text-main tracking-tight">SecretarIA {client.plan}</h4>
              </div>
              <CreditCard size={32} className="text-primary opacity-40" />
            </div>
            
            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-tertiary uppercase tracking-widest px-2">Histórico de Cobrança</h5>
              {invoices.map((inv) => (
                <div key={inv.id} className="p-6 rounded-[24px] bg-surface border border-border-subtle flex items-center gap-6">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${inv.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                     {inv.status === "pago" ? <Check size={18} /> : <Clock size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-main">{inv.descricao}</p>
                    <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1">{inv.due_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-main">R$ {Number(inv.amount).toLocaleString("pt-BR")}</p>
                    {inv.status !== "pago" && (
                      <button onClick={() => inv.payment_link && window.open(inv.payment_link, "_blank")} className="text-[10px] font-black text-primary uppercase tracking-widest underline mt-1">Pagar Agora</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editServ !== null && <ServicoModal clientId={client.id} initial={editServ} onClose={() => setEditServ(null)} />}
      {showVenda && <VendaModal clientId={client.id} servicos={servicos} onClose={() => setShowVenda(false)} />}
    </div>
  );
}
