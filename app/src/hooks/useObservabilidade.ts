import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface WebhookLog {
  id: number
  user_id: string | null
  wa_phone_number_id: string | null
  evento: string
  direcao: string | null
  phone_contato: string | null
  conteudo_preview: string | null
  tipo_conteudo: string | null
  status_processamento: string
  erro_detalhe: string | null
  duracao_ms: number | null
  created_at: string
}

export interface WorkflowErro {
  id: number
  user_id: string | null
  workflow_nome: string
  execucao_id: string | null
  node_nome: string | null
  mensagem_erro: string
  payload: Record<string, unknown> | null
  resolvido: boolean
  resolvido_em: string | null
  resolvido_por: string | null
  created_at: string
}

export interface HealthCheck {
  id: number
  user_id: string | null
  componente: string
  status: 'ok' | 'degradado' | 'erro'
  latencia_ms: number | null
  detalhe: string | null
  created_at: string
}

export interface SaudeTenant {
  user_id: string
  nome_profissional: string | null
  wa_conectado: boolean
  wa_numero_display: string | null
  plano: string
  plano_ativo: boolean
  webhooks_24h: number
  erros_webhook_24h: number
  erros_workflow_abertos: number
  ultimo_webhook_recebido: string | null
}

export interface ObsData {
  webhookLogs: WebhookLog[]
  workflowErros: WorkflowErro[]
  healthChecks: HealthCheck[]
  saudeTenants: SaudeTenant[]
  totalErrosAbertos: number
  loading: boolean
  erro: string | null
  refetch: () => void
  resolverErro: (id: number) => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusCor(s: string): string {
  if (s === 'processed') return 'text-green-600 bg-green-50'
  if (s === 'error')     return 'text-red-600 bg-red-50'
  if (s === 'ignored' || s === 'status_update') return 'text-gray-400 bg-gray-50'
  if (s === 'tenant_nao_encontrado') return 'text-orange-600 bg-orange-50'
  if (s === 'ia_pausada') return 'text-yellow-700 bg-yellow-50'
  return 'text-blue-600 bg-blue-50'
}

export { statusCor }

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useObservabilidade(): ObsData {
  const [webhookLogs,    setWebhookLogs]    = useState<WebhookLog[]>([])
  const [workflowErros,  setWorkflowErros]  = useState<WorkflowErro[]>([])
  const [healthChecks,   setHealthChecks]   = useState<HealthCheck[]>([])
  const [saudeTenants,   setSaudeTenants]   = useState<SaudeTenant[]>([])
  const [loading,        setLoading]        = useState(true)
  const [erro,           setErro]           = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      const [wlRes, weRes, hcRes, stRes] = await Promise.all([
        supabase
          .from('webhook_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('workflow_erros')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('health_checks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('v_saude_tenants')
          .select('*')
          .order('webhooks_24h', { ascending: false }),
      ])

      if (wlRes.error) throw wlRes.error
      if (weRes.error) throw weRes.error
      if (hcRes.error) throw hcRes.error
      // saude tenants view may not exist yet — handle gracefully
      if (!stRes.error) setSaudeTenants((stRes.data as SaudeTenant[]) || [])

      setWebhookLogs((wlRes.data as WebhookLog[]) || [])
      setWorkflowErros((weRes.data as WorkflowErro[]) || [])
      setHealthChecks((hcRes.data as HealthCheck[]) || [])
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar dados de observabilidade')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const resolverErro = useCallback(async (id: number) => {
    await supabase.rpc('marcar_erro_resolvido', { p_id: id, p_resolvido_por: 'admin' })
    setWorkflowErros((prev) =>
      prev.map((e) => e.id === id ? { ...e, resolvido: true, resolvido_em: new Date().toISOString() } : e)
    )
  }, [])

  const totalErrosAbertos = workflowErros.filter((e) => !e.resolvido).length

  return {
    webhookLogs,
    workflowErros,
    healthChecks,
    saudeTenants,
    totalErrosAbertos,
    loading,
    erro,
    refetch: carregar,
    resolverErro,
  }
}
