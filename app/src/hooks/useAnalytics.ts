import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { startOfWeek, subWeeks, format, parseISO, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface FunilEtapa {
  label: string
  etiqueta: string
  total: number
  pct: number
}

export interface SemanaLead {
  label: string        // 'Sem 12'
  inicio: Date
  total: number
}

export interface NpsDistribuicao {
  promotores: number   // 9–10
  neutros: number      // 7–8
  detratores: number   // 0–6
  total: number
  media: number | null
}

export interface EtiquetaStats {
  etiqueta: string
  label: string
  total: number
  pct: number
  cor: string
}

export interface AnalyticsData {
  totalContatos: number
  totalLeads: number
  totalPacientesAtivos: number
  totalConsultasAgendadas: number
  aguardandoHumano: number
  taxaConversaoLeadConsulta: number   // %
  taxaConversaoConsultaPaciente: number // %
  funil: FunilEtapa[]
  leadsSemanais: SemanaLead[]
  nps: NpsDistribuicao
  etiquetaStats: EtiquetaStats[]
  totalJailbreaks: number
  totalFollowupEnviados: number
  iaPorcentagem: number               // % atendimentos pela IA
  loading: boolean
  erro: string | null
  refetch: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(parte: number, total: number) {
  if (!total) return 0
  return Math.round((parte / total) * 100)
}

const ETIQUETA_LABELS: Record<string, { label: string; cor: string }> = {
  NOVO_LEAD:          { label: 'Novo Lead',         cor: 'bg-blue-500' },
  EM_ATENDIMENTO_IA:  { label: 'IA Ativa',           cor: 'bg-green-500' },
  AGUARDANDO_HUMANO:  { label: 'Aguard. Humano',     cor: 'bg-yellow-500' },
  CONSULTA_AGENDADA:  { label: 'Consulta Agendada',  cor: 'bg-emerald-500' },
  PACIENTE_ATIVO:     { label: 'Paciente Ativa',     cor: 'bg-purple-500' },
  FOLLOW_UP_PENDENTE: { label: 'Follow-up Pendente', cor: 'bg-orange-500' },
  INATIVO_30D:        { label: 'Inativa 30d',        cor: 'bg-gray-400' },
  AGUARDANDO_PRECO:   { label: 'Aguard. Preço',      cor: 'bg-red-500' },
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalytics(): AnalyticsData {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dados, setDados] = useState<Omit<AnalyticsData, 'loading' | 'erro' | 'refetch'>>({
    totalContatos: 0,
    totalLeads: 0,
    totalPacientesAtivos: 0,
    totalConsultasAgendadas: 0,
    aguardandoHumano: 0,
    taxaConversaoLeadConsulta: 0,
    taxaConversaoConsultaPaciente: 0,
    funil: [],
    leadsSemanais: [],
    nps: { promotores: 0, neutros: 0, detratores: 0, total: 0, media: null },
    etiquetaStats: [],
    totalJailbreaks: 0,
    totalFollowupEnviados: 0,
    iaPorcentagem: 0,
  })

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const { data: contatos, error } = await supabase
        .from('contatos')
        .select(
          'etiqueta, status, ia_pausada, primeiro_contato, nps_ultima_nota, jailbreak_count, followup_count, turno_atual'
        )

      if (error) throw error
      const lista = contatos || []

      // ── Totais básicos ────────────────────────────────────────────────────
      const totalContatos = lista.length
      const totalLeads = lista.filter((c) => c.status === 'LEAD').length
      const totalPacientesAtivos = lista.filter((c) => c.etiqueta === 'PACIENTE_ATIVO').length
      const totalConsultasAgendadas = lista.filter((c) => c.etiqueta === 'CONSULTA_AGENDADA').length
      const aguardandoHumano = lista.filter((c) => c.ia_pausada).length
      const totalNovoLead = lista.filter((c) => c.etiqueta === 'NOVO_LEAD').length

      // ── Taxas de conversão ────────────────────────────────────────────────
      const leadsOriginais = totalLeads + totalConsultasAgendadas + totalPacientesAtivos
      const taxaConversaoLeadConsulta = pct(totalConsultasAgendadas + totalPacientesAtivos, leadsOriginais)
      const taxaConversaoConsultaPaciente = pct(totalPacientesAtivos, totalConsultasAgendadas + totalPacientesAtivos)

      // ── Funil de conversão ────────────────────────────────────────────────
      const funilBase = totalNovoLead + totalConsultasAgendadas + totalPacientesAtivos
      const funil: FunilEtapa[] = [
        { label: 'Leads Captados',     etiqueta: 'NOVO_LEAD',          total: totalNovoLead,            pct: pct(totalNovoLead, funilBase || 1) },
        { label: 'Consulta Agendada',  etiqueta: 'CONSULTA_AGENDADA',  total: totalConsultasAgendadas,  pct: pct(totalConsultasAgendadas, funilBase || 1) },
        { label: 'Paciente Ativa',     etiqueta: 'PACIENTE_ATIVO',     total: totalPacientesAtivos,     pct: pct(totalPacientesAtivos, funilBase || 1) },
      ]

      // ── Leads por semana (últimas 8 semanas) ──────────────────────────────
      const agora = new Date()
      const leadsSemanais: SemanaLead[] = Array.from({ length: 8 }, (_, i) => {
        const inicio = startOfWeek(subWeeks(agora, 7 - i), { locale: ptBR })
        const fim = startOfWeek(subWeeks(agora, 6 - i), { locale: ptBR })
        const total = lista.filter((c) => {
          if (!c.primeiro_contato) return false
          const dt = parseISO(c.primeiro_contato)
          return isWithinInterval(dt, { start: inicio, end: fim })
        }).length
        return {
          label: format(inicio, "'Sem' w", { locale: ptBR }),
          inicio,
          total,
        }
      })

      // ── NPS ───────────────────────────────────────────────────────────────
      const comNps = lista.filter((c) => c.nps_ultima_nota != null)
      const promotores  = comNps.filter((c) => c.nps_ultima_nota >= 9).length
      const neutros     = comNps.filter((c) => c.nps_ultima_nota >= 7 && c.nps_ultima_nota <= 8).length
      const detratores  = comNps.filter((c) => c.nps_ultima_nota <= 6).length
      const soma        = comNps.reduce((acc, c) => acc + (c.nps_ultima_nota ?? 0), 0)
      const media       = comNps.length ? Math.round((soma / comNps.length) * 10) / 10 : null

      const nps: NpsDistribuicao = {
        promotores,
        neutros,
        detratores,
        total: comNps.length,
        media,
      }

      // ── Distribuição por etiqueta ─────────────────────────────────────────
      const contagemEtiqueta: Record<string, number> = {}
      lista.forEach((c) => {
        contagemEtiqueta[c.etiqueta] = (contagemEtiqueta[c.etiqueta] || 0) + 1
      })
      const maxEtiqueta = Math.max(...Object.values(contagemEtiqueta), 1)
      const etiquetaStats: EtiquetaStats[] = Object.entries(contagemEtiqueta)
        .sort((a, b) => b[1] - a[1])
        .map(([etiqueta, total]) => ({
          etiqueta,
          label: ETIQUETA_LABELS[etiqueta]?.label ?? etiqueta,
          total,
          pct: pct(total, maxEtiqueta),
          cor: ETIQUETA_LABELS[etiqueta]?.cor ?? 'bg-gray-400',
        }))

      // ── Jailbreaks ────────────────────────────────────────────────────────
      const totalJailbreaks = lista.reduce((acc, c) => acc + (c.jailbreak_count || 0), 0)

      // ── Follow-ups ────────────────────────────────────────────────────────
      const totalFollowupEnviados = lista.reduce((acc, c) => acc + (c.followup_count || 0), 0)

      // ── % atendido pela IA ────────────────────────────────────────────────
      const emAtendimento = lista.filter((c) => ['EM_ATENDIMENTO_IA', 'AGUARDANDO_HUMANO'].includes(c.etiqueta))
      const pelaIa = emAtendimento.filter((c) => !c.ia_pausada).length
      const iaPorcentagem = pct(pelaIa, emAtendimento.length || 1)

      setDados({
        totalContatos,
        totalLeads,
        totalPacientesAtivos,
        totalConsultasAgendadas,
        aguardandoHumano,
        taxaConversaoLeadConsulta,
        taxaConversaoConsultaPaciente,
        funil,
        leadsSemanais,
        nps,
        etiquetaStats,
        totalJailbreaks,
        totalFollowupEnviados,
        iaPorcentagem,
      })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { ...dados, loading, erro, refetch: carregar }
}
