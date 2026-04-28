import { useState } from "react";
import { 
  Plus, X, Edit2, DollarSign, TrendingUp, Wallet, Download, 
  Briefcase, ShoppingBag, PieChart, CreditCard, Clock, 
  CheckCircle2, Activity, Zap, ShoppingCart, ArrowUpRight, Search
} from "lucide-react";
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
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
           <h4 className="text-xl font-black text-main tracking-tighter uppercase">Protocolar Recebimento</h4>
           <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-10 space-y-8">
          <Inp label="Identificação do Paciente *" value={f.paciente_nome} onChange={up("paciente_nome")} placeholder="Nome completo" icon={Search} />
          <div className="space-y-3">
            <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Específicação do Serviço</label>
            <select 
              value={f.servico_id} 
              onChange={e => pickServico(e.target.value)} 
              className="w-full px-6 py-4 bg-surface-up/20 border border-border-subtle rounded-2xl text-main text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300"
            >
              <option value="">Item não catalogado...</option>
              {servicos.map(s => <option key={s.id} value={s.id} className="bg-surface">{s.nome} — R$ {Number(s.preco).toLocaleString("pt-BR")}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Inp label="Valor Final (R$)" value={f.valor} onChange={up("valor")} placeholder="0,00" icon={DollarSign} />
            <div className="space-y-3">
              <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Método de Liquidação</label>
              <select 
                value={f.forma_pagamento} 
                onChange={e => up("forma_pagamento")(e.target.value)} 
                className="w-full px-6 py-4 bg-surface-up/20 border border-border-subtle rounded-2xl text-main text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300"
              >
                {PAGAMENTOS.map(p => <option key={p} value={p} className="bg-surface">{p}</option>)}
              </select>
            </div>
          </div>
          <Inp label="Memória de Cálculo / Notas" value={f.observacoes} onChange={up("observacoes")} placeholder="Observações financeiras..." rows={3} />
          
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
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <PageTitle icon={Wallet} title="Ecossistema Financeiro" subtitle="Monitoramento de receita, serviços e fluxo de ativos." />
        <div className="flex gap-4">
          <button onClick={exportCSV} className="h-[54px] w-[54px] rounded-2xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-tertiary hover:text-primary transition-all cursor-pointer">
             <Download size={20} strokeWidth={2.5} />
          </button>
          <button onClick={() => setShowVenda(true)} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-surface-up/50 border border-border-subtle text-main font-black text-[10px] uppercase tracking-[0.2em] hover:border-primary/40 hover:bg-surface-up transition-all cursor-pointer">
             <DollarSign size={16} className="text-primary" /> Registrar Venda
          </button>
          <Btn onClick={() => setEditServ({})} icon={Plus}>Novo Serviço</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Receita Consolidada", value: `R$ ${totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Transações Liquidadas", value: vendas.filter(v => v.status === "confirmado").length, icon: ShoppingCart, color: "text-primary", bg: "bg-primary/10" },
          { label: "Fluxo em Aberto", value: pendentes, icon: Clock, color: "text-cta", bg: "bg-cta/10" },
        ].map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10">
              <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-border-subtle shadow-inner group-hover:scale-110 transition-transform duration-500 mb-8`}>
                 <s.icon size={24} strokeWidth={2.5} />
              </div>
              <h4 className={`text-4xl font-black tracking-tighter ${s.color}`}>{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-3">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-10 border-b border-border-subtle">
        {[["servicos", "Portfólio de Atendimentos"], ["vendas", "Fluxo de Caixa Operacional"], ["plano", "Assinatura & Licenciamento"]].map(([id, label]) => (
          <button 
            key={id} 
            onClick={() => setTab(id)}
            className={`pb-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-2 cursor-pointer ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {tab === "servicos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {servicos.length === 0 && (
              <div className="lg:col-span-2 py-32 text-center border border-dashed border-border-subtle rounded-[48px] opacity-30">
                 <Briefcase size={80} strokeWidth={1} className="mx-auto mb-6 text-tertiary" />
                 <p className="text-sm font-black uppercase tracking-[0.3em]">Portfólio em Branco</p>
              </div>
            )}
            {servicos.map(s => (
              <div key={s.id} className="bento-card group p-8 flex items-center gap-8 transition-all duration-500 cursor-pointer">
                <div className="premium-glow" />
                <div className="relative z-10 flex-1 flex items-center gap-8">
                  <div className="h-16 w-16 rounded-[22px] bg-surface-up/50 border border-border-subtle flex items-center justify-center text-primary shadow-inner group-hover:scale-105 transition-transform duration-500">
                     <Briefcase size={28} strokeWidth={1} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-main leading-tight tracking-tight uppercase">{s.nome}</h4>
                    <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-2.5 flex items-center gap-3">
                      <Clock size={12} className="text-primary" /> {s.duracao_minutos} MINUTOS
                      {s.descricao && <span className="opacity-30">•</span>}
                      {s.descricao && <span className="truncate max-w-[150px]">{s.descricao}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary tracking-tighter">R$ {Number(s.preco).toLocaleString("pt-BR")}</p>
                    <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => setEditServ(s)} className="h-10 w-10 rounded-xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary transition-all cursor-pointer flex items-center justify-center"><Edit2 size={16} /></button>
                      <button onClick={() => delServ(s)} className="h-10 w-10 rounded-xl bg-red-500/5 border border-red-500/10 text-tertiary hover:text-red-500 transition-all cursor-pointer flex items-center justify-center"><X size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "vendas" && (
          <div className="bento-card p-0 overflow-hidden">
            {vendas.length === 0 ? (
              <div className="py-32 text-center opacity-30 flex flex-col items-center">
                 <Activity size={80} strokeWidth={1} className="mb-6" />
                 <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhuma transação protocolada</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {vendas.map(v => (
                  <div key={v.id} className="p-8 flex items-center gap-8 group hover:bg-surface-up/30 transition-all cursor-pointer">
                    <div className="h-14 w-14 rounded-2xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-secondary shadow-inner group-hover:scale-105 transition-transform duration-500">
                       <ShoppingCart size={22} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-main uppercase tracking-tight">{v.paciente_nome}</p>
                      <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-3">
                        <span className="text-primary">{v.servico_nome || "ITEM AVULSO"}</span>
                        <span className="opacity-30">•</span>
                        <span>{v.forma_pagamento}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-main tracking-tighter">R$ {Number(v.valor).toLocaleString("pt-BR")}</p>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1.5 inline-block ${v.status === 'confirmado' ? 'text-emerald-500' : 'text-amber-500'}`}>{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "plano" && (
          <div className="space-y-10 animate-fade-in">
            <div className="bento-card bg-primary/5 border-primary/20 p-12 flex items-center justify-between group">
              <div className="premium-glow" />
              <div className="relative z-10">
                 <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                   <ShieldCheck size={14} /> Licença de Uso Vitalícia
                 </p>
                 <h4 className="text-5xl font-black text-main tracking-tighter uppercase">SecretarIA {client.plan}</h4>
                 <div className="mt-6 flex items-center gap-3 text-secondary font-medium">
                    <CheckCircle2 size={18} className="text-primary" /> 
                    <span>Todos os módulos operantes e integrados.</span>
                 </div>
              </div>
              <div className="relative z-10 h-32 w-32 rounded-[40px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/10 group-hover:rotate-12 transition-all duration-700">
                 <CreditCard size={64} strokeWidth={1} />
              </div>
            </div>
            
            <div className="space-y-6">
              <h5 className="text-[11px] font-black text-tertiary uppercase tracking-[0.3em] px-4 flex items-center gap-3">
                <Activity size={16} className="text-primary" /> Histórico de Licenciamento
              </h5>
              <div className="bento-card p-0 overflow-hidden divide-y divide-border-subtle">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-8 flex items-center gap-8 group hover:bg-surface-up/30 transition-all cursor-pointer">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${inv.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/5 text-red-500 border border-red-500/10'}`}>
                       {inv.status === "pago" ? <CheckCircle2 size={24} /> : <Zap size={24} className="animate-pulse" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-main uppercase tracking-tight">{inv.descricao}</p>
                      <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-2">{inv.due_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-main tracking-tighter">R$ {Number(inv.amount).toLocaleString("pt-BR")}</p>
                      {inv.status !== "pago" && (
                        <button onClick={() => inv.payment_link && window.open(inv.payment_link, "_blank")} className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-3 hover:text-emerald-500 transition-colors group/pay">
                          Liquidat agora <ArrowUpRight size={14} className="group-hover/pay:translate-x-0.5 group-hover/pay:-translate-y-0.5 transition-transform" />
                        </button>
                      )}
                      {inv.status === "pago" && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 inline-block">Liquidado</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {editServ !== null && <ServicoModal clientId={client.id} initial={editServ} onClose={() => setEditServ(null)} />}
      {showVenda && <VendaModal clientId={client.id} servicos={servicos} onClose={() => setShowVenda(false)} />}
    </div>
  );
}
