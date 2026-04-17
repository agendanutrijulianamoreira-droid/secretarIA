import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EtiquetaContato =
  | 'NOVO_LEAD'
  | 'EM_ATENDIMENTO_IA'
  | 'AGUARDANDO_HUMANO'
  | 'CONSULTA_AGENDADA'
  | 'PACIENTE_ATIVO'
  | 'FOLLOW_UP_PENDENTE'
  | 'INATIVO_30D'
  | 'AGUARDANDO_PRECO'

export type StatusContato = 'LEAD' | 'AGUARDANDO_LGPD' | 'AGENDADO' | 'PACIENTE_ATIVO' | 'INATIVO'

export type SetorContato =
  | 'RECEPCAO'
  | 'ACOMPANHAMENTO'
  | 'FOLLOWUP'
  | 'HUMANO'
  | 'PRECO'
  | 'EXAME'

export type PlanoTenant = 'trial' | 'starter' | 'pro' | 'enterprise'

export interface Profile {
  id: string
  nome_profissional: string | null
  especialidade: string | null
  registro_profissional: string | null
  nome_consultorio: string | null
  metodo_marca: string | null
  foco_atendimento: string | null
  publico_alvo: string | null
  modalidade: string
  horario_atendimento: string
  dias_sem_agendamento: string
  cidade: string | null
  estado: string | null
  wa_phone_number_id: string | null
  wa_access_token: string | null
  wa_waba_id: string | null
  wa_verify_token: string | null
  wa_numero_display: string | null
  wa_conectado: boolean
  wa_conectado_em: string | null
  nome_assistente: string
  tom_voz: string
  is_admin: boolean
  plano: PlanoTenant
  plano_ativo: boolean
  trial_expira_em: string | null
  onboarding_step: number
  onboarding_completo: boolean
  created_at: string
  updated_at: string
}

export interface ConfigEntry {
  id: string
  user_id: string
  chave: string
  valor: string | null
  created_at: string
  updated_at: string
}

export type ConfigMap = Record<string, string>

export interface Contato {
  id: string
  user_id: string | null
  phone: string
  nome: string | null
  email: string | null
  cidade: string | null
  estado: string | null
  data_nascimento: string | null
  principal_queixa: string | null
  status: StatusContato
  setor: SetorContato
  etiqueta: EtiquetaContato
  ia_pausada: boolean
  pausada_em: string | null
  retomada_em: string | null
  pausada_por: string | null
  lgpd_consent: boolean | null
  lgpd_consent_at: string | null
  primeiro_contato: string
  ultima_mensagem: string | null
  total_mensagens: number
  turno_atual: 'ia' | 'humano'
  followup_count: number
  ultimo_followup: string | null
  proximo_followup: string | null
  consulta_agendada_em: string | null
  consulta_realizada_em: string | null
  retorno_agendado_em: string | null
  plano_ativo: string | null
  tentativa_jailbreak: boolean
  jailbreak_count: number
  nps_ultima_nota: number | null
  nps_data: string | null
  anamnese_enviada: boolean
  anamnese_preenchida: boolean
  posconsulta_enviada: boolean
  resumo_historico: string | null
  created_at: string
  updated_at: string
}

export interface Notificacao {
  id: string
  user_id: string | null
  phone: string
  nome_contato: string | null
  motivo: string
  prioridade: string | null
  mensagem: string | null
  resumo: string | null
  lida: boolean
  lida_em: string | null
  criado_em: string
}

export interface MetricasTenant {
  user_id: string
  total_leads: number
  total_pacientes_ativos: number
  aguardando_humano: number
  consultas_agendadas: number
  followups_pendentes: number
  tentativas_jailbreak: number
  ativos_7d: number
  nps_medio: number | null
  leads_esta_semana: number
  consultas_esta_semana: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, nome_profissional: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { nome_profissional } },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/nova-senha`,
  })
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

export async function updateProfile(campos: Partial<Profile>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  return supabase
    .from('profiles')
    .update(campos)
    .eq('id', user.id)
}

export async function avancarOnboarding(step: number) {
  const completo = step >= 4
  return updateProfile({
    onboarding_step: step,
    onboarding_completo: completo,
    ...(completo ? { plano_ativo: true } : {}),
  })
}

// ─── Config ───────────────────────────────────────────────────────────────────

export async function getConfig(): Promise<ConfigMap> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data } = await supabase
    .from('config')
    .select('chave, valor')
    .eq('user_id', user.id)

  return (data || []).reduce<ConfigMap>((acc, { chave, valor }) => {
    acc[chave] = valor ?? ''
    return acc
  }, {})
}

export async function setConfig(chave: string, valor: string) {
  return supabase.rpc('set_config', {
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_chave: chave,
    p_valor: valor,
  })
}

export async function setConfigBatch(entries: ConfigMap) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const rows = Object.entries(entries).map(([chave, valor]) => ({
    user_id: user.id,
    chave,
    valor,
  }))

  return supabase
    .from('config')
    .upsert(rows, { onConflict: 'user_id,chave' })
}

// ─── Contatos ────────────────────────────────────────────────────────────────

export async function pausarIA(phone: string, usuario = 'Nutricionista') {
  return supabase.rpc('pausar_ia', { p_phone: phone, p_usuario: usuario })
}

export async function retomarIA(phone: string) {
  return supabase.rpc('retomar_ia', { p_phone: phone })
}

export async function atualizarEtiqueta(phone: string, etiqueta: EtiquetaContato) {
  return supabase
    .from('contatos')
    .update({ etiqueta })
    .eq('phone', phone)
}

export async function atualizarContato(phone: string, campos: Partial<Contato>) {
  return supabase
    .from('contatos')
    .update(campos)
    .eq('phone', phone)
}

// ─── Notificações ─────────────────────────────────────────────────────────────

export async function marcarNotificacaoLida(id: string) {
  return supabase
    .from('notificacoes_humano')
    .update({ lida: true, lida_em: new Date().toISOString() })
    .eq('id', id)
}

export async function marcarTodasLidas() {
  return supabase
    .from('notificacoes_humano')
    .update({ lida: true, lida_em: new Date().toISOString() })
    .eq('lida', false)
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function listarTenants() {
  return supabase
    .from('profiles')
    .select('id, nome_profissional, nome_consultorio, plano, plano_ativo, wa_conectado, onboarding_completo, created_at, trial_expira_em')
    .order('created_at', { ascending: false })
}

export async function ativarPlano(userId: string, plano: PlanoTenant) {
  return supabase
    .from('profiles')
    .update({ plano, plano_ativo: true, onboarding_completo: true })
    .eq('id', userId)
}

export async function estenderTrial(userId: string, dias: number) {
  return supabase.rpc('estender_trial', { p_user_id: userId, p_dias: dias })
}

export async function cancelarPlano(userId: string, motivo?: string) {
  return supabase.rpc('cancelar_plano', {
    p_user_id: userId,
    ...(motivo ? { p_motivo: motivo } : {}),
  })
}

export async function getUsoMensal() {
  return supabase.from('v_meu_uso_mensal').select('*').maybeSingle()
}

export async function inserirConfigPadrao(userId: string) {
  return supabase.rpc('inserir_config_padrao', { p_user_id: userId })
}
