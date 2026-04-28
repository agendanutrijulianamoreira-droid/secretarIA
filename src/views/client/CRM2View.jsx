import { useState } from "react";
import { Plus, X, Edit2, Check, Users, Megaphone, Calendar, Search, Trash2, Heart, Filter, UserPlus } from "lucide-react";
import { Pacientes, Campanhas } from "../../lib/db";
import { T, Btn, Inp, Card, CardHeader, EmptyState, PageTitle, Pill } from "../../pages/ClientPortal";

const CAMP_TIPOS = Campanhas.TIPOS;

function PacienteModal({ clientId, initial, onClose }) {
  const [f, setF] = useState(initial || { nome: "", telefone: "", email: "", data_nascimento: "", observacoes: "" });
  const [saving, setSaving] = useState(false);
  const up = k => v => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.nome.trim() || !f.telefone.trim()) return;
    setSaving(true);
    try {
      if (f.id) await Pacientes.update(clientId, f.id, f);
      else await Pacientes.create(clientId, f);
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface border border-border-subtle rounded-[32px] shadow-2xl overflow-hidden animate-zoom-in">
        <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between">
           <h4 className="text-lg font-black text-main tracking-tight">{f.id ? "Editar Prontuário" : "Novo Cadastro"}</h4>
           <button onClick={onClose} className="text-tertiary hover:text-main transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <Inp label="Nome Completo *" value={f.nome} onChange={up("nome")} placeholder="Ex: Maria Silva" />
          <div className="grid grid-cols-2 gap-4">
            <Inp label="WhatsApp *" value={f.telefone} onChange={up("telefone")} placeholder="+55..." />
            <Inp label="E-mail" value={f.email} onChange={up("email")} placeholder="contato@..." />
          </div>
          <Inp label="Data de Nascimento" value={f.data_nascimento} onChange={up("data_nascimento")} placeholder="DD/MM/AAAA" />
          <Inp label="Observações Clínicas" value={f.observacoes} onChange={up("observacoes")} placeholder="Alergias, objetivos, restrições..." rows={4} />
          
          <div className="pt-4 flex gap-3">
             <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest hover:border-primary/20 transition-all">Cancelar</button>
             <button onClick={save} disabled={saving || !f.nome || !f.telefone} className="flex-1 py-4 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all">
                {saving ? "Processando..." : "Salvar Registro"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampanhaModal({ clientId, pacientes, onClose }) {
  const [f, setF] = useState({ tipo: "", titulo: "", mensagem: "", pacientes_alvo: "todos", agendada_para: "" });
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-surface border border-border-subtle rounded-[40px] shadow-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between">
           <div>
              <h4 className="text-xl font-black text-main tracking-tight">Disparo em Massa</h4>
              <p className="text-xs text-tertiary font-medium mt-1">Sua IA enviará as mensagens seguindo as regras de anti-ban.</p>
           </div>
           <button onClick={onClose} className="text-tertiary hover:text-main transition-colors"><X size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <div>
            <label className="text-[10px] font-black text-tertiary uppercase tracking-widest ml-1 mb-3 block">Estilo da Campanha *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(CAMP_TIPOS).map(([id, m]) => (
                <button key={id} onClick={() => up("tipo")(id)} className={`p-4 rounded-2xl border transition-all text-left group ${f.tipo === id ? 'bg-primary/5 border-primary/40' : 'bg-surface-up border-border-subtle hover:border-primary/20'}`}>
                   <div className={`text-xs font-black uppercase tracking-tight ${f.tipo === id ? 'text-primary' : 'text-tertiary group-hover:text-secondary'}`}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <Inp label="Título Interno" value={f.titulo} onChange={up("titulo")} placeholder="Ex: Lembrete de Retorno — Maio" />
          <Inp label="Texto da Mensagem *" value={f.mensagem} onChange={up("mensagem")} placeholder="Olá {nome}! 👋 Como está sua evolução?&#10;&#10;Dica: Use {nome} para personalizar o envio." rows={6} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <label className="text-[10px] font-black text-tertiary uppercase tracking-widest ml-1 mb-3 block">Público Alvo</label>
                <div className="flex gap-2 p-1 bg-surface-up rounded-2xl border border-border-subtle">
                   {["todos", "selecionados"].map(op => (
                     <button key={op} onClick={() => up("pacientes_alvo")(op)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${f.pacientes_alvo === op ? 'bg-primary text-black shadow-sm' : 'text-tertiary hover:text-secondary'}`}>
                        {op === "todos" ? `Geral (${pacientes.length})` : "Filtro"}
                     </button>
                   ))}
                </div>
             </div>
             <Inp label="Agendamento Inteligente" value={f.agendada_para} onChange={up("agendada_para")} placeholder="Ex: Amanhã às 09:00" />
          </div>
        </div>

        <div className="p-10 border-t border-border-subtle bg-surface-soft/50 flex gap-4">
           <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[11px] uppercase tracking-widest">Cancelar</button>
           <button onClick={save} disabled={saving || !f.tipo || !f.mensagem} className="flex-1 py-5 rounded-2xl bg-primary text-black font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
              {saving ? "Preparando Motores..." : "🚀 Lançar Campanha"}
           </button>
        </div>
      </div>
    </div>
  );
}

const STATUS_CAMP = {
  rascunho: { l: "Rascunho", c: "text-tertiary", bg: "bg-surface-up" },
  agendada: { l: "Agendada", c: "text-amber-500", bg: "bg-amber-500/10" },
  enviando: { l: "Em Fluxo", c: "text-blue-500", bg: "bg-blue-500/10" },
  concluida:{ l: "Sucesso", c: "text-emerald-500", bg: "bg-emerald-500/10" },
  cancelada:{ l: "Cancelada", c: "text-red-500", bg: "bg-red-500/10" },
};

export default function CRM2View({ client, pacientes, campanhas }) {
  const [tab, setTab]           = useState("pacientes");
  const [editPac, setEditPac]   = useState(null);
  const [showCamp, setShowCamp] = useState(false);
  const [search, setSearch]     = useState("");

  const filtered = pacientes.filter(p =>
    (p.nome || "").toLowerCase().includes(search.toLowerCase()) || p.telefone?.includes(search)
  );

  const del = async (p) => {
    if (!confirm(`Remover prontuário de ${p.nome}?`)) return;
    await Pacientes.delete(client.id, p.id);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageTitle icon={Users} title="Base de Pacientes" subtitle="Gestão de prontuários e comunicação em massa." />
        <div className="flex gap-3">
          <button onClick={() => setShowCamp(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-up border border-border-subtle text-main font-black text-[10px] uppercase tracking-widest hover:border-primary/30 transition-all">
             <Megaphone size={14} className="text-primary" /> Campanha
          </button>
          <button onClick={() => setEditPac({})} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
             <UserPlus size={14} /> Novo Cadastro
          </button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border-subtle">
        {[["pacientes", `Base de Dados (${pacientes.length})`], ["campanhas", `Histórico de Disparos (${campanhas.length})`]].map(([id, label]) => (
          <button 
            key={id} 
            onClick={() => setTab(id)}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pacientes" && (
        <div className="space-y-6">
          <div className="relative group">
             <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Buscar paciente por nome ou celular..." 
              className="w-full pl-12 pr-6 py-4 rounded-[22px] bg-surface border border-border-subtle focus:border-primary/50 outline-none transition-all text-sm font-medium"
             />
             <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-tertiary group-focus-within:text-primary transition-colors" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="👥" title="Base Vazia" subtitle='Inicie o cadastro dos seus pacientes para liberar o CRM.' />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map(p => (
                <div key={p.id} className="p-6 rounded-[32px] bg-surface border border-border-subtle flex flex-col md:flex-row items-center gap-6 group hover:border-primary/20 transition-all">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/10 shadow-inner">
                    {p.nome?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-base font-black text-main">{p.nome}</h4>
                    <div className="mt-1 flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-black text-tertiary uppercase tracking-widest">
                       <span>{p.telefone}</span>
                       {p.data_nascimento && (
                         <span className="flex items-center gap-1.5 text-blue-500">
                           <Calendar size={12} /> {p.data_nascimento}
                         </span>
                       )}
                       {p.origem === "lead_convertido" && (
                         <span className="flex items-center gap-1.5 text-emerald-500">
                           <Check size={12} /> Convertido via IA
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditPac(p)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => del(p)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                  {p.observacoes && (
                    <div className="w-full md:hidden mt-4 p-4 rounded-2xl bg-surface-soft/50 border border-border-subtle text-xs text-secondary italic">
                       "{p.observacoes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "campanhas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campanhas.length === 0 ? (
            <div className="md:col-span-2 py-20 border border-dashed border-border-subtle rounded-[40px] opacity-40 text-center">
               <Megaphone size={60} className="mx-auto mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest">Nenhuma campanha registrada</p>
            </div>
          ) : (
            campanhas.map(c => {
              const tipo = CAMP_TIPOS[c.tipo] || { label: c.tipo, cor: "#94A3B8" };
              const sc = STATUS_CAMP[c.status] || STATUS_CAMP.rascunho;
              return (
                <div key={c.id} className="p-8 rounded-[32px] bg-surface border border-border-subtle hover:border-primary/20 transition-all flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-2xl bg-surface-up border border-border-subtle flex items-center justify-center shadow-inner">
                       <Megaphone size={20} className="text-primary" />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full ${sc.bg} ${sc.c} text-[9px] font-black uppercase tracking-widest`}>
                       {sc.l}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-main leading-tight mb-2">{c.titulo || tipo.label}</h4>
                    <p className="text-xs text-secondary leading-relaxed line-clamp-3 italic opacity-70">"{c.mensagem}"</p>
                  </div>
                  <div className="pt-6 border-t border-border-subtle flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-black text-tertiary uppercase tracking-widest">
                     <span className="text-primary">{tipo.label}</span>
                     <span>Público: {c.pacientes_alvo === "todos" ? "Geral" : "Filtro"}</span>
                     {c.agendada_para && <span>Data: {c.agendada_para}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {editPac !== null && <PacienteModal clientId={client.id} initial={editPac} onClose={() => setEditPac(null)} />}
      {showCamp && <CampanhaModal clientId={client.id} pacientes={pacientes} onClose={() => setShowCamp(false)} />}
    </div>
  );
}
