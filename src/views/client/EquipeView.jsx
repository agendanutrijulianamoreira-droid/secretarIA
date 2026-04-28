import { useState, useEffect } from "react";
import { 
  Users, Plus, X, Edit2, Trash2, Calendar, 
  Clock, Mail, ChevronRight, Activity, CalendarDays 
} from "lucide-react";
import { api } from "../../lib/api";
import { T, Btn, Inp, Card, CardHeader, PageTitle, Pill, COLORS } from "../../pages/ClientPortal";

export default function EquipeView({ client }) {
  const [professionals, setProfessionals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", google_calendar_email: "", calendar_color: "#10B981" });
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Como estamos usando SQL via API, faremos o fetch inicial e polling ou refresh manual
    const load = async () => {
      try {
        const [profs, apps] = await Promise.all([
          api.professionals.list(client.id),
          api.appointments.list(client.id)
        ]);
        setProfessionals(profs);
        setAppointments(apps);
      } catch (err) {
        console.error("Erro ao carregar dados da equipe:", err);
      }
    };
    load();
  }, [client.id, refreshKey]);

  const save = async () => {
    setLoading(true);
    try {
      if (editing) {
        await api.professionals.update(client.id, editing.id, form);
      } else {
        await api.professionals.create(client.id, form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: "", google_calendar_email: "", calendar_color: "#10B981" });
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      alert("Erro ao salvar profissional: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (confirm("Deseja remover este profissional?")) {
      try {
        await api.professionals.delete(client.id, id);
        setRefreshKey(prev => prev + 1);
      } catch (err) {
        alert("Erro ao remover: " + err.message);
      }
    }
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, google_calendar_email: p.google_calendar_email, calendar_color: p.calendar_color });
    setShowModal(true);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageTitle 
          icon={Users} 
          title="Equipe & Agenda" 
          subtitle="Gerencie seus profissionais e visualize a agenda unificada da clínica." 
        />
        <Btn onClick={() => { setEditing(null); setForm({ name: "", google_calendar_email: "", calendar_color: "#10B981" }); setShowModal(true); }}>
          <div className="flex items-center gap-2">
            <Plus size={16} /> Adicionar Profissional
          </div>
        </Btn>
      </div>

      {/* Grid de Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {professionals.map(p => (
          <Card key={p.id} className="p-6 border-l-4" style={{ borderLeftColor: p.calendar_color }}>
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-2xl bg-surface-up flex items-center justify-center text-xl shadow-inner font-black text-main">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(p)} className="p-2 text-tertiary hover:text-primary transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => remove(p.id)} className="p-2 text-tertiary hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <h4 className="text-sm font-black text-main uppercase tracking-tight">{p.name}</h4>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-tertiary font-bold">
              <Mail size={12} /> {p.google_calendar_email}
            </div>
          </Card>
        ))}
        {professionals.length === 0 && (
          <div className="md:col-span-3 py-16 rounded-[40px] border border-dashed border-border-subtle flex flex-col items-center text-center opacity-50">
            <Users size={48} className="text-tertiary mb-4" />
            <h4 className="text-sm font-bold text-secondary uppercase tracking-widest">Nenhum profissional cadastrado</h4>
            <p className="text-xs text-tertiary mt-1">Sua clínica precisa de profissionais para gerenciar a agenda.</p>
          </div>
        )}
      </div>

      {/* Calendário Bento Grid (Agendamentos Recentes/Próximos) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays size={18} />
           </div>
           <h3 className="text-lg font-black tracking-tight text-main uppercase">Agenda Unificada</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1 p-8 bg-primary/5 border-primary/20 flex flex-col justify-center text-center">
             <h2 className="text-5xl font-black text-primary tracking-tighter">{appointments.filter(a => a.status === 'scheduled').length}</h2>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">Agendamentos Ativos</p>
          </Card>

          <Card className="md:col-span-3">
             <CardHeader 
                title="Próximos Atendimentos" 
                subtitle="Visualização cronológica dos compromissos da equipe." 
             />
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-surface-soft/50 border-b border-border-subtle">
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-tertiary">Horário</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-tertiary">Paciente</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-tertiary">Profissional</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-tertiary">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-subtle/50">
                      {appointments.map(appo => {
                        const prof = professionals.find(p => p.id === appo.professional_id);
                        return (
                          <tr key={appo.id} className="hover:bg-surface-soft/30 transition-colors group">
                            <td className="px-6 py-5">
                               <div className="flex flex-col">
                                  <span className="text-xs font-black text-main">{new Date(appo.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span className="text-[9px] text-tertiary font-bold">{new Date(appo.start_time).toLocaleDateString('pt-BR')}</span>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <span className="text-xs font-bold text-main">{appo.patient_name || "Paciente"}</span>
                            </td>
                            <td className="px-6 py-5">
                               {prof ? (
                                 <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: prof.calendar_color }} />
                                    <span className="text-xs font-medium text-secondary">{prof.name}</span>
                                 </div>
                               ) : <span className="text-xs text-tertiary italic">Não atribuído</span>}
                            </td>
                            <td className="px-6 py-5">
                               <Pill color={appo.status === 'scheduled' ? '#10B981' : '#94A3B8'} bg={appo.status === 'scheduled' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)'}>
                                 {appo.status}
                               </Pill>
                            </td>
                          </tr>
                        );
                      })}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-xs text-tertiary italic">Nenhum agendamento encontrado.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>
      </div>

      {/* Modal CRUD Profissional */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <Card className="w-full max-w-md animate-zoom-in">
            <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center bg-surface-soft/30">
              <h4 className="text-lg font-black text-main tracking-tight">{editing ? "Editar Profissional" : "Novo Profissional"}</h4>
              <button onClick={() => setShowModal(false)} className="text-tertiary hover:text-main"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
              <Inp label="Nome Completo *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Ex: Dra. Ana Paula" />
              <Inp label="Gmail do Google Calendar *" value={form.google_calendar_email} onChange={v => setForm(p => ({ ...p, google_calendar_email: v }))} placeholder="exemplo@gmail.com" />
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-tertiary uppercase tracking-widest ml-1">Cor na Agenda</label>
                <div className="flex gap-3">
                  {COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setForm(p => ({ ...p, calendar_color: c }))}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${form.calendar_color === c ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent opacity-60'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                <Btn disabled={loading || !form.name || !form.google_calendar_email} onClick={save} className="flex-1">
                  {loading ? "Salvando..." : "Salvar Profissional"}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
