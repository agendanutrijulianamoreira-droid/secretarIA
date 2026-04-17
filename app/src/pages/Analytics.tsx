import { RefreshCw, TrendingUp, Users, CalendarCheck, Star, ShieldAlert, Send, Bot, Loader2, AlertCircle } from 'lucide-react'
import { useAnalytics } from '../hooks/useAnalytics'
import type { FunilEtapa, SemanaLead, NpsDistribuicao, EtiquetaStats } from '../hooks/useAnalytics'

// ─── Página principal ─────────────────────────────────────────────────────────

export function Analytics() {
  const dados = useAnalytics()

  if (dados.loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={28} className="animate-spin text-purple-600" />
      </div>
    )
  }

  if (dados.erro) {
    return (
      <div className="flex h-full items-center justify-center flex-col gap-3 text-gray-500">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm">{dados.erro}</p>
        <button
          onClick={dados.refetch}
          className="text-xs text-purple-600 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">Visão estratégica do atendimento</p>
          </div>
          <button
            onClick={dados.refetch}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>

        {/* KPIs principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Users size={18} />}
            titulo="Total de Contatos"
            valor={dados.totalContatos}
            cor="blue"
          />
          <KpiCard
            icon={<TrendingUp size={18} />}
            titulo="Leads → Consulta"
            valor={`${dados.taxaConversaoLeadConsulta}%`}
            subtitulo="taxa de conversão"
            cor="emerald"
          />
          <KpiCard
            icon={<CalendarCheck size={18} />}
            titulo="Consulta → Paciente"
            valor={`${dados.taxaConversaoConsultaPaciente}%`}
            subtitulo="taxa de fechamento"
            cor="purple"
          />
          <KpiCard
            icon={<Bot size={18} />}
            titulo="Atendido pela IA"
            valor={`${dados.iaPorcentagem}%`}
            subtitulo="em andamento"
            cor="green"
          />
        </div>

        {/* Funil + Gráfico semanal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Funil etapas={dados.funil} />
          <GraficoSemanal semanas={dados.leadsSemanais} />
        </div>

        {/* NPS + Distribuição */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NpsCard nps={dados.nps} />
          <DistribuicaoEtiquetas stats={dados.etiquetaStats} />
        </div>

        {/* Métricas operacionais */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricaCard
            icon={<ShieldAlert size={18} className="text-red-500" />}
            titulo="Tentativas de Jailbreak"
            valor={dados.totalJailbreaks}
            descricao="mensagens bloqueadas"
            corValor={dados.totalJailbreaks > 0 ? 'text-red-600' : 'text-gray-700'}
          />
          <MetricaCard
            icon={<Send size={18} className="text-orange-500" />}
            titulo="Follow-ups Enviados"
            valor={dados.totalFollowupEnviados}
            descricao="mensagens automáticas"
            corValor="text-orange-600"
          />
          <MetricaCard
            icon={<Star size={18} className="text-yellow-500" />}
            titulo="Pacientes Ativas"
            valor={dados.totalPacientesAtivos}
            descricao={`de ${dados.totalContatos} contatos`}
            corValor="text-purple-600"
          />
        </div>

      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  titulo,
  valor,
  subtitulo,
  cor,
}: {
  icon: React.ReactNode
  titulo: string
  valor: string | number
  subtitulo?: string
  cor: 'blue' | 'emerald' | 'purple' | 'green'
}) {
  const estilos = {
    blue:    { card: 'bg-blue-50 border-blue-200',     icon: 'bg-blue-100 text-blue-600',    texto: 'text-blue-700' },
    emerald: { card: 'bg-emerald-50 border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', texto: 'text-emerald-700' },
    purple:  { card: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100 text-purple-600', texto: 'text-purple-700' },
    green:   { card: 'bg-green-50 border-green-200',   icon: 'bg-green-100 text-green-600',   texto: 'text-green-700' },
  }
  const s = estilos[cor]
  return (
    <div className={`rounded-2xl border p-5 ${s.card}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.icon}`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1">{titulo}</p>
      <p className={`text-3xl font-bold ${s.texto}`}>{valor}</p>
      {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
    </div>
  )
}

// ─── Funil de Conversão ───────────────────────────────────────────────────────

function Funil({ etapas }: { etapas: FunilEtapa[] }) {
  const cores = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500']
  const max = Math.max(...etapas.map((e) => e.total), 1)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-5">Funil de Conversão</h3>
      <div className="space-y-4">
        {etapas.map((etapa, i) => (
          <div key={etapa.etiqueta}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">{etapa.label}</span>
              <span className="text-xs text-gray-400 font-semibold">{etapa.total}</span>
            </div>
            <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700 ${cores[i]}`}
                style={{ width: `${Math.max((etapa.total / max) * 100, etapa.total > 0 ? 4 : 0)}%` }}
              >
                {etapa.total > 0 && (
                  <span className="text-white text-xs font-bold">
                    {pct(etapa.total, max)}%
                  </span>
                )}
              </div>
            </div>
            {i < etapas.length - 1 && etapas[i + 1].total > 0 && (
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                → {pct(etapas[i + 1].total, etapa.total)}% avançaram
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function pct(parte: number, total: number) {
  if (!total) return 0
  return Math.round((parte / total) * 100)
}

// ─── Gráfico de Leads Semanais ────────────────────────────────────────────────

function GraficoSemanal({ semanas }: { semanas: SemanaLead[] }) {
  const maxVal = Math.max(...semanas.map((s) => s.total), 1)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-5">Novos Leads por Semana</h3>
      <div className="flex items-end gap-2 h-36">
        {semanas.map((semana, i) => {
          const altura = Math.max((semana.total / maxVal) * 100, semana.total > 0 ? 5 : 0)
          const isUltima = i === semanas.length - 1
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-600">
                {semana.total > 0 ? semana.total : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${isUltima ? 'bg-purple-500' : 'bg-purple-200'}`}
                  style={{ height: `${altura}%` }}
                />
              </div>
              <span className="text-[9px] text-gray-400 text-center leading-tight">{semana.label}</span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4 text-right">últimas 8 semanas</p>
    </div>
  )
}

// ─── NPS ──────────────────────────────────────────────────────────────────────

function NpsCard({ nps }: { nps: NpsDistribuicao }) {
  const total = nps.total || 1
  const pctPromo = pct(nps.promotores, total)
  const pctNeutro = pct(nps.neutros, total)
  const pctDetra = pct(nps.detratores, total)
  const scoreNps = nps.total ? pctPromo - pctDetra : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-700">NPS — Satisfação</h3>
        {scoreNps !== null && (
          <div className={`text-2xl font-bold ${scoreNps >= 50 ? 'text-emerald-600' : scoreNps >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
            {scoreNps > 0 ? '+' : ''}{scoreNps}
          </div>
        )}
      </div>

      {nps.total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Ainda sem avaliações registradas</p>
      ) : (
        <>
          {/* Barra NPS */}
          <div className="h-5 rounded-full overflow-hidden flex mb-4">
            <div className="bg-emerald-400 transition-all" style={{ width: `${pctPromo}%` }} />
            <div className="bg-yellow-300 transition-all" style={{ width: `${pctNeutro}%` }} />
            <div className="bg-red-400 transition-all" style={{ width: `${pctDetra}%` }} />
          </div>

          {/* Legenda */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Promotores</p>
              <p className="text-sm font-bold text-emerald-600">{nps.promotores}</p>
              <p className="text-[10px] text-gray-400">(9–10)</p>
            </div>
            <div>
              <div className="w-3 h-3 rounded-full bg-yellow-300 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Neutros</p>
              <p className="text-sm font-bold text-yellow-600">{nps.neutros}</p>
              <p className="text-[10px] text-gray-400">(7–8)</p>
            </div>
            <div>
              <div className="w-3 h-3 rounded-full bg-red-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Detratores</p>
              <p className="text-sm font-bold text-red-600">{nps.detratores}</p>
              <p className="text-[10px] text-gray-400">(0–6)</p>
            </div>
          </div>

          {nps.media !== null && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Nota média: <span className="font-semibold text-gray-600">{nps.media}/10</span>
              {' '}· {nps.total} avaliações
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ─── Distribuição por Etiqueta ────────────────────────────────────────────────

function DistribuicaoEtiquetas({ stats }: { stats: EtiquetaStats[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-5">Distribuição por Status</h3>
      {stats.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Sem dados</p>
      ) : (
        <div className="space-y-3">
          {stats.map((s) => (
            <div key={s.etiqueta}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">{s.label}</span>
                <span className="text-xs font-semibold text-gray-700">{s.total}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.cor} transition-all duration-700`}
                  style={{ width: `${Math.max(s.pct, s.total > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Métrica operacional ──────────────────────────────────────────────────────

function MetricaCard({
  icon,
  titulo,
  valor,
  descricao,
  corValor,
}: {
  icon: React.ReactNode
  titulo: string
  valor: number
  descricao: string
  corValor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-xs font-medium text-gray-500">{titulo}</p>
      </div>
      <p className={`text-3xl font-bold ${corValor}`}>{valor}</p>
      <p className="text-xs text-gray-400 mt-1">{descricao}</p>
    </div>
  )
}
