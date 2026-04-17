import { useState } from 'react'
import { AlertTriangle, Zap, X } from 'lucide-react'
import { useTrialStatus } from '../hooks/useTrialStatus'

// ─── Banner de trial expirando ────────────────────────────────────────────────

export function BannerTrial() {
  const { mostrarAlerta, trialExpirado, diasRestantes, critico } = useTrialStatus()
  const [fechado, setFechado] = useState(false)

  if (!mostrarAlerta || fechado) return null

  const textoAlerta = trialExpirado
    ? 'Seu período de trial expirou. Ative um plano para continuar usando a SecretarIA.'
    : diasRestantes === 0
    ? 'Seu trial expira hoje! Ative um plano para não perder o acesso.'
    : `Seu trial expira em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}. Aproveite agora!`

  return (
    <div
      className={`flex items-center gap-3 px-5 py-2.5 text-sm shrink-0 ${
        critico
          ? 'bg-red-50 border-b border-red-200 text-red-800'
          : 'bg-amber-50 border-b border-amber-200 text-amber-800'
      }`}
    >
      <AlertTriangle
        size={15}
        className={`shrink-0 ${critico ? 'text-red-500' : 'text-amber-500'}`}
      />

      <span className="flex-1 leading-snug">{textoAlerta}</span>

      <a
        href="https://wa.me/5511999999999?text=Oi!+Quero+ativar+um+plano+da+SecretarIA+Nutri"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
          critico
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-amber-500 hover:bg-amber-600 text-white'
        }`}
      >
        <Zap size={12} />
        Ativar plano
      </a>

      {!trialExpirado && (
        <button
          onClick={() => setFechado(true)}
          title="Fechar"
          className={`p-0.5 rounded hover:bg-black/5 transition-colors ${
            critico ? 'text-red-400' : 'text-amber-400'
          }`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
