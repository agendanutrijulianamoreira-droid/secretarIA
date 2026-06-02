import { useState } from "react";
import { Plus, Download, DollarSign, TrendingUp, ShoppingCart, Clock, Briefcase, Edit2, X, CheckCircle2, Zap, CreditCard, ArrowUpRight, Activity, ShieldCheck } from "lucide-react";
import { Servicos } from "../../lib/db";
import { Btn, PageTitle } from "../../pages/ClientPortal";
import { ServicoModal } from "./ServicoModal";
import { VendaModal } from "./VendaModal";

export default function FinanceiroClienteView({ client, servicos, vendas, invoices }) {
  const [tab,       setTab]       = useState("servicos");
  const [editServ,  setEditServ]  = useState(null);
  const [showVenda, setShowVenda] = useState(false);

  const totalVendas = vendas.filter(v => v.status === "confirmado").reduce((a, v) => a + (Number(v.valor) || 0), 0);
  const pendentes   = vendas.filter(v => v.status === "pendente").length;

  const exportCSV = () => {
    const rows = ["Data,Paciente,Serviço,Valor,Forma,Status", ...vendas.map(v => `"${new Date(v.created_at).toLocaleDateString()}","${v.paciente_nome}","${v.servico_nome || '—'}","${v.valor}","${v.forma_pagamento}","${v.status}"`)];
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([rows.join("\n")], { type: 'text/csv' })), download: `financeiro-${client.name}-${new Date().toISOString().slice(0,10)}.csv` });
    a.click();
  };

  const delServ = async (s) => {
    if (!confirm(`Remover serviço "${s.nome}"?`)) return;
    await Servicos.delete(client.id, s.id);
  };

  const resumo = [
    { label: "Receita Consolidada", value: `R$ ${totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Transações Liquidadas", value: vendas.filter(v => v.status === "confirmado").length, icon: ShoppingCart, color: "text-primary", bg: "bg-primary/10" },
    { label: "Fluxo em Aberto", value: pendentes, icon: Clock, color: "text-cta", bg: "bg-cta/10" },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <PageTitle icon={DollarSign} title="Ecossistema Financeiro" subtitle="Monitoramento de receita, serviços e fluxo de ativos." />
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
        {resumo.map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10">
              <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-border-subtle shadow-inner group-hover:scale-110 transition-transform duration-500 mb-8`}><s.icon size={24} strokeWidth={2.5} /></div>
              <h4 className={`text-4xl font-black tracking-tighter ${s.color}`}>{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-3">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-10 border-b border-border-subtle">
        {[["servicos", "Portfólio de Atendimentos"], ["vendas", "Fluxo de Caixa Operacional"], ["plano", "Assinatura & Licenciamento"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`pb-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-2 cursor-pointer ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "servicos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {servicos.length === 0 && <div className="lg:col-span-2 py-32 text-center border border-dashed border-border-subtle rounded-[48px] opacity-30"><Briefcase size={80} strokeWidth={1} className="mx-auto mb-6 text-tertiary" /><p className="text-sm font-black uppercase tracking-[0.3em]">Portfólio em Branco</p></div>}
          {servicos.map(s => (
            <div key={s.id} className="bento-card group p-8 flex items-center gap-8 transition-all duration-500 cursor-pointer">
              <div className="premium-glow" />
              <div className="relative z-10 flex-1 flex items-center gap-8">
                <div className="h-16 w-16 rounded-[22px] bg-surface-up/50 border border-border-subtle flex items-center justify-center text-primary shadow-inner group-hover:scale-105 transition-transform duration-500"><Briefcase size={28} strokeWidth={1} /></div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-main leading-tight tracking-tight uppercase">{s.nome}</h4>
                  <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-2.5 flex items-center gap-3"><Clock size={12} className="text-primary" /> {s.duracao_minutos} MINUTOS{s.descricao && <><span className="opacity-30">•</span><span className="truncate max-w-[150px]">{s.descricao}</span></>}</p>
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
            <div className="py-32 text-center opacity-30 flex flex-col items-center"><Activity size={80} strokeWidth={1} className="mb-6" /><p className="text-sm font-black uppercase tracking-[0.3em]">Nenhuma transação protocolada</p></div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {vendas.map(v => (
                <div key={v.id} className="p-8 flex items-center gap-8 group hover:bg-surface-up/30 transition-all cursor-pointer">
                  <div className="h-14 w-14 rounded-2xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-secondary shadow-inner group-hover:scale-105 transition-transform duration-500"><ShoppingCart size={22} strokeWidth={2} /></div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-main uppercase tracking-tight">{v.paciente_nome}</p>
                    <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-3"><span className="text-primary">{v.servico_nome || "ITEM AVULSO"}</span><span className="opacity-30">•</span><span>{v.forma_pagamento}</span></p>
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
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><ShieldCheck size={14} /> Licença de Uso Vitalícia</p>
              <h4 className="text-5xl font-black text-main tracking-tighter uppercase">SecretarIA {client.plan}</h4>
              <div className="mt-6 flex items-center gap-3 text-secondary font-medium"><CheckCircle2 size={18} className="text-primary" /><span>Todos os módulos operantes e integrados.</span></div>
            </div>
            <div className="relative z-10 h-32 w-32 rounded-[40px] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/10 group-hover:rotate-12 transition-all duration-700"><CreditCard size={64} strokeWidth={1} /></div>
          </div>
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-tertiary uppercase tracking-[0.3em] px-4 flex items-center gap-3"><Activity size={16} className="text-primary" /> Histórico de Licenciamento</h5>
            <div className="bento-card p-0 overflow-hidden divide-y divide-border-subtle">
              {invoices.map(inv => (
                <div key={inv.id} className="p-8 flex items-center gap-8 group hover:bg-surface-up/30 transition-all cursor-pointer">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${inv.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/5 text-red-500 border border-red-500/10'}`}>{inv.status === "pago" ? <CheckCircle2 size={24} /> : <Zap size={24} className="animate-pulse" />}</div>
                  <div className="flex-1"><p className="text-base font-bold text-main uppercase tracking-tight">{inv.descricao}</p><p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-2">{inv.due_date}</p></div>
                  <div className="text-right">
                    <p className="text-xl font-black text-main tracking-tighter">R$ {Number(inv.amount).toLocaleString("pt-BR")}</p>
                    {inv.status !== "pago" && <button onClick={() => inv.payment_link && window.open(inv.payment_link, "_blank")} className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-3 hover:text-emerald-500 transition-colors group/pay">Liquidar agora <ArrowUpRight size={14} className="group-hover/pay:translate-x-0.5 group-hover/pay:-translate-y-0.5 transition-transform" /></button>}
                    {inv.status === "pago" && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1 inline-block">Liquidado</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editServ !== null && <ServicoModal clientId={client.id} initial={editServ} onClose={() => setEditServ(null)} />}
      {showVenda && <VendaModal clientId={client.id} servicos={servicos} onClose={() => setShowVenda(false)} />}
    </div>
  );
}
