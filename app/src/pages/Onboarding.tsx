import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Bot, Smartphone, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, Copy, Check,
  ExternalLink, AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateProfile, avancarOnboarding, inserirConfigPadrao, type Profile } from '../lib/supabase'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Input({
  label, value, onChange, placeholder, type = 'text', required, hint
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

function Select({
  label, value, onChange, options, required
}: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-3 py-1.5 transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  )
}

// ─── Passos ──────────────────────────────────────────────────────────────────

const PASSOS = [
  { label: 'Consultório', icon: Building2 },
  { label: 'Assistente IA', icon: Bot },
  { label: 'WhatsApp', icon: Smartphone },
  { label: 'Concluído', icon: CheckCircle2 },
]

// ─── Step 1: Consultório ─────────────────────────────────────────────────────

function Step1({ dados, onChange }: { dados: Partial<Profile>; onChange: (d: Partial<Profile>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dados do consultório</h2>
        <p className="text-gray-500 text-sm mt-1">
          Estas informações personalizam como a IA vai se apresentar aos seus clientes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Seu nome profissional"
          value={dados.nome_profissional || ''}
          onChange={(v) => onChange({ ...dados, nome_profissional: v })}
          placeholder="Dra. Ana Paula Santos"
          required
        />
        <Input
          label="Nome do consultório"
          value={dados.nome_consultorio || ''}
          onChange={(v) => onChange({ ...dados, nome_consultorio: v })}
          placeholder="Consultório Nutri Ana"
        />
      </div>

      <Input
        label="Método / Marca própria"
        value={dados.metodo_marca || ''}
        onChange={(v) => onChange({ ...dados, metodo_marca: v })}
        placeholder="Ex: Método Equilibrium, Programa REINO..."
        hint="Deixe vazio se não tiver método próprio"
      />

      <Input
        label="Foco de atendimento"
        value={dados.foco_atendimento || ''}
        onChange={(v) => onChange({ ...dados, foco_atendimento: v })}
        placeholder="Ex: Saúde hormonal feminina, emagrecimento, intestino..."
        required
      />

      <Input
        label="Público-alvo"
        value={dados.publico_alvo || ''}
        onChange={(v) => onChange({ ...dados, publico_alvo: v })}
        placeholder="Ex: Mulheres 25-45 anos com queixas hormonais"
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Modalidade"
          value={dados.modalidade || 'online'}
          onChange={(v) => onChange({ ...dados, modalidade: v })}
          options={[
            { value: 'online', label: 'Online' },
            { value: 'presencial', label: 'Presencial' },
            { value: 'hibrido', label: 'Híbrido' },
          ]}
        />
        <Input
          label="Cidade"
          value={dados.cidade || ''}
          onChange={(v) => onChange({ ...dados, cidade: v })}
          placeholder="São Paulo"
        />
      </div>

      <Input
        label="Horário de atendimento"
        value={dados.horario_atendimento || 'Segunda a sexta, 8h às 18h'}
        onChange={(v) => onChange({ ...dados, horario_atendimento: v })}
        placeholder="Segunda a sexta, 8h às 18h"
        hint="A IA informa esses horários quando perguntada sobre agendamentos"
      />
    </div>
  )
}

// ─── Step 2: Assistente IA ───────────────────────────────────────────────────

function Step2({ dados, onChange }: { dados: Partial<Profile>; onChange: (d: Partial<Profile>) => void }) {
  const toms = [
    { value: 'acolhedor', label: 'Acolhedor', desc: 'Empático, próximo, linguagem casual com cuidado' },
    { value: 'profissional', label: 'Profissional', desc: 'Formal, objetivo, linguagem técnica e precisa' },
    { value: 'descontraido', label: 'Descontraído', desc: 'Leve, bem-humorado, informal e próximo' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Configure sua assistente IA</h2>
        <p className="text-gray-500 text-sm mt-1">
          Personalize o nome e o estilo de comunicação da sua IA.
        </p>
      </div>

      <Input
        label="Nome da assistente"
        value={dados.nome_assistente || 'Lívia'}
        onChange={(v) => onChange({ ...dados, nome_assistente: v })}
        placeholder="Lívia"
        required
        hint="Este é o nome que a IA usa para se apresentar aos clientes"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tom de voz <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {toms.map((t) => (
            <label
              key={t.value}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                dados.tom_voz === t.value
                  ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="tom_voz"
                value={t.value}
                checked={dados.tom_voz === t.value}
                onChange={() => onChange({ ...dados, tom_voz: t.value })}
                className="mt-0.5 accent-purple-600"
              />
              <div>
                <p className="font-medium text-gray-900">{t.label}</p>
                <p className="text-sm text-gray-500">{t.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-700 font-medium mb-1">Prévia da saudação</p>
        <p className="text-sm text-purple-900">
          "Olá! Sou{' '}
          <strong>{dados.nome_assistente || 'Lívia'}</strong>, assistente do consultório da{' '}
          <strong>{dados.nome_profissional || '[seu nome]'}</strong>. Como posso te ajudar hoje?"
        </p>
      </div>
    </div>
  )
}

// ─── Step 3: WhatsApp Cloud API ──────────────────────────────────────────────

function Step3({
  dados,
  onChange,
  verifyToken,
}: {
  dados: Partial<Profile>
  onChange: (d: Partial<Profile>) => void
  verifyToken: string
}) {
  const webhookUrl = `${window.location.origin.replace(':5180', ':443')}/webhook/whatsapp`

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Conectar WhatsApp</h2>
        <p className="text-gray-500 text-sm mt-1">
          Siga o passo a passo para conectar seu número via WhatsApp Cloud API (oficial Meta).
        </p>
      </div>

      {/* Passo a passo */}
      <div className="space-y-3">
        {[
          {
            n: '1',
            titulo: 'Acesse o Meta for Developers',
            desc: (
              <span>
                Abra{' '}
                <a
                  href="https://developers.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-600 hover:underline inline-flex items-center gap-1"
                >
                  developers.facebook.com <ExternalLink size={12} />
                </a>{' '}
                e crie ou acesse seu aplicativo.
              </span>
            ),
          },
          {
            n: '2',
            titulo: 'Adicione o produto WhatsApp',
            desc: 'No painel do app, clique em "Adicionar produto" → WhatsApp.',
          },
          {
            n: '3',
            titulo: 'Configure o webhook',
            desc: (
              <div className="space-y-2">
                <p>Em WhatsApp → Configuração → Webhook, configure:</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">URL do Webhook:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-200 px-2 py-0.5 rounded">{webhookUrl}</code>
                      <CopyButton text={webhookUrl} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Token de Verificação:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-200 px-2 py-0.5 rounded font-mono">{verifyToken}</code>
                      <CopyButton text={verifyToken} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Inscreva-se no campo <strong>messages</strong>.</p>
              </div>
            ),
          },
          {
            n: '4',
            titulo: 'Gere um token permanente',
            desc: 'Em Configurações do app → Usuários do sistema → crie um System User com acesso ao WABA e gere um token permanente.',
          },
        ].map((p) => (
          <div key={p.n} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
              {p.n}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{p.titulo}</p>
              <div className="text-sm text-gray-600 mt-1">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Campos de credenciais */}
      <div className="space-y-4 pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700">Cole as credenciais abaixo:</p>

        <Input
          label="Phone Number ID"
          value={dados.wa_phone_number_id || ''}
          onChange={(v) => onChange({ ...dados, wa_phone_number_id: v })}
          placeholder="1234567890123456"
          hint="Encontrado em WhatsApp → Primeiros passos → Phone Number ID"
        />

        <Input
          label="Token de Acesso Permanente"
          value={dados.wa_access_token || ''}
          onChange={(v) => onChange({ ...dados, wa_access_token: v })}
          placeholder="EAAxxxxxxxxxxxxxxxx..."
          type="password"
          hint="Token do System User (não use o token temporário)"
        />

        <Input
          label="WhatsApp Business Account ID (WABA ID)"
          value={dados.wa_waba_id || ''}
          onChange={(v) => onChange({ ...dados, wa_waba_id: v })}
          placeholder="1234567890"
          hint="Encontrado em WhatsApp → Configuração → ID da conta"
        />

        <Input
          label="Número de exibição"
          value={dados.wa_numero_display || ''}
          onChange={(v) => onChange({ ...dados, wa_numero_display: v })}
          placeholder="+55 11 99999-9999"
          hint="Como o número aparece para seus clientes"
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          O número conectado precisa ser um número de <strong>produção</strong> aprovado pela Meta.
          Números em modo teste só enviam mensagens para números cadastrados na whitelist.
        </p>
      </div>
    </div>
  )
}

// ─── Step 4: Concluído ───────────────────────────────────────────────────────

function Step4({ profile }: { profile: Partial<Profile> }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tudo pronto!</h2>
        <p className="text-gray-500 mt-2">
          {profile.nome_assistente || 'Sua assistente'} está configurada e pronta para atender
          seus clientes no WhatsApp.
        </p>
      </div>
      <div className="text-left bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-3">
        <p className="font-semibold text-purple-900 text-sm">Próximos passos:</p>
        <ul className="space-y-2 text-sm text-purple-800">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-purple-600" />
            Importe o workflow do n8n em <code className="bg-purple-100 px-1 rounded">n8n/workflow_cloudapi.json</code>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-purple-600" />
            Configure as variáveis de ambiente no n8n (SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-purple-600" />
            Ative o workflow e faça um teste enviando uma mensagem para o número conectado
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-purple-600" />
            Ajuste as mensagens nas Configurações conforme necessário
          </li>
        </ul>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function Onboarding() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const [passo, setPasso] = useState((profile?.onboarding_step || 0))
  const [dados, setDados] = useState<Partial<Profile>>({
    nome_profissional: profile?.nome_profissional || '',
    nome_consultorio: profile?.nome_consultorio || '',
    metodo_marca: profile?.metodo_marca || '',
    foco_atendimento: profile?.foco_atendimento || '',
    publico_alvo: profile?.publico_alvo || '',
    modalidade: profile?.modalidade || 'online',
    horario_atendimento: profile?.horario_atendimento || 'Segunda a sexta, 8h às 18h',
    cidade: profile?.cidade || '',
    nome_assistente: profile?.nome_assistente || 'Lívia',
    tom_voz: profile?.tom_voz || 'acolhedor',
    wa_phone_number_id: profile?.wa_phone_number_id || '',
    wa_access_token: profile?.wa_access_token || '',
    wa_waba_id: profile?.wa_waba_id || '',
    wa_numero_display: profile?.wa_numero_display || '',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.onboarding_step) setPasso(profile.onboarding_step)
  }, [profile])

  const proximoPasso = async () => {
    setLoading(true)
    setErro(null)
    try {
      await updateProfile(dados)
      const novoPasso = passo + 1
      await avancarOnboarding(novoPasso)
      if (novoPasso === 4) {
        await inserirConfigPadrao(profile!.id)
        await refreshProfile()
        navigate('/dashboard')
      } else {
        await refreshProfile()
        setPasso(novoPasso)
      }
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const passoPulavel = passo === 2 // WhatsApp pode ser configurado depois

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6] flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">SecretarIA Nutri</h1>
            <p className="text-xs text-gray-500">Configuração inicial</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {PASSOS.map((p, i) => {
            const Icon = p.icon
            const ativo = i === passo
            const concluido = i < passo
            return (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex flex-col items-center gap-1.5 ${i < PASSOS.length - 1 ? 'flex-1' : ''}`}>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      concluido
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : ativo
                        ? 'border-purple-600 bg-white text-purple-600'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {concluido ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${ativo ? 'text-purple-600' : concluido ? 'text-purple-500' : 'text-gray-400'}`}>
                    {p.label}
                  </span>
                </div>
                {i < PASSOS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < passo ? 'bg-purple-500' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {passo === 0 && <Step1 dados={dados} onChange={setDados} />}
          {passo === 1 && <Step2 dados={dados} onChange={setDados} />}
          {passo === 2 && (
            <Step3
              dados={dados}
              onChange={setDados}
              verifyToken={profile?.wa_verify_token || ''}
            />
          )}
          {passo === 3 && <Step4 profile={dados} />}

          {erro && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {erro}
            </div>
          )}

          {/* Navegação */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setPasso(p => Math.max(0, p - 1))}
              disabled={passo === 0 || loading}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
              Voltar
            </button>

            <div className="flex items-center gap-3">
              {passoPulavel && (
                <button
                  onClick={() => setPasso(p => p + 1)}
                  disabled={loading}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Configurar depois
                </button>
              )}
              {passo < 3 && (
                <button
                  onClick={proximoPasso}
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Continuar
                  {!loading && <ChevronRight size={16} />}
                </button>
              )}
              {passo === 3 && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
                >
                  Ir para o painel
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
