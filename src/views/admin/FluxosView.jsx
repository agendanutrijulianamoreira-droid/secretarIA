import { useState } from "react";
import { 
  Zap, Activity, CheckCircle2, AlertTriangle, 
  Search, ArrowRight, ExternalLink, RefreshCcw, GitBranch
} from "lucide-react";
import { Card, PageTitle, Btn, Pulse, COLORS } from "../../pages/ClientPortal";

function StatusBadge({ status }) {
  const m = { 
    online:  { c: "#10B981", l: "Online" }, 
    offline: { c: "#EF4444", l: "Offline" }, 
    pending: { c: "#F59E0B", l: "Pendente" }, 
    error:   { c: "#EF4444", l: "Erro" } 
  }[status] || { c: "#94A3B8", l: status || "—" };
  
  return (
    <span 
      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
      style={{ color: m.c, backgroundColor: m.c + '10', borderColor: m.c + '20' }}
    >
      {m.l}
    </span>
  );
}

export default function FluxosView({ clients }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? clients : clients.filter(c => c.n8n_status === filter);

  const stats = {
    total: clients.length,
    online: clients.filter(c => c.n8n_status === "online").length,
    pending: clients.filter(c => !c.n8n_status || c.n8n_status === "pending").length,
    error: clients.filter(c => c.n8n_status === "error").length,
  };

  const provision = async (client) => {
    if (!confirm(`Provisionar fluxo n8n para "${client.name}"?`)) return;
    if (window.provisionClient) window.provisionClient(client.id);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={GitBranch} title="Fluxos de Automação" subtitle="Gestão de provisionamento e monitoramento de workflows n8n por unidade." />

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: "Total Provisionado", value: stats.total, icon: GitBranch, color: "text-primary", bg: "bg-primary/10" },
          { label: "Sincronia Estável", value: stats.online, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Em Fila (Buffer)", value: stats.pending, icon: RefreshCcw, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Criticidade / Erros", value: stats.error, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
        ].map(s => (
          <div key={s.label} className="bento-card group">
            <div className="premium-glow" />
            <div className="relative z-10 flex flex-col h-full">
              <div className={`h-12 w-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} border border-border-subtle shadow-inner mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <s.icon size={22} strokeWidth={2.5} />
              </div>
              <h4 className="text-4xl font-black tracking-tighter text-main">{s.value}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.3em] mt-2 opacity-60">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 p-2 bg-surface-up/30 rounded-2xl border border-border-subtle w-fit">
        {["all", "online", "pending", "error"].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-tertiary hover:text-secondary'}`}
          >
            {f === "all" ? "Full Stack" : f}
          </button>
        ))}
      </div>

      {/* Workflows Table */}
      <div className="bento-card p-0 overflow-hidden shadow-2xl">
        <div className="premium-glow opacity-30" />
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-up/30 border-b border-border-subtle">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Entidade / Clínica</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Escalonamento</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Status do Fluxo</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary">Ponto de Entrada (Webhook)</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-tertiary text-right">Comandos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {filtered.map(c => (
                <tr key={c.id} className="group hover:bg-surface-up/30 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-main tracking-tight uppercase italic">{c.name}</span>
                       <span className="text-[10px] text-tertiary font-bold lowercase opacity-60">{c.email}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-[10px] font-black text-secondary uppercase tracking-widest">{c.plan}</td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <Pulse status={c.n8n_status === 'online' ? 'online' : c.n8n_status === 'error' ? 'offline' : 'offline'} />
                       <StatusBadge status={c.n8n_status || "pending"} />
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 text-[10px] font-black text-tertiary uppercase tracking-widest truncate max-w-[200px] opacity-60">
                       <ExternalLink size={12} /> {c.n8n_url || "protocolo pendente"}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => provision(c)}
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all cursor-pointer shadow-lg shadow-primary/5"
                    >
                      <Zap size={14} className="fill-current" /> Provisionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-24 text-center opacity-30">
               <Activity size={48} strokeWidth={1} className="mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum terminal localizado nesta camada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
