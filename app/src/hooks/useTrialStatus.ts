import { useMemo } from 'react'
import { differenceInDays, isPast } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TrialStatus {
  plano: string
  planoAtivo: boolean
  isTrial: boolean
  trialExpirado: boolean
  /** Dias restantes (0 se hoje, null se não é trial ou já expirou) */
  diasRestantes: number | null
  trialExpiraEm: Date | null
  /** true quando ≤7 dias restantes ou já expirado */
  mostrarAlerta: boolean
  /** true quando ≤3 dias ou já expirado */
  critico: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTrialStatus(): TrialStatus {
  const { profile } = useAuth()

  return useMemo((): TrialStatus => {
    const vazio: TrialStatus = {
      plano: 'trial',
      planoAtivo: false,
      isTrial: true,
      trialExpirado: false,
      diasRestantes: null,
      trialExpiraEm: null,
      mostrarAlerta: false,
      critico: false,
    }

    if (!profile) return vazio

    const isTrial = profile.plano === 'trial'

    // Plano pago ativo — sem alertas
    if (!isTrial && profile.plano_ativo) {
      return {
        plano: profile.plano,
        planoAtivo: true,
        isTrial: false,
        trialExpirado: false,
        diasRestantes: null,
        trialExpiraEm: null,
        mostrarAlerta: false,
        critico: false,
      }
    }

    const trialExpiraEm = profile.trial_expira_em
      ? new Date(profile.trial_expira_em)
      : null

    const trialExpirado = trialExpiraEm ? isPast(trialExpiraEm) : false

    const diasRestantes =
      trialExpiraEm && !trialExpirado
        ? Math.max(0, differenceInDays(trialExpiraEm, new Date()))
        : trialExpirado
        ? 0
        : null

    const mostrarAlerta =
      isTrial &&
      (trialExpirado || (diasRestantes !== null && diasRestantes <= 7))

    const critico =
      isTrial &&
      (trialExpirado || (diasRestantes !== null && diasRestantes <= 3))

    return {
      plano: profile.plano,
      planoAtivo: profile.plano_ativo,
      isTrial,
      trialExpirado,
      diasRestantes,
      trialExpiraEm,
      mostrarAlerta,
      critico,
    }
  }, [profile])
}
