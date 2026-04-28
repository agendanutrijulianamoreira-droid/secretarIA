import { useState, useEffect } from "react";
import { 
  Users, Plus, X, Edit2, Trash2, Calendar, 
  Clock, Mail, ChevronRight, Activity, CalendarDays, CheckCircle2
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
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <PageTitle 
          icon={Users} 
          title="Equipe & Agenda" 
          subtitle="Gerencie seus profissionais e visualize a agenda unificada da clínica." 
        />
        <Btn onClick={() => { setEditing(null); setForm({ name: "", google_calendar_email: "", calendar_color: "#10B981" }); setShowModal(true); }} icon={Plus}>
          Novo Profissional
        </Btn>
      </div>

      {/* Grid de Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {professionals.map(p => (
          <Card key={p.id} className="group border-l-4" style={{ borderLeftColor: p.calendar_color }}>
            <div className="flex justify-between items-start mb-6">
              <div className="h-14 w-14 rounded-2xl bg-surface-up/50 flex items-center justify-center text-xl shadow-inner font-black text-main border border-border-subtle group-hover:scale-105 transition-transform duration-500">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => startEdit(p)} className="p-2.5 rounded-xl bg-surface-up border border-border-subtle text-tertiary hover:text-primary transition-colors cursor-pointer"><Edit2 size={14} /></button>
                <button onClick={() => remove(p.id)} className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-tertiary hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
              </div>
            </div>
            <h4 className="text-base font-black text-main uppercase tracking-tight">{p.name}</h4>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-tertiary font-bold tracking-widest uppercase">
              <Mail size={12} className="text-primary" /> {p.google_calendar_email}
            </div>
          </Card>
        ))}
        {professionals.length === 0 && (
          <div className="md:col-span-3 py-20 rounded-[40px] border border-dashed border-border-subtle flex flex-col items-center text-center opacity-40">
            <Users size={64} strokeWidth={1} className="text-tertiary mb-6" />
            <h4 className="text-sm font-black text-secondary uppercase tracking-[0.2em]">Nenhum profissional cadastrado</h4>
            <p className="text-xs text-tertiary mt-2">Sua clínica precisa de profissionais para gerenciar a agenda.</p>
          </div>
        )}
      </div>

      {/* Agenda Unificada Bento Grid */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <CalendarDays size={20} strokeWidth={2.5} />
           </div>
           <h3 className="text-xl font-black tracking-tight text-main uppercase">Agenda Unificada</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-1 p-10 bg-primary/5 border-primary/20 flex flex-col justify-center text-center group">
             <div className="premium-glow" />
             <h2 className="text-7xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform duration-700">{appointments.filter(a => a.status === 'scheduled').length}</h2>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-4">Compromissos</p>
          </Card>

          <Card className="lg:col-span-3 p-0">
             <CardHeader 
                title="Cronograma de Atendimentos" 
                subtitle="Fluxo de consultas sincronizado em tempo real." 
             />
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-surface-up/30 border-b border-border-subtle">
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Janela</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Paciente</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Especialista</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border-subtle/50">
                      {appointments.map(appo => {
                        const prof = professionals.find(p => p.id === appo.professional_id);
                        return (
                          <tr key={appo.id} className="hover:bg-surface-up/20 transition-all cursor-pointer group">
                            <td className="px-8 py-6">
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-main">{new Date(appo.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span className="text-[10px] text-tertiary font-bold mt-1">{new Date(appo.start_time).toLocaleDateString('pt-BR')}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-sm font-bold text-main group-hover:text-primary transition-colors">{appo.patient_name || "Paciente"}</span>
                            </td>
                            <td className="px-8 py-6">
                               {prof ? (
                                 <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full shadow-lg" style={{ backgroundColor: prof.calendar_color, boxShadow: `0 0 10px ${prof.calendar_color}` }} />
                                    <span className="text-xs font-black text-secondary uppercase tracking-tight">{prof.name}</span>
                                 </div>
                               ) : <span className="text-xs text-tertiary italic">Pendente</span>}
                            </td>
                            <td className="px-8 py-6">
                               <Pill color={appo.status === 'scheduled' ? '#10B981' : '#94A3B8'} bg={appo.status === 'scheduled' ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)'}>
                                 {appo.status}
                               </Pill>
                            </td>
                          </tr>
                        );
                      })}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-16 text-center text-xs text-tertiary italic font-medium">Sua agenda está livre para novos agendamentos.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </Card>
        </div>
      </div>

      {/* Modal CRUD Profissional Refactored */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-8">
          <Card className="w-full max-w-xl animate-fade-in p-0">
            <div className="px-10 py-8 border-b border-border-subtle flex justify-between items-center bg-surface-up/30">
              <h4 className="text-xl font-black text-main tracking-tighter uppercase">{editing ? "Editar Perfil" : "Novo Especialista"}</h4>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-10 space-y-8">
              <Inp label="Nome Profissional *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Ex: Dr. Roberto Silva" />
              <Inp label="Google Calendar ID *" value={form.google_calendar_email} onChange={v => setForm(p => ({ ...p, google_calendar_email: v }))} placeholder="roberto@gmail.com" />
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em] ml-1">Assinatura Visual</label>
                <div className="flex flex-wrap gap-4">
                  {COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setForm(p => ({ ...p, calendar_color: c }))}
                      className={`h-10 w-10 rounded-2xl border-4 transition-all duration-500 cursor-pointer ${form.calendar_color === c ? 'border-primary scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-10 flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-5 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Cancelar</button>
                <Btn disabled={loading || !form.name || !form.google_calendar_email} onClick={save} className="flex-1" icon={CheckCircle2}>
                  {loading ? "Processando..." : "Salvar Perfil"}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
