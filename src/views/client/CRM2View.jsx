import { useState } from "react";
import { 
  Plus, X, Edit2, Check, Users, Megaphone, Calendar, Search, 
  Trash2, Heart, Filter, UserPlus, CheckCircle2, ShieldCheck, 
  Activity, Zap, Clock, Smartphone, MessageSquare
} from "lucide-react";
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
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
           <div>
              <h4 className="text-xl font-black text-main tracking-tighter uppercase">{f.id ? "Editar Prontuário" : "Novo Cadastro Clínico"}</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1.5">Sincronização imediata com o cérebro da IA.</p>
           </div>
           <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-10 space-y-8">
          <Inp label="Nome Completo *" value={f.nome} onChange={up("nome")} placeholder="Ex: Dra. Maria Oliveira" icon={Users} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Inp label="WhatsApp Operacional *" value={f.telefone} onChange={up("telefone")} placeholder="+55..." icon={Smartphone} />
            <Inp label="E-mail de Contato" value={f.email} onChange={up("email")} placeholder="contato@exemplo.com" icon={MessageSquare} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Inp label="Data de Nascimento" value={f.data_nascimento} onChange={up("data_nascimento")} placeholder="DD/MM/AAAA" icon={Calendar} />
          </div>
          <Inp label="Observações de Prontuário" value={f.observacoes} onChange={up("observacoes")} placeholder="Alergias, objetivos terapêuticos, restrições..." rows={5} />
          
          <div className="pt-6 flex gap-4">
             <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
             <Btn disabled={saving || !f.nome || !f.telefone} onClick={save} className="flex-1" icon={CheckCircle2}>
                {saving ? "Processando..." : "Salvar Registro"}
             </Btn>
          </div>
        </div>
      </Card>
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
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-3xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20 max-h-[90vh] flex flex-col">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
           <div>
              <h4 className="text-xl font-black text-main tracking-tighter uppercase">Disparo de Inteligência</h4>
              <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <ShieldCheck size={12} className="text-primary" />
                Regras de Anti-Ban e cadência humana ativadas.
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
             <div className="relative">
                <textarea 
                  value={f.mensagem} 
                  onChange={e => up("mensagem")(e.target.value)} 
                  placeholder="Olá {nome}! Como está sua evolução? Use {nome} para variáveis dinâmicas." 
                  rows={8}
                  className="w-full p-6 bg-surface-up/20 border border-border-subtle rounded-[24px] text-main placeholder:text-tertiary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300 text-sm resize-none"
                />
             </div>
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

const STATUS_CAMP = {
  rascunho: { l: "Rascunho", c: "text-tertiary", bg: "bg-surface-up/50" },
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
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <PageTitle icon={Users} title="Base de Pacientes" subtitle="Gestão de prontuários e comunicação estratégica." />
        <div className="flex gap-4">
          <button onClick={() => setShowCamp(true)} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-surface-up/50 border border-border-subtle text-main font-black text-[10px] uppercase tracking-[0.2em] hover:border-primary/40 hover:bg-surface-up transition-all cursor-pointer">
             <Megaphone size={16} className="text-primary" /> Criar Campanha
          </button>
          <Btn onClick={() => setEditPac({})} icon={UserPlus}>Novo Cadastro</Btn>
        </div>
      </div>

      <div className="flex gap-10 border-b border-border-subtle">
        {[["pacientes", `Banco de Dados (${pacientes.length})`], ["campanhas", `Fluxos de Disparo (${campanhas.length})`]].map(([id, label]) => (
          <button 
            key={id} 
            onClick={() => setTab(id)}
            className={`pb-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-2 cursor-pointer ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pacientes" && (
        <div className="space-y-10">
          <div className="relative group">
             <Inp 
              value={search} 
              onChange={v => setSearch(v)} 
              placeholder="Localizar registro por nome ou terminal celular..." 
              icon={Search}
             />
          </div>

          {filtered.length === 0 ? (
            <div className="py-32 text-center border border-dashed border-border-subtle rounded-[48px] opacity-30">
               <ShieldCheck size={80} strokeWidth={1} className="mx-auto mb-6 text-tertiary" />
               <p className="text-sm font-black uppercase tracking-[0.3em]">Ambiente Livre de Registros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filtered.map(p => (
                <div key={p.id} className="p-8 rounded-[32px] bg-surface-up/10 border border-border-subtle flex flex-col md:flex-row items-center gap-8 group hover:border-primary/30 transition-all duration-500 cursor-pointer">
                  <div className="h-16 w-16 rounded-[22px] bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500 text-lg">
                    {p.nome?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-black text-main tracking-tight uppercase">{p.nome}</h4>
                    <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">
                       <span className="flex items-center gap-2">
                         <Smartphone size={14} className="text-primary" /> {p.telefone}
                       </span>
                       {p.data_nascimento && (
                         <span className="flex items-center gap-2 text-primary/80">
                           <Calendar size={14} /> {p.data_nascimento}
                         </span>
                       )}
                       {p.origem === "lead_convertido" && (
                         <span className="flex items-center gap-2 text-emerald-500">
                           <CheckCircle2 size={14} /> Convertido via IA
                         </span>
                       )}
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => setEditPac(p)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary transition-all cursor-pointer"><Edit2 size={18} /></button>
                    <button onClick={() => del(p)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={18} /></button>
                  </div>
                  {p.observacoes && (
                    <div className="hidden lg:block max-w-xs p-4 rounded-2xl bg-surface-up/50 border border-border-subtle text-[11px] text-secondary italic opacity-60 truncate">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {campanhas.length === 0 ? (
            <div className="md:col-span-2 py-32 border border-dashed border-border-subtle rounded-[48px] opacity-30 text-center">
               <Megaphone size={80} strokeWidth={1} className="mx-auto mb-6 text-tertiary" />
               <p className="text-sm font-black uppercase tracking-[0.3em]">Nenhum fluxo registrado</p>
            </div>
          ) : (
            campanhas.map(c => {
              const tipo = CAMP_TIPOS[c.tipo] || { label: c.tipo, cor: "#94A3B8" };
              const sc = STATUS_CAMP[c.status] || STATUS_CAMP.rascunho;
              return (
                <div key={c.id} className="bento-card group flex flex-col gap-8 p-10 h-full">
                  <div className="premium-glow" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-surface-up/50 border border-border-subtle flex items-center justify-center shadow-inner group-hover:rotate-12 transition-all duration-500">
                         <Megaphone size={24} className="text-primary" />
                      </div>
                      <div className={`px-5 py-2 rounded-xl ${sc.bg} ${sc.c} text-[10px] font-black uppercase tracking-[0.2em] border border-border-subtle`}>
                         {sc.l}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-main leading-tight mb-4 tracking-tight uppercase">{c.titulo || tipo.label}</h4>
                      <p className="text-sm text-secondary leading-relaxed line-clamp-3 italic opacity-60 border-l-2 border-primary/20 pl-4 py-1">"{c.mensagem}"</p>
                    </div>
                    <div className="pt-8 border-t border-border-subtle flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-black text-tertiary uppercase tracking-[0.2em]">
                       <span className="text-primary flex items-center gap-2"><Zap size={12} /> {tipo.label}</span>
                       <span className="flex items-center gap-2"><Users size={12} /> {c.pacientes_alvo === "todos" ? "Base Geral" : "Segmentado"}</span>
                       {c.agendada_para && <span className="flex items-center gap-2"><Clock size={12} /> {c.agendada_para}</span>}
                    </div>
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
