import { useState, useEffect } from 'react';
import {
  Bot, Crown, HelpCircle, Phone, RefreshCw, Heart, TrendingUp,
  ChevronRight, X, Save,
} from 'lucide-react';
import { PageTitle, Btn, Card, Inp } from '../../components/shared/ClientUI';
import { AgenteConfigs } from '../../lib/db';
import { AGENT_TYPES } from '../../design-system/tokens';

const TIPO_ICON = {
  gerente_geral: Crown, faq: HelpCircle, recepcionista: Phone,
  follow_up: RefreshCw, acompanhamento: Heart, vendedor: TrendingUp,
};

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-all cursor-pointer shrink-0 ${on ? 'bg-primary' : 'bg-surface-up border border-border-subtle'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function ConfigRow({ label, sub, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-up/30 border border-border-subtle">
      <div>
        <p className="text-xs font-black text-main">{label}</p>
        <p className="text-[10px] text-tertiary mt-0.5">{sub}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

export default function AgentesView({ client }) {
  const [configs, setConfigs] = useState({});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AgenteConfigs.list(client.id).then(rows => {
      const map = {};
      rows.forEach(r => { map[r.tipo] = r; });
      setConfigs(map);
    });
  }, [client.id]);

  const upsert = async (tipo, data) => {
    const updated = await AgenteConfigs.upsert(client.id, tipo, data);
    setConfigs(p => ({ ...p, [tipo]: updated }));
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { tipo, ...data } = editing;
    await upsert(tipo, data);
    setSaving(false);
    setEditing(null);
  };

  const openEdit = (agent, cfg) => setEditing({
    tipo: agent.tipo,
    nome: cfg.nome || '',
    instrucoes: cfg.instrucoes || '',
    pode_agendar: !!cfg.pode_agendar,
    escalar_para_humano: cfg.escalar_para_humano !== false,
  });

  return (
    <div className="space-y-8">
      <PageTitle icon={Bot} title="Agentes IA" subtitle="Configure cada agente de atendimento da sua clínica" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {AGENT_TYPES.map(agent => {
          const Icon = TIPO_ICON[agent.tipo] || Bot;
          const cfg = configs[agent.tipo] || {};
          const ativo = cfg.ativo !== false;
          return (
            <Card key={agent.tipo} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${ativo ? 'bg-primary/10 text-primary' : 'bg-surface-up text-tertiary'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-main uppercase tracking-wide">{agent.label}</p>
                    {cfg.nome && <p className="text-[10px] text-primary font-bold mt-0.5">"{cfg.nome}"</p>}
                  </div>
                </div>
                {agent.pode_editar && <Toggle on={ativo} onChange={v => upsert(agent.tipo, { ativo: v })} />}
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">{agent.descricao}</p>
              {agent.pode_editar && (
                <button
                  onClick={() => openEdit(agent, cfg)}
                  className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline cursor-pointer"
                >
                  Configurar <ChevronRight size={12} />
                </button>
              )}
            </Card>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
          <Card className="w-full max-w-lg p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-main uppercase tracking-wide">
                {AGENT_TYPES.find(a => a.tipo === editing.tipo)?.label}
              </h4>
              <button onClick={() => setEditing(null)} className="h-8 w-8 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <Inp label="Codinome (opcional)" value={editing.nome} onChange={v => setEditing(p => ({ ...p, nome: v }))} placeholder='"Ana", "Max"…' />
            <Inp label="Instruções personalizadas" value={editing.instrucoes} onChange={v => setEditing(p => ({ ...p, instrucoes: v }))} placeholder="O que este agente pode ou não pode dizer…" rows={4} />
            <ConfigRow label="Pode agendar?" sub="Autorizar criação de agendamentos" on={editing.pode_agendar} onChange={v => setEditing(p => ({ ...p, pode_agendar: v }))} />
            <ConfigRow label="Escalar para humano?" sub="Chamar atendente quando necessário" on={editing.escalar_para_humano} onChange={v => setEditing(p => ({ ...p, escalar_para_humano: v }))} />
            <Btn onClick={save} disabled={saving} icon={Save} className="w-full">{saving ? 'Salvando…' : 'Salvar'}</Btn>
          </Card>
        </div>
      )}
    </div>
  );
}
