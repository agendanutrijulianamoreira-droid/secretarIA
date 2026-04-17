import { useState, useEffect, useCallback, type FormEvent } from 'react'
import {
  Building2, Bot, Clock, CalendarCheck, Star, Shield,
  Save, Loader2, CheckCircle2, ChevronDown,
  CreditCard, Zap, Users, MessageCircle, TrendingUp, ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import {
  updateProfile, getConfig, setConfigBatch,
  getUsoMensal,
  type Profile, type ConfigMap
} from '../lib/supabase'
import { useTrialStatus } from '../hooks/useTrialStatus'

// ─── Shared primitives ────────────────────────────────────────────────────────

function Field({
  label, hint, children
}: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, type = 'text', disabled
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
    />
  )
}

function TextArea({
  value, onChange, placeholder, rows = 3
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none transition-colors"
    />
  )
}

function SelectInput({
  value, onChange, options
}: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none bg-white transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

function Toggle({
  checked, onChange, label
}: {
  checked: boolean; onChange: (v: boolean) => void; label: string
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function NumberInput({
  value, onChange, min = 1, max = 365, suffix
}: {
  value: string; onChange: (v: string) => void; min?: number; max?: number; suffix?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        className="w-24 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
      />
      {suffix && <span className="text-sm text-gray-500">{suffix}</span>}
    </div>
  )
}

// ─── Abas ─────────────────────────────────────────────────────────────────────

const ABAS = [
  { id: 'consultorio', label: 'Consultório', icon: Building2 },
  { id: 'assistente', label: 'Assistente IA', icon: Bot },
  { id: 'followup', label: 'Follow-up', icon: Clock },
  { id: 'confirmacao', label: 'Confirmação', icon: CalendarCheck },
  { id: 'posconsulta', label: 'Pós-consulta', icon: Star },
  { id: 'lgpd', label: 'LGPD & Segurança', icon: Shield },
  { id: 'plano', label: 'Plano', icon: CreditCard },
]

// ─── Aba Consultório ──────────────────────────────────────────────────────────

function AbaConsultorio({
  profile, onChange
}: {
  profile: Partial<Profile>; onChange: (d: Partial<Profile>) => void
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome profissional">
          <TextInput
            value={profile.nome_profissional || ''}
            onChange={(v) => onChange({ ...profile, nome_profissional: v })}
            placeholder="Dra. Ana Paula Santos"
          />
        </Field>
        <Field label="Registro profissional">
          <TextInput
            value={profile.registro_profissional || ''}
            onChange={(v) => onChange({ ...profile, registro_profissional: v })}
            placeholder="CRN 1234/P"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome do consultório">
          <TextInput
            value={profile.nome_consultorio || ''}
            onChange={(v) => onChange({ ...profile, nome_consultorio: v })}
            placeholder="Consultório Nutri Ana"
          />
        </Field>
        <Field label="Método / Marca própria">
          <TextInput
            value={profile.metodo_marca || ''}
            onChange={(v) => onChange({ ...profile, metodo_marca: v })}
            placeholder="Método Equilibrium"
          />
        </Field>
      </div>

      <Field label="Foco de atendimento">
        <TextInput
          value={profile.foco_atendimento || ''}
          onChange={(v) => onChange({ ...profile, foco_atendimento: v })}
          placeholder="Saúde hormonal feminina, emagrecimento, saúde intestinal"
        />
      </Field>

      <Field label="Público-alvo">
        <TextInput
          value={profile.publico_alvo || ''}
          onChange={(v) => onChange({ ...profile, publico_alvo: v })}
          placeholder="Mulheres 25-45 anos com queixas hormonais"
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Modalidade">
          <SelectInput
            value={profile.modalidade || 'online'}
            onChange={(v) => onChange({ ...profile, modalidade: v })}
            options={[
              { value: 'online', label: 'Online' },
              { value: 'presencial', label: 'Presencial' },
              { value: 'hibrido', label: 'Híbrido' },
            ]}
          />
        </Field>
        <Field label="Cidade">
          <TextInput
            value={profile.cidade || ''}
            onChange={(v) => onChange({ ...profile, cidade: v })}
            placeholder="São Paulo"
          />
        </Field>
        <Field label="Estado">
          <TextInput
            value={profile.estado || ''}
            onChange={(v) => onChange({ ...profile, estado: v })}
            placeholder="SP"
          />
        </Field>
      </div>

      <Field label="Horário de atendimento" hint="Usado pela IA ao responder sobre disponibilidade">
        <TextInput
          value={profile.horario_atendimento || ''}
          onChange={(v) => onChange({ ...profile, horario_atendimento: v })}
          placeholder="Segunda a sexta, 8h às 18h"
        />
      </Field>

      <Field label="Dias sem agendamento" hint="Separados por vírgula">
        <TextInput
          value={profile.dias_sem_agendamento || ''}
          onChange={(v) => onChange({ ...profile, dias_sem_agendamento: v })}
          placeholder="sábado,domingo"
        />
      </Field>
    </div>
  )
}

// ─── Aba Assistente IA ────────────────────────────────────────────────────────

function AbaAssistente({
  profile, config, onProfileChange, onConfigChange
}: {
  profile: Partial<Profile>; config: ConfigMap
  onProfileChange: (d: Partial<Profile>) => void
  onConfigChange: (k: string, v: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome da assistente">
          <TextInput
            value={profile.nome_assistente || 'Lívia'}
            onChange={(v) => onProfileChange({ ...profile, nome_assistente: v })}
            placeholder="Lívia"
          />
        </Field>
        <Field label="Tom de voz">
          <SelectInput
            value={profile.tom_voz || 'acolhedor'}
            onChange={(v) => onProfileChange({ ...profile, tom_voz: v })}
            options={[
              { value: 'acolhedor', label: 'Acolhedor — empático e próximo' },
              { value: 'profissional', label: 'Profissional — formal e objetivo' },
              { value: 'descontraido', label: 'Descontraído — leve e bem-humorado' },
            ]}
          />
        </Field>
      </div>

      <Field
        label="Saudação inicial"
        hint="Use {{nome_assistente}} e {{nome_profissional}} como variáveis"
      >
        <TextArea
          value={config.saudacao_inicial || ''}
          onChange={(v) => onConfigChange('saudacao_inicial', v)}
          placeholder="Olá! Sou {{nome_assistente}}, assistente do consultório da {{nome_profissional}}. Como posso te ajudar hoje?"
          rows={3}
        />
      </Field>

      <Field
        label="Mensagem sobre preços"
        hint="Exibida quando o cliente pergunta sobre valores — a IA nunca revela preços"
      >
        <TextArea
          value={config.mensagem_preco || ''}
          onChange={(v) => onConfigChange('mensagem_preco', v)}
          placeholder="Os investimentos são personalizados. Nossa equipe vai te passar todos os detalhes em breve..."
          rows={3}
        />
      </Field>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm font-medium text-purple-800 mb-2">Prévia atual</p>
        <p className="text-sm text-purple-900 italic">
          "{(config.saudacao_inicial || 'Olá! Sou {{nome_assistente}}, assistente do consultório da {{nome_profissional}}. Como posso te ajudar hoje?')
            .replace(/\{\{nome_assistente\}\}/g, profile.nome_assistente || 'Lívia')
            .replace(/\{\{nome_profissional\}\}/g, profile.nome_profissional || '[seu nome]')}"
        </p>
      </div>
    </div>
  )
}

// ─── Aba Follow-up ────────────────────────────────────────────────────────────

function AbaFollowup({ config, onConfigChange }: { config: ConfigMap; onConfigChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Intervalos de envio</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Follow-up #1">
            <NumberInput
              value={config.followup_d1_dias || '3'}
              onChange={(v) => onConfigChange('followup_d1_dias', v)}
              suffix="dias após o 1º contato"
            />
          </Field>
          <Field label="Follow-up #2">
            <NumberInput
              value={config.followup_d2_dias || '7'}
              onChange={(v) => onConfigChange('followup_d2_dias', v)}
              suffix="dias"
            />
          </Field>
          <Field label="Follow-up #3">
            <NumberInput
              value={config.followup_d3_dias || '14'}
              onChange={(v) => onConfigChange('followup_d3_dias', v)}
              suffix="dias"
            />
          </Field>
        </div>
      </div>

      <Field
        label="Máximo de follow-ups por lead"
        hint="Após este número, o contato é marcado como INATIVO"
      >
        <NumberInput
          value={config.followup_max || '3'}
          onChange={(v) => onConfigChange('followup_max', v)}
          max={10}
          suffix="mensagens"
        />
      </Field>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Templates de mensagem</h3>
        <p className="text-xs text-gray-500">Variáveis: {'{{nome}}'}, {'{{queixa}}'}</p>

        {[1, 2, 3].map((n) => (
          <Field key={n} label={`Template #${n}`}>
            <TextArea
              value={config[`followup_template_${n}`] || ''}
              onChange={(v) => onConfigChange(`followup_template_${n}`, v)}
              placeholder={`Mensagem de follow-up ${n}...`}
              rows={3}
            />
          </Field>
        ))}
      </div>
    </div>
  )
}

// ─── Aba Confirmação ──────────────────────────────────────────────────────────

function AbaConfirmacao({ config, onConfigChange }: { config: ConfigMap; onConfigChange: (k: string, v: string) => void }) {
  const ativa = config.confirmacao_consulta_ativa === 'true'

  return (
    <div className="space-y-5">
      <Toggle
        checked={ativa}
        onChange={(v) => onConfigChange('confirmacao_consulta_ativa', v ? 'true' : 'false')}
        label="Enviar confirmação automática antes da consulta"
      />

      {ativa && (
        <>
          <Field
            label="Antecedência para enviar"
            hint="A IA enviará a mensagem de confirmação X horas antes da consulta"
          >
            <NumberInput
              value={config.confirmacao_horas_antes || '24'}
              onChange={(v) => onConfigChange('confirmacao_horas_antes', v)}
              min={1}
              max={72}
              suffix="horas antes"
            />
          </Field>

          <Field label="Tempo máximo de resposta humano" hint="Após este prazo sem resposta, gera notificação">
            <NumberInput
              value={config.tempo_resposta_humano_min || '60'}
              onChange={(v) => onConfigChange('tempo_resposta_humano_min', v)}
              min={5}
              max={1440}
              suffix="minutos"
            />
          </Field>
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          A confirmação só é enviada para contatos com <strong>CONSULTA_AGENDADA</strong> e campo
          <code className="mx-1 bg-blue-100 px-1 rounded text-xs">consulta_agendada_em</code> preenchido.
        </p>
      </div>
    </div>
  )
}

// ─── Aba Pós-consulta ─────────────────────────────────────────────────────────

function AbaPosconsulta({ config, onConfigChange }: { config: ConfigMap; onConfigChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">NPS (avaliação da consulta)</h3>
        <Toggle
          checked={config.nps_ativo === 'true'}
          onChange={(v) => onConfigChange('nps_ativo', v ? 'true' : 'false')}
          label="Enviar NPS após a consulta"
        />
        {config.nps_ativo === 'true' && (
          <Field label="Enviar NPS após">
            <NumberInput
              value={config.nps_horas_apos_consulta || '48'}
              onChange={(v) => onConfigChange('nps_horas_apos_consulta', v)}
              min={1}
              suffix="horas após a consulta"
            />
          </Field>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Mensagem de aniversário</h3>
        <Toggle
          checked={config.aniversario_ativo === 'true'}
          onChange={(v) => onConfigChange('aniversario_ativo', v ? 'true' : 'false')}
          label="Enviar mensagem no aniversário do paciente"
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">Reengajamento</h3>
        <Toggle
          checked={config.reengajamento_ativo === 'true'}
          onChange={(v) => onConfigChange('reengajamento_ativo', v ? 'true' : 'false')}
          label="Reengajar pacientes inativos automaticamente"
        />
        {config.reengajamento_ativo === 'true' && (
          <Field label="Reengajar após" hint="Pacientes sem mensagem há X dias">
            <NumberInput
              value={config.reengajamento_dias || '30'}
              onChange={(v) => onConfigChange('reengajamento_dias', v)}
              min={7}
              suffix="dias sem contato"
            />
          </Field>
        )}
      </div>
    </div>
  )
}

// ─── Aba LGPD & Segurança ─────────────────────────────────────────────────────

function AbaLgpd({ config, onConfigChange }: { config: ConfigMap; onConfigChange: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <Field
        label="Mensagem de consentimento LGPD"
        hint="Enviada no primeiro contato. O cliente deve responder Sim ou Não."
      >
        <TextArea
          value={config.lgpd_mensagem || ''}
          onChange={(v) => onConfigChange('lgpd_mensagem', v)}
          placeholder="Antes de continuarmos, preciso te informar que registramos as informações compartilhadas para te atender melhor..."
          rows={4}
        />
      </Field>

      <Field
        label="Palavras que acionam escala para humano"
        hint="Separadas por vírgula. Qualquer mensagem contendo essas palavras pausa a IA."
      >
        <TextInput
          value={config.palavras_escalar_humano || ''}
          onChange={(v) => onConfigChange('palavras_escalar_humano', v)}
          placeholder="urgente,emergência,dor forte,internação,desmaio,médico agora"
        />
      </Field>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-amber-800">Proteções ativas por padrão</p>
        <ul className="space-y-1 text-sm text-amber-700">
          <li>• Anti-jailbreak: respostas suspeitas são bloqueadas e registradas</li>
          <li>• Nunca revelar preços: toda pergunta sobre valores é escalada</li>
          <li>• Código 251213: quando detectado na resposta da IA, pausa o atendimento</li>
          <li>• Memória isolada por tenant: cada consultório tem dados separados</li>
        </ul>
      </div>
    </div>
  )
}

// ─── Aba Plano ────────────────────────────────────────────────────────────────

interface UsoMensal {
  total_tokens: number | null
  total_chamadas: number | null
  custo_usd_estimado: number | null
}

function AbaPlan() {
  const trial = useTrialStatus()
  const { profile } = useAuth()
  const [uso, setUso] = useState<UsoMensal | null>(null)

  useEffect(() => {
    getUsoMensal().then(({ data }) => setUso(data as UsoMensal | null))
  }, [])

  const PLANO_INFO: Record<string, { label: string; cor: string; descricao: string; limite_contatos: string }> = {
    trial:      { label: 'Trial',      cor: 'bg-gray-100 text-gray-700 border-gray-300',        descricao: '14 dias grátis — todos os recursos',       limite_contatos: '50 contatos' },
    starter:    { label: 'Starter',    cor: 'bg-blue-100 text-blue-700 border-blue-300',         descricao: 'Ideal para consultórios em crescimento',    limite_contatos: '200 contatos' },
    pro:        { label: 'Pro',        cor: 'bg-purple-100 text-purple-700 border-purple-300',   descricao: 'Recursos avançados e workflows completos',  limite_contatos: 'Ilimitado' },
    enterprise: { label: 'Enterprise', cor: 'bg-amber-100 text-amber-700 border-amber-300',      descricao: 'Multi-consultório, SLA e suporte dedicado', limite_contatos: 'Ilimitado' },
  }

  const planoInfo = PLANO_INFO[trial.plano] ?? PLANO_INFO.trial

  return (
    <div className="space-y-6">

      {/* Card do plano atual */}
      <div className={`rounded-2xl border-2 p-5 ${planoInfo.cor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{planoInfo.label}</span>
            {trial.planoAtivo && (
              <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                Ativo
              </span>
            )}
            {!trial.planoAtivo && !trial.trialExpirado && trial.isTrial && (
              <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 font-medium">
                Em trial
              </span>
            )}
            {trial.trialExpirado && (
              <span className="text-xs bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-medium">
                Expirado
              </span>
            )}
          </div>
          <CreditCard size={20} className="opacity-50" />
        </div>
        <p className="text-sm opacity-70 mb-3">{planoInfo.descricao}</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="opacity-60" />
            {planoInfo.limite_contatos}
          </span>
        </div>
      </div>

      {/* Contagem regressiva do trial */}
      {trial.isTrial && trial.trialExpiraEm && (
        <div className={`rounded-xl border p-4 ${trial.critico ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${trial.critico ? 'text-red-700' : 'text-amber-700'}`}>
              {trial.trialExpirado ? 'Trial expirado' : 'Trial em andamento'}
            </p>
            <span className={`text-xs font-medium ${trial.critico ? 'text-red-600' : 'text-amber-600'}`}>
              {trial.trialExpirado
                ? 'Expirado'
                : trial.diasRestantes === 0
                ? 'Expira hoje'
                : `${trial.diasRestantes} dia${trial.diasRestantes !== 1 ? 's' : ''} restante${trial.diasRestantes !== 1 ? 's' : ''}`
              }
            </span>
          </div>

          {!trial.trialExpirado && trial.trialExpiraEm && (
            <>
              {/* Barra de progresso */}
              {(() => {
                const totalDias = 14
                const pctUsado = Math.min(100, Math.round(((totalDias - (trial.diasRestantes ?? 0)) / totalDias) * 100))
                return (
                  <div className="h-2 bg-white/60 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${trial.critico ? 'bg-red-400' : 'bg-amber-400'}`}
                      style={{ width: `${pctUsado}%` }}
                    />
                  </div>
                )
              })()}
              <p className="text-xs text-amber-600">
                Expira em {format(trial.trialExpiraEm, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </>
          )}
        </div>
      )}

      {/* Uso mensal */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Uso este mês</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <MessageCircle size={16} className="text-purple-500 mb-2" />
            <p className="text-xs text-gray-500 mb-1">Chamadas à IA</p>
            <p className="text-xl font-bold text-gray-800">
              {uso?.total_chamadas != null ? uso.total_chamadas.toLocaleString('pt-BR') : '—'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <TrendingUp size={16} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-500 mb-1">Tokens usados</p>
            <p className="text-xl font-bold text-gray-800">
              {uso?.total_tokens != null ? (uso.total_tokens / 1000).toFixed(1) + 'k' : '—'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <CreditCard size={16} className="text-emerald-500 mb-2" />
            <p className="text-xs text-gray-500 mb-1">Custo estimado</p>
            <p className="text-xl font-bold text-gray-800">
              {uso?.custo_usd_estimado != null
                ? `$${Number(uso.custo_usd_estimado).toFixed(3)}`
                : '—'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Estimativa baseada em GPT-4o-mini. Valores em USD.
        </p>
      </div>

      {/* CTA de upgrade */}
      {(trial.isTrial || !trial.planoAtivo) && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">Pronto para ativar?</p>
              <p className="text-sm text-gray-600 mb-3">
                Entre em contato e ativamos seu plano em minutos. Sem burocracia.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="https://wa.me/5511999999999?text=Oi!+Quero+ativar+um+plano+da+SecretarIA+Nutri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Zap size={14} />
                  Ativar pelo WhatsApp
                </a>
                <a
                  href="mailto:contato@secretarianutri.com.br?subject=Quero+ativar+um+plano"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  <ExternalLink size={14} />
                  Enviar e-mail
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info do perfil de billing */}
      {profile && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Conta criada em:</span>{' '}
            {format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR })}
          </p>
          {profile.trial_expira_em && trial.isTrial && (
            <p><span className="font-medium text-gray-700">Trial expira em:</span>{' '}
              {format(new Date(profile.trial_expira_em), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          )}
          <p><span className="font-medium text-gray-700">ID da conta:</span>{' '}
            <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded font-mono">{profile.id}</code>
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Configuracoes() {
  const { profile: profileCtx, refreshProfile } = useAuth()
  const [abaAtiva, setAbaAtiva] = useState('consultorio')
  const [profileLocal, setProfileLocal] = useState<Partial<Profile>>({})
  const [configLocal, setConfigLocal] = useState<ConfigMap>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const carregarConfig = useCallback(async () => {
    setLoading(true)
    const cfg = await getConfig()
    setConfigLocal(cfg)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (profileCtx) {
      setProfileLocal({ ...profileCtx })
      carregarConfig()
    }
  }, [profileCtx, carregarConfig])

  const handleConfigChange = (chave: string, valor: string) => {
    setConfigLocal((prev) => ({ ...prev, [chave]: valor }))
  }

  async function handleSalvar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setSalvo(false)
    try {
      await updateProfile(profileLocal)
      await setConfigBatch(configLocal)
      await refreshProfile()
      setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSalvar} className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500">Personalize o comportamento da sua secretária IA</p>
        </div>
        <button
          type="submit"
          disabled={salvando}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl transition-colors"
        >
          {salvando ? <Loader2 size={16} className="animate-spin" /> : salvo ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {salvo ? 'Salvo!' : 'Salvar tudo'}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar de abas */}
        <nav className="w-52 shrink-0 border-r border-gray-200 bg-gray-50 pt-4">
          {ABAS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setAbaAtiva(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                abaAtiva === id
                  ? 'bg-purple-50 text-purple-700 font-medium border-r-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Conteúdo da aba */}
        <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
          {abaAtiva === 'consultorio' && (
            <AbaConsultorio profile={profileLocal} onChange={setProfileLocal} />
          )}
          {abaAtiva === 'assistente' && (
            <AbaAssistente
              profile={profileLocal}
              config={configLocal}
              onProfileChange={setProfileLocal}
              onConfigChange={handleConfigChange}
            />
          )}
          {abaAtiva === 'followup' && (
            <AbaFollowup config={configLocal} onConfigChange={handleConfigChange} />
          )}
          {abaAtiva === 'confirmacao' && (
            <AbaConfirmacao config={configLocal} onConfigChange={handleConfigChange} />
          )}
          {abaAtiva === 'posconsulta' && (
            <AbaPosconsulta config={configLocal} onConfigChange={handleConfigChange} />
          )}
          {abaAtiva === 'lgpd' && (
            <AbaLgpd config={configLocal} onConfigChange={handleConfigChange} />
          )}
          {abaAtiva === 'plano' && (
            <AbaPlan />
          )}
        </div>
      </div>
    </form>
  )
}
