import { useContatos, useNotificacoes } from '../hooks/useContatos'
import { ETIQUETA_CONFIG, ETIQUETAS_ORDEM } from '../lib/constants'
import { useAuth } from '../contexts/AuthContext'
import type { EtiquetaContato } from '../lib/supabase'

export function Dashboard() {
  const { contatos, loading } = useContatos()
  const { naoLidas } = useNotificacoes()
  const { profile } = useAuth()

  const contagem = ETIQUETAS_ORDEM.reduce(
    (acc, e) => {
      acc[e] = contatos.filter((c) => c.etiqueta === e).length
      return acc
    },
    {} as Record<EtiquetaContato, number>
  )

  const totalAtivos = contatos.filter((c) => c.status === 'PACIENTE_ATIVO').length
  const totalLeads = contatos.filter((c) => c.status === 'LEAD').length
  const aguardandoHumano = contatos.filter((c) => c.ia_pausada).length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500 mt-1">
          {profile?.nome_profissional
            ? `Painel de atendimento — ${profile.nome_profissional}`
            : 'Painel de atendimento — SecretarIA Nutri'}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ResumoCard titulo="Aguard. Humano" valor={aguardandoHumano} cor="yellow" urgente />
        <ResumoCard titulo="Pacientes Ativas" valor={totalAtivos} cor="purple" />
        <ResumoCard titulo="Leads Ativos" valor={totalLeads} cor="blue" />
        <ResumoCard titulo="Notif. Não Lidas" valor={naoLidas} cor="red" urgente={naoLidas > 0} />
      </div>

      {/* Kanban por etiqueta */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Conversas por Status</h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Carregando...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ETIQUETAS_ORDEM.map((etiqueta) => {
            const cfg = ETIQUETA_CONFIG[etiqueta]
            const qtd = contagem[etiqueta] || 0
            return (
              <div
                key={etiqueta}
                className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
              >
                <p className={`text-xs font-medium mb-1 ${cfg.cor}`}>{cfg.label}</p>
                <p className={`text-3xl font-bold ${cfg.cor}`}>{qtd}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ResumoCard({
  titulo,
  valor,
  cor,
  urgente,
}: {
  titulo: string
  valor: number
  cor: string
  urgente?: boolean
}) {
  const cores: Record<string, string> = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }
  return (
    <div className={`rounded-xl border p-5 ${cores[cor]} ${urgente && valor > 0 ? 'ring-2 ring-offset-1 ring-current' : ''}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{titulo}</p>
      <p className="text-4xl font-bold">{valor}</p>
    </div>
  )
}
