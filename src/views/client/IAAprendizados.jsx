import { useState } from "react";
import { CheckCircle, XCircle, Edit2, X } from "lucide-react";
import { IAAprendizados } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, Pill } from "../../pages/ClientPortal";

const STATUS_COLORS = {
  pendente:  { c: T.amber,  b: T.amberDim,  label: "⏳ Pendente" },
  aprovado:  { c: T.green,  b: T.greenDim,  label: "✅ Aprovado" },
  rejeitado: { c: T.red,    b: T.redDim,    label: "❌ Rejeitado" },
};

const TIPO_META = {
  conversa: { label: "💬 Conversa", color: T.cyan },
  correcao: { label: "✏️ Correção", color: T.amber },
  manual:   { label: "📝 Manual",   color: T.purple },
};

export default function IAAprendizadosView({ client, aprendizados }) {
  const [filter, setFilter] = useState("pendente");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const filtered = aprendizados.filter(a => filter === "todos" || a.status === filter);
  const pendentes = aprendizados.filter(a => a.status === "pendente").length;

  const aprovar = async (id) => { await IAAprendizados.aprovar(client.id, id); };
  const rejeitar = async (id) => { await IAAprendizados.rejeitar(client.id, id); };
  const salvarCorrecao = async (id) => {
    await IAAprendizados.corrigir(client.id, id, editText);
    setEditId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeIn 300ms ease" }}>
      <div>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: T.ink }}>🧠 IA Aprendizados</h1>
        <p style={{ margin: 0, fontSize: 13, color: T.inkTert }}>Revise e aprove o que sua IA está aprendendo nas conversas.</p>
      </div>

      {pendentes > 0 && (
        <div style={{ background: T.amberDim, border: `1px solid ${T.amber}44`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>⏳</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.amber }}>{pendentes} aprendizado(s) aguardando sua revisão</div>
            <div style={{ fontSize: 12, color: T.inkSec }}>Aprove os corretos e rejeite os incorretos para treinar melhor a IA.</div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card style={{ padding: "16px 20px", background: T.cyanDim, borderColor: `${T.cyan}22` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div style={{ fontSize: 13, color: T.inkSec, lineHeight: 1.6 }}>
            Sua IA aprende com cada conversa que realiza. Ela <strong style={{ color: T.ink }}>nunca passa preços</strong> de forma autônoma — isso é uma regra inviolável. Aqui você pode revisar o que ela aprendeu, corrigir respostas e aprovar novos conhecimentos para melhorar seu desempenho.
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8 }}>
        {["todos", "pendente", "aprovado", "rejeitado"].map(f => {
          const count = f === "todos" ? aprendizados.length : aprendizados.filter(a => a.status === f).length;
          const sc = STATUS_COLORS[f] || { c: T.inkSec, b: T.up };
          return (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${filter === f ? (sc.c || T.cyan) + "66" : T.border}`, background: filter === f ? (sc.b || T.cyanDim) : "transparent", color: filter === f ? (sc.c || T.cyan) : T.inkSec, fontFamily: "inherit" }}>
              {f === "todos" ? `Todos (${count})` : `${STATUS_COLORS[f]?.label} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && (
          <Card>
            <EmptyState icon="🧠" title="Nenhum aprendizado aqui" subtitle="Os aprendizados chegam automaticamente após as conversas" />
          </Card>
        )}
        {filtered.map(a => {
          const sc = STATUS_COLORS[a.status] || STATUS_COLORS.pendente;
          const tipo = TIPO_META[a.tipo] || TIPO_META.conversa;
          const isEditing = editId === a.id;

          return (
            <Card key={a.id} style={{ overflow: "hidden", border: `1px solid ${a.status === "pendente" ? T.amber + "33" : T.border}` }}>
              <div style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: tipo.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {tipo.label.split(" ")[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Pill color={tipo.color} bg={tipo.color + "18"}>{tipo.label}</Pill>
                      <Pill color={sc.c} bg={sc.b}>{sc.label}</Pill>
                      {a.corrigido && <Pill color={T.amber} bg={T.amberDim}>✏️ Corrigido</Pill>}
                    </div>

                    {a.resumo && (
                      <div style={{ fontSize: 12, color: T.inkTert, marginBottom: 4 }}>
                        <strong>Contexto:</strong> {a.resumo}
                      </div>
                    )}

                    {isEditing
                      ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.amber}44`, color: T.ink, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }} />
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn size="sm" onClick={() => salvarCorrecao(a.id)}>✅ Salvar Correção</Btn>
                            <Btn size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancelar</Btn>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: T.ink, background: T.bg, borderRadius: 8, padding: "10px 12px", lineHeight: 1.6, fontStyle: "italic" }}>
                          "{a.aprendizado}"
                        </div>
                      )
                    }

                    {a.telefone_origem && (
                      <div style={{ fontSize: 10, color: T.inkTert, marginTop: 6 }}>
                        Origem: {a.telefone_origem} · {a.created_at?.toDate?.()?.toLocaleString("pt-BR") || "—"}
                      </div>
                    )}
                  </div>

                  {!isEditing && a.status === "pendente" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <Btn size="sm" onClick={() => aprovar(a.id)} style={{ background: T.greenDim, color: T.green, border: `1px solid ${T.green}44` }}>
                        <CheckCircle size={12} /> Aprovar
                      </Btn>
                      <Btn size="sm" variant="danger" onClick={() => rejeitar(a.id)}>
                        <XCircle size={12} /> Rejeitar
                      </Btn>
                      <Btn size="sm" variant="ghost" onClick={() => { setEditId(a.id); setEditText(a.aprendizado); }}>
                        <Edit2 size={12} /> Corrigir
                      </Btn>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
