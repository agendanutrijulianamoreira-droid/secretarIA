import { useState } from 'react'
import { Bell, CheckCheck, User, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useNotificacoes } from '../hooks/useContatos'
import { marcarNotificacaoLida, marcarTodasLidas } from '../lib/supabase'
import type { Notificacao } from '../lib/supabase'

function prioridadeCor(prioridade: string | null) {
  if (prioridade === 'ALTA') return 'border-l-red-500 bg-red-50/50'
  if (prioridade === 'MEDIA') return 'border-l-yellow-500 bg-yellow-50/50'
  return 'border-l-blue-500 bg-blue-50/50'
}

function prioridadeIcone(prioridade: string | null) {
  if (prioridade === 'ALTA') return <AlertTriangle size={14} className="text-red-500" />
  return <Bell size={14} className="text-blue-500" />
}

function CardNotificacao({ notif, onLida }: { notif: Notificacao; onLida: () => void }) {
  const navigate = useNavigate()
  const [marcando, setMarcando] = useState(false)

  async function handleMarcarLida(e: React.MouseEvent) {
    e.stopPropagation()
    setMarcando(true)
    await marcarNotificacaoLida(notif.id)
    onLida()
    setMarcando(false)
  }

  function abrirConversa() {
    navigate(`/conversas?phone=${encodeURIComponent(notif.phone)}`)
  }

  return (
    <div
      className={`border-l-4 border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-sm transition-shadow ${prioridadeCor(notif.prioridade)} ${notif.lida ? 'opacity-60' : ''}`}
      onClick={abrirConversa}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
            <User size={16} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {prioridadeIcone(notif.prioridade)}
              <span className="font-semibold text-sm text-gray-900 truncate">
                {notif.nome_contato || notif.phone}
              </span>
              {!notif.lida && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-700 font-medium">{notif.motivo}</p>
            {notif.mensagem && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.mensagem}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
              <Clock size={12} />
              {formatDistanceToNow(new Date(notif.criado_em), { locale: ptBR, addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!notif.lida && (
            <button
              onClick={handleMarcarLida}
              disabled={marcando}
              title="Marcar como lida"
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <CheckCheck size={16} />
            </button>
          )}
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>
    </div>
  )
}

export function Notificacoes() {
  const { notificacoes, naoLidas } = useNotificacoes()
  const [mostraTodas, setMostraTodas] = useState(false)
  const [marcandoTodas, setMarcandoTodas] = useState(false)

  const visiveis = mostraTodas ? notificacoes : notificacoes.filter((n) => !n.lida)

  async function handleMarcarTodas() {
    setMarcandoTodas(true)
    await marcarTodasLidas()
    setMarcandoTodas(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Alertas</h1>
          {naoLidas > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
              {naoLidas} {naoLidas === 1 ? 'nova' : 'novas'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostraTodas((v) => !v)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {mostraTodas ? 'Ver apenas não lidas' : 'Ver todas'}
          </button>
          {naoLidas > 0 && (
            <button
              onClick={handleMarcarTodas}
              disabled={marcandoTodas}
              className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <CheckCheck size={15} />
              Marcar todas como lidas
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-6">
        {visiveis.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Bell size={40} className="mb-3 opacity-30" />
            <p className="font-medium">
              {mostraTodas ? 'Nenhuma notificação ainda' : 'Nenhum alerta não lido'}
            </p>
            {!mostraTodas && notificacoes.length > 0 && (
              <button
                onClick={() => setMostraTodas(true)}
                className="mt-2 text-sm text-purple-500 hover:underline"
              >
                Ver histórico
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {visiveis.map((n) => (
              <CardNotificacao key={n.id} notif={n} onLida={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
