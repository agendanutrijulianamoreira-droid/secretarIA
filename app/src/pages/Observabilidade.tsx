import { useState } from 'react'
import {
  Activity, RefreshCw, AlertCircle, CheckCircle2, XCircle,
  Loader2, Wifi, WifiOff, Clock, MessageSquare, Zap,
  CheckSquare, ChevronDown, ChevronRight, Filter
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useObservabilidade, statusCor } from '../hooks/useObservabilidade'
import type { WebhookLog, WorkflowErro, HealthCheck, SaudeTenant } from '../hooks/useObservabilidade'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ─── Aba tipos ────────────────────────────────────────────────────────────────
type Aba = 'webhooks' | 'erros' | 'saude'

// ─── Componente principal ─────────────────────────────────────────────────────

export function Observabilidade() {
  const { profile } = useAuth()
  const obs = useObservabilidade()
  const [aba, setAba] = useState<Aba>('webhooks')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  if (profile && !profile.is_admin) return <Navigate to="/dashboard" replace />

  if (obs.loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={28} className="animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity size={20} className="text-purple-600" />
              Observabilidade
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Logs de webhook, erros de workflow e saúde do sistema</p>
          </div>
          <button
            onClick={obs.refetch}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>

        {/* KPIs rápidos */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <KpiObs
            label="Webhooks (200 últimos)"
            valor={obs.webhookLogs.length}
            sub={`${obs.webhookLogs.filter(w => w.status_processamento === 'error').length} com erro`}
            cor={obs.webhookLogs.filter(w => w.status_processamento === 'error').length > 0 ? 'text-red-600' : 'text-gray-700'}
          />
          <KpiObs
            label="Erros de workflow"
            valor={obs.totalErrosAbertos}
            sub="não resolvidos"
            cor={obs.totalErrosAbertos > 0 ? 'text-red-600' : 'text-green-700'}
          />
          <KpiObs
            label="Tenants conectados"
            valor={obs.saudeTenants.filter(t => t.wa_conectado).length}
            sub={`de ${obs.saudeTenants.length} cadastrados`}
            cor="text-purple-700"
          />
          <KpiObs
            label="Health checks"
            valor={obs.healthChecks.filter(h => h.status === 'ok').length}
            sub={`${obs.healthChecks.filter(h => h.status === 'erro').length} com erro`}
            cor={obs.healthChecks.filter(h => h.status === 'erro').length > 0 ? 'text-red-600' : 'text-green-700'}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-gray-200 -mx-6 px-6">
          {([
            { id: 'webhooks', label: 'Webhooks', badge: obs.webhookLogs.filter(w => w.status_processamento === 'error').length },
            { id: 'erros',    label: 'Erros de Workflow', badge: obs.totalErrosAbertos },
            { id: 'saude',    label: 'Saúde do Sistema', badge: 0 },
          ] as Array<{ id: Aba; label: string; badge: number }>).map(({ id, label, badge }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                aba === id
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
              {badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div className="flex-1 overflow-auto">
        {aba === 'webhooks' && (
          <TabelaWebhooks
            logs={obs.webhookLogs}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
          />
        )}
        {aba === 'erros' && (
          <TabelaErros erros={obs.workflowErros} onResolver={obs.resolverErro} />
        )}
        {aba === 'saude' && (
          <PainelSaude tenants={obs.saudeTenants} healthChecks={obs.healthChecks} />
        )}
      </div>
    </div>
  )
}

// ─── KPI rápido ───────────────────────────────────────────────────────────────

function KpiObs({ label, valor, sub, cor }: { label: string; valor: number; sub: string; cor: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${cor}`}>{valor}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}

// ─── Tabela de Webhooks ───────────────────────────────────────────────────────

function TabelaWebhooks({
  logs,
  filtroStatus,
  setFiltroStatus,
}: {
  logs: WebhookLog[]
  filtroStatus: string
  setFiltroStatus: (s: string) => void
}) {
  const STATUS_OPCOES = [
    'todos', 'received', 'processed', 'ignored', 'error',
    'tenant_nao_encontrado', 'ia_pausada',
  ]

  const filtrados = filtroStatus === 'todos'
    ? logs
    : logs.filter(l => l.status_processamento === filtroStatus)

  return (
    <div>
      {/* Filtro */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">Status:</span>
        {STATUS_OPCOES.map(s => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              filtroStatus === s
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {s === 'todos' ? 'Todos' : s.replace(/_/g, ' ')}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{filtrados.length} eventos</span>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={32} className="text-gray-300" />}
          msg="Nenhum evento de webhook registrado ainda"
          sub="Quando o n8n processar mensagens, elas aparecerão aqui"
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Evento</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Contato</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Preview</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Tempo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Recebido</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(log => (
              <LinhaWebhook key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function LinhaWebhook({ log }: { log: WebhookLog }) {
  const [expandido, setExpandido] = useState(false)
  const cor = statusCor(log.status_processamento)

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpandido(v => !v)}
      >
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            {expandido ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
            <span className="text-xs font-mono text-gray-600">{log.evento}</span>
            {log.tipo_conteudo && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {log.tipo_conteudo}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-2.5">
          <p className="text-xs text-gray-700 font-mono">
            {log.phone_contato?.replace('@s.whatsapp.net', '') || '—'}
          </p>
          {log.wa_phone_number_id && (
            <p className="text-[10px] text-gray-400 truncate max-w-24" title={log.wa_phone_number_id}>
              {log.wa_phone_number_id.slice(-6)}…
            </p>
          )}
        </td>
        <td className="px-4 py-2.5 max-w-xs">
          <p className="text-xs text-gray-600 truncate">
            {log.conteudo_preview || <span className="text-gray-300 italic">—</span>}
          </p>
        </td>
        <td className="px-4 py-2.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cor}`}>
            {log.status_processamento.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-4 py-2.5">
          <span className="text-xs text-gray-500">
            {log.duracao_ms != null ? `${log.duracao_ms}ms` : '—'}
          </span>
        </td>
        <td className="px-4 py-2.5">
          <p className="text-xs text-gray-500" title={log.created_at}>
            {formatDistanceToNow(new Date(log.created_at), { locale: ptBR, addSuffix: true })}
          </p>
          <p className="text-[10px] text-gray-400">
            {format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}
          </p>
        </td>
      </tr>
      {expandido && log.erro_detalhe && (
        <tr className="bg-red-50 border-b border-red-100">
          <td colSpan={6} className="px-4 py-2">
            <p className="text-xs font-semibold text-red-700 mb-1">Detalhe do erro:</p>
            <pre className="text-xs text-red-600 whitespace-pre-wrap font-mono">{log.erro_detalhe}</pre>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Tabela de Erros de Workflow ──────────────────────────────────────────────

function TabelaErros({ erros, onResolver }: { erros: WorkflowErro[]; onResolver: (id: number) => Promise<void> }) {
  const [resolvendo, setResolvendo] = useState<Set<number>>(new Set())
  const [mostrarResolvidos, setMostrarResolvidos] = useState(false)

  const filtrados = mostrarResolvidos ? erros : erros.filter(e => !e.resolvido)

  async function handleResolver(id: number) {
    setResolvendo(prev => new Set(prev).add(id))
    await onResolver(id)
    setResolvendo(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  return (
    <div>
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mostrarResolvidos}
            onChange={e => setMostrarResolvidos(e.target.checked)}
            className="accent-purple-600"
          />
          Mostrar erros resolvidos
        </label>
        <span className="ml-auto text-xs text-gray-400">{filtrados.length} erro{filtrados.length !== 1 ? 's' : ''}</span>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={32} className="text-green-300" />}
          msg={mostrarResolvidos ? "Nenhum erro registrado" : "Nenhum erro aberto"}
          sub="Os erros capturados pelos workflows aparecerão aqui"
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {filtrados.map(erro => (
            <ItemErro
              key={erro.id}
              erro={erro}
              resolvendo={resolvendo.has(erro.id)}
              onResolver={() => handleResolver(erro.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemErro({
  erro, resolvendo, onResolver,
}: {
  erro: WorkflowErro
  resolvendo: boolean
  onResolver: () => void
}) {
  const [expandido, setExpandido] = useState(false)

  return (
    <div className={`px-6 py-4 ${erro.resolvido ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {erro.resolvido
              ? <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              : <XCircle size={14} className="text-red-500 shrink-0" />
            }
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
              {erro.workflow_nome}
            </span>
            {erro.node_nome && (
              <span className="text-xs text-gray-500 font-mono">
                → {erro.node_nome}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 font-medium truncate">{erro.mensagem_erro}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDistanceToNow(new Date(erro.created_at), { locale: ptBR, addSuffix: true })}
            </span>
            {erro.execucao_id && (
              <span className="font-mono">exec: {erro.execucao_id.slice(-8)}</span>
            )}
            {erro.resolvido && erro.resolvido_em && (
              <span className="text-green-600">
                Resolvido {formatDistanceToNow(new Date(erro.resolvido_em), { locale: ptBR, addSuffix: true })}
                {erro.resolvido_por && ` por ${erro.resolvido_por}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {erro.payload && (
            <button
              onClick={() => setExpandido(v => !v)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ChevronDown size={12} className={`transition-transform ${expandido ? 'rotate-180' : ''}`} />
              Payload
            </button>
          )}
          {!erro.resolvido && (
            <button
              onClick={onResolver}
              disabled={resolvendo}
              className="flex items-center gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {resolvendo
                ? <Loader2 size={11} className="animate-spin" />
                : <CheckSquare size={11} />
              }
              Resolver
            </button>
          )}
        </div>
      </div>

      {expandido && erro.payload && (
        <div className="mt-3 bg-gray-900 rounded-xl p-3 overflow-x-auto">
          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
            {JSON.stringify(erro.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Painel de Saúde ──────────────────────────────────────────────────────────

function PainelSaude({ tenants, healthChecks }: { tenants: SaudeTenant[]; healthChecks: HealthCheck[] }) {
  // Agrupa health checks por componente (último de cada)
  const ultimoPorComponente: Record<string, HealthCheck> = {}
  healthChecks.forEach(hc => {
    if (!ultimoPorComponente[hc.componente]) {
      ultimoPorComponente[hc.componente] = hc
    }
  })

  const componentes = Object.values(ultimoPorComponente)

  return (
    <div className="p-6 space-y-6 max-w-4xl">

      {/* Status dos componentes */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Componentes do Sistema</h3>
        {componentes.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
            Nenhum health check registrado ainda. O workflow de health check roda a cada 6 horas.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {componentes.map(hc => (
              <ComponenteCard key={hc.componente} hc={hc} />
            ))}
          </div>
        )}
      </div>

      {/* Saúde por tenant */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Status por Nutricionista</h3>
        {tenants.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500">
            Sem dados de saúde disponíveis
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Nutricionista</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Webhooks 24h</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Erros</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Último msg</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(t => (
                  <tr key={t.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-800">{t.nome_profissional || 'Sem nome'}</p>
                      <p className="text-xs text-gray-400 capitalize">{t.plano}{t.plano_ativo ? '' : ' (inativo)'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {t.wa_conectado
                          ? <Wifi size={14} className="text-green-500" />
                          : <WifiOff size={14} className="text-red-400" />
                        }
                        <span className={`text-xs ${t.wa_conectado ? 'text-green-700' : 'text-red-500'}`}>
                          {t.wa_conectado ? (t.wa_numero_display || 'Conectado') : 'Desconectado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${t.webhooks_24h > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                        {t.webhooks_24h}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.erros_webhook_24h > 0 || t.erros_workflow_abertos > 0 ? (
                        <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle size={12} />
                          {t.erros_webhook_24h + t.erros_workflow_abertos}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 size={12} />
                          Nenhum
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {t.ultimo_webhook_recebido
                          ? formatDistanceToNow(new Date(t.ultimo_webhook_recebido), { locale: ptBR, addSuffix: true })
                          : <span className="text-gray-400">Nunca</span>
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico de health checks */}
      {healthChecks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico de Health Checks</h3>
          <div className="space-y-1.5">
            {healthChecks.slice(0, 20).map(hc => (
              <div key={hc.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2">
                <StatusIcone status={hc.status} />
                <span className="text-sm font-medium text-gray-700 w-24 shrink-0 capitalize">{hc.componente}</span>
                {hc.latencia_ms != null && (
                  <span className="text-xs text-gray-500 w-16 shrink-0">{hc.latencia_ms}ms</span>
                )}
                <span className="text-xs text-gray-400 flex-1 truncate">{hc.detalhe}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {format(new Date(hc.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ComponenteCard({ hc }: { hc: HealthCheck }) {
  const cor = hc.status === 'ok'
    ? 'bg-green-50 border-green-200'
    : hc.status === 'degradado'
    ? 'bg-yellow-50 border-yellow-200'
    : 'bg-red-50 border-red-200'

  return (
    <div className={`border rounded-xl p-4 ${cor}`}>
      <div className="flex items-center justify-between mb-2">
        <StatusIcone status={hc.status} />
        <span className="text-[10px] text-gray-400">
          {formatDistanceToNow(new Date(hc.created_at), { locale: ptBR, addSuffix: true })}
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-700 capitalize">{hc.componente}</p>
      {hc.latencia_ms != null && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <Zap size={10} />
          {hc.latencia_ms}ms
        </p>
      )}
    </div>
  )
}

function StatusIcone({ status }: { status: string }) {
  if (status === 'ok')       return <CheckCircle2 size={14} className="text-green-500" />
  if (status === 'degradado') return <AlertCircle size={14} className="text-yellow-500" />
  return <XCircle size={14} className="text-red-500" />
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon, msg, sub }: { icon: React.ReactNode; msg: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 opacity-50">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{msg}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-xs">{sub}</p>
    </div>
  )
}
