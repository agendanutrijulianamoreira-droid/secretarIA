import { useState } from "react";
import { Plus, X, Edit2, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Servicos, Vendas, Invoices } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill } from "../../pages/ClientPortal";

const PAGAMENTOS = ["PIX", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto", "Convênio"];
const PLAN_META = { Starter: { color: T.inkSec, bg: "rgba(156,163,176,0.1)" }, Pro: { color: T.green, bg: T.greenDim }, Enterprise: { color: T.amber, bg: T.amberDim } };

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" }}>
      <Card style={{ width: 440, overflow: "hidden" }}>
        <CardHeader title={f.id ? "Editar Serviço" : "Novo Serviço"} action={<button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkTert, fontSize: 18 }}>✕</button>} />
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <Inp label="Nome do Serviço *" value={f.nome} onChange={up("nome")} placeholder="Ex: Consulta de Avaliação" />
          <Inp label="Descrição" value={f.descricao} onChange={up("descricao")} placeholder="Descrição breve do serviço" rows={2} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Inp label="Valor (R$)" value={f.preco} onChange={up("preco")} placeholder="0,00" />
            <Inp label="Duração (min)" value={f.duracao_minutos} onChange={up("duracao_minutos")} placeholder="60" />
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
            <Btn onClick={save} disabled={saving || !f.nome} style={{ flex: 1 }}>{saving ? "Salvando…" : "✅ Salvar"}</Btn>
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" }}>
      <Card style={{ width: 460, overflow: "hidden" }}>
        <CardHeader title="Registrar Venda" action={<button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.inkTert, fontSize: 18 }}>✕</button>} />
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <Inp label="Nome do Paciente *" value={f.paciente_nome} onChange={up("paciente_nome")} placeholder="Nome do paciente" />
          <div>
            <label style={{ fontSize: 11, color: T.inkTert, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Serviço</label>
            <select value={f.servico_id} onChange={e => pickServico(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontSize: 13, outline: "none", fontFamily: "inherit" }}>
              <option value="">Selecionar serviço…</option>
              {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} — R$ {Number(s.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Inp label="Valor (R$)" value={f.valor} onChange={up("valor")} placeholder="0,00" />
            <div>
              <label style={{ fontSize: 11, color: T.inkTert, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>Pagamento</label>
              <select value={f.forma_pagamento} onChange={e => up("forma_pagamento")(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, color: T.ink, fontSize: 13, outline: "none", fontFamily: "inherit" }}>
                {PAGAMENTOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <Inp label="Observações" value={f.observacoes} onChange={up("observacoes")} placeholder="Notas sobre a venda…" rows={2} />
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <Btn variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Btn>
            <Btn onClick={save} disabled={saving || !f.paciente_nome} style={{ flex: 1 }}>{saving ? "Salvando…" : "💰 Registrar"}</Btn>
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
  const pm = PLAN_META[client.plan] || PLAN_META.Starter;

  const delServ = async (s) => {
    if (!confirm(`Remover serviço "${s.nome}"?`)) return;
    await Servicos.delete(client.id, s.id);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 300ms ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <PageTitle icon={Wallet} iconColor={T.green} title="Financeiro" subtitle="Serviços, vendas e cobranças do seu plano." />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn size="sm" variant="ghost" onClick={() => setShowVenda(true)}>+ Registrar Venda</Btn>
          <Btn size="sm" onClick={() => setEditServ({})}>+ Serviço</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 11, color: T.inkTert, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Faturamento Total</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.green }}>R$ {totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
        </Card>
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 11, color: T.inkTert, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Vendas Confirmadas</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.cyan }}>{vendas.filter(v => v.status === "confirmado").length}</div>
        </Card>
        <Card style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 11, color: T.inkTert, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Pendentes</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: pendentes > 0 ? T.amber : T.inkSec }}>{pendentes}</div>
        </Card>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, gap: 4 }}>
        {[["servicos", `💼 Serviços (${servicos.length})`], ["vendas", `📊 Vendas (${vendas.length})`], ["plano", "🧾 Cobranças do Plano"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", color: tab === id ? T.cyan : T.inkSec, fontSize: 13, fontWeight: tab === id ? 700 : 500, borderBottom: `2px solid ${tab === id ? T.cyan : "transparent"}`, fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>

      {tab === "servicos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {servicos.length === 0 && <Card><EmptyState icon="💼" title="Nenhum serviço cadastrado" subtitle='Cadastre seus serviços e valores para a IA referenciar' /></Card>}
          {servicos.map(s => (
            <Card key={s.id} style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: T.greenDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💼</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{s.nome}</div>
                  <div style={{ fontSize: 11, color: T.inkTert }}>{s.duracao_minutos}min{s.descricao ? ` · ${s.descricao}` : ""}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.green }}>R$ {Number(s.preco).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn size="sm" variant="ghost" onClick={() => setEditServ(s)}><Edit2 size={12} /></Btn>
                  <Btn size="sm" variant="danger" onClick={() => delServ(s)}><X size={12} /></Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "vendas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vendas.length === 0 && <Card><EmptyState icon="📊" title="Nenhuma venda registrada" subtitle='Registre manualmente as vendas para acompanhar o faturamento' /></Card>}
          {vendas.map(v => {
            const sc = { pendente: { c: T.amber, b: T.amberDim }, confirmado: { c: T.green, b: T.greenDim }, cancelado: { c: T.red, b: T.redDim } }[v.status] || {};
            return (
              <Card key={v.id} style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 18 }}>💰</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{v.paciente_nome}</div>
                    <div style={{ fontSize: 11, color: T.inkTert }}>{v.servico_nome || "Serviço avulso"} · {v.forma_pagamento}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.green }}>R$ {Number(v.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                  <Pill color={sc.c} bg={sc.b}>{v.status}</Pill>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "plano" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div><div style={{ fontSize: 12, color: T.inkTert }}>Plano atual</div><div style={{ fontSize: 20, fontWeight: 700, color: pm.color }}>{client.plan}</div></div>
              <Pill color={pm.color} bg={pm.bg}>{client.plan}</Pill>
            </div>
          </Card>
          {invoices.length === 0 && <Card><EmptyState icon="🧾" title="Sem cobranças ainda" /></Card>}
          {invoices.map((inv, i) => (
            <Card key={inv.id} style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 18 }}>{inv.status === "pago" ? "🟢" : inv.status === "pendente" ? "🟡" : "🔴"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: T.ink }}>{inv.descricao}</div>
                  <div style={{ fontSize: 11, color: T.inkTert }}>{inv.due_date}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>R$ {Number(inv.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                {inv.status !== "pago" && (
                  <Btn size="sm" variant="cyan" onClick={() => inv.payment_link && window.open(inv.payment_link, "_blank")}>Pagar</Btn>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editServ !== null && <ServicoModal clientId={client.id} initial={editServ} onClose={() => setEditServ(null)} />}
      {showVenda && <VendaModal clientId={client.id} servicos={servicos} onClose={() => setShowVenda(false)} />}
    </div>
  );
}
