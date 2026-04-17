import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bot, User, MessageCircle, AlertTriangle } from 'lucide-react'
import { BadgeEtiqueta } from './BadgeEtiqueta'
import type { Contato } from '../lib/supabase'

interface Props {
  contato: Contato
  onClick: () => void
  ativo?: boolean
}

export function CardContato({ contato, onClick, ativo }: Props) {
  const nome = contato.nome || contato.phone.replace('@s.whatsapp.net', '')
  const tempoAtras = contato.ultima_mensagem
    ? formatDistanceToNow(new Date(contato.ultima_mensagem), { locale: ptBR, addSuffix: true })
    : '—'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        ativo
          ? 'border-[#8B5CF6] bg-purple-50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-sm font-semibold text-purple-700">
            {(contato.nome?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{nome}</p>
            <p className="text-xs text-gray-400">
              {contato.cidade ? `${contato.cidade}/${contato.estado}` : 'Localização não informada'}
            </p>
          </div>
        </div>

        {/* Ícone de turno */}
        <div
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            contato.ia_pausada ? 'bg-yellow-100' : 'bg-green-100'
          }`}
          title={contato.ia_pausada ? 'Atendimento humano' : 'IA ativa'}
        >
          {contato.ia_pausada ? (
            <User size={12} className="text-yellow-600" />
          ) : (
            <Bot size={12} className="text-green-600" />
          )}
        </div>
      </div>

      {/* Queixa */}
      {contato.principal_queixa && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{contato.principal_queixa}</p>
      )}

      {/* Rodapé */}
      <div className="flex items-center justify-between gap-2">
        <BadgeEtiqueta etiqueta={contato.etiqueta} small />
        <div className="flex items-center gap-1.5 text-gray-400">
          {contato.tentativa_jailbreak && (
            <AlertTriangle size={12} className="text-red-400" title="Tentativa de jailbreak" />
          )}
          <MessageCircle size={12} />
          <span className="text-xs">{contato.total_mensagens}</span>
          <span className="text-xs">·</span>
          <span className="text-xs">{tempoAtras}</span>
        </div>
      </div>
    </button>
  )
}
