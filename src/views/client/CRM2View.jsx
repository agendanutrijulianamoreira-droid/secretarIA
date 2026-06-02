import { useState } from "react";
import { Search, ShieldCheck, Users, Megaphone, UserPlus, Edit2, Trash2, Smartphone, Calendar, CheckCircle2, Zap, Clock } from "lucide-react";
import { Pacientes, Campanhas } from "../../lib/db";
import { Btn, Inp, PageTitle } from "../../pages/ClientPortal";
import { PacienteModal } from "./PacienteModal";
import { CampanhaModal } from "./CampanhaModal";

const CAMP_TIPOS   = Campanhas.TIPOS;
const STATUS_CAMP  = {
  rascunho:  { l: "Rascunho",  c: "text-tertiary",    bg: "bg-surface-up/50" },
  agendada:  { l: "Agendada",  c: "text-amber-500",   bg: "bg-amber-500/10" },
  enviando:  { l: "Em Fluxo",  c: "text-blue-500",    bg: "bg-blue-500/10" },
  concluida: { l: "Sucesso",   c: "text-emerald-500", bg: "bg-emerald-500/10" },
  cancelada: { l: "Cancelada", c: "text-red-500",     bg: "bg-red-500/10" },
};

export default function CRM2View({ client, pacientes, campanhas }) {
  const [tab,      setTab]      = useState("pacientes");
  const [editPac,  setEditPac]  = useState(null);
  const [showCamp, setShowCamp] = useState(false);
  const [search,   setSearch]   = useState("");

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
          <button key={id} onClick={() => setTab(id)} className={`pb-5 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-b-2 cursor-pointer ${tab === id ? 'border-primary text-primary' : 'border-transparent text-tertiary hover:text-secondary'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "pacientes" && (
        <div className="space-y-10">
          <Inp value={search} onChange={v => setSearch(v)} placeholder="Localizar registro por nome ou terminal celular..." icon={Search} />
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
                      <span className="flex items-center gap-2"><Smartphone size={14} className="text-primary" /> {p.telefone}</span>
                      {p.data_nascimento && <span className="flex items-center gap-2 text-primary/80"><Calendar size={14} /> {p.data_nascimento}</span>}
                      {p.origem === "lead_convertido" && <span className="flex items-center gap-2 text-emerald-500"><CheckCircle2 size={14} /> Convertido via IA</span>}
                    </div>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => setEditPac(p)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary transition-all cursor-pointer"><Edit2 size={18} /></button>
                    <button onClick={() => del(p)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={18} /></button>
                  </div>
                  {p.observacoes && <div className="hidden lg:block max-w-xs p-4 rounded-2xl bg-surface-up/50 border border-border-subtle text-[11px] text-secondary italic opacity-60 truncate">"{p.observacoes}"</div>}
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
          ) : campanhas.map(c => {
            const tipo = CAMP_TIPOS[c.tipo] || { label: c.tipo, cor: "#94A3B8" };
            const sc   = STATUS_CAMP[c.status] || STATUS_CAMP.rascunho;
            return (
              <div key={c.id} className="bento-card group flex flex-col gap-8 p-10 h-full">
                <div className="premium-glow" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-surface-up/50 border border-border-subtle flex items-center justify-center shadow-inner group-hover:rotate-12 transition-all duration-500">
                      <Megaphone size={24} className="text-primary" />
                    </div>
                    <div className={`px-5 py-2 rounded-xl ${sc.bg} ${sc.c} text-[10px] font-black uppercase tracking-[0.2em] border border-border-subtle`}>{sc.l}</div>
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
          })}
        </div>
      )}

      {editPac !== null && <PacienteModal clientId={client.id} initial={editPac} onClose={() => setEditPac(null)} />}
      {showCamp && <CampanhaModal clientId={client.id} pacientes={pacientes} onClose={() => setShowCamp(false)} />}
    </div>
  );
}
