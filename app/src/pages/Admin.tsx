import { useState, useEffect } from 'react'
import {
  Users, Search, CheckCircle2, XCircle, Clock, Bot,
  Smartphone, MoreVertical, UserPlus, Loader2, RefreshCw
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { listarTenants, ativarPlano, estenderTrial, cancelarPlano, inserirConfigPadrao, type PlanoTenant } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface Tenant {
  id: string
  nome_profissional: string | null
  nome_consultorio: string | null
  plano: PlanoTenant
  plano_ativo: boolean
  wa_conectado: boolean
  onboarding_completo: boolean
  created_at: string
  trial_expira_em: string | null
}

function PlanoChip({ plano, ativo }: { plano: PlanoTenant; ativo: boolean }) {
  const cfg: Record<PlanoTenant, { label: string; cls: string }> = {
    trial: { label: 'Trial', cls: 'bg-gray-100 text-gray-600' },
    starter: { label: 'Starter', cls: 'bg-blue-100 text-blue-700' },
    pro: { label: 'Pro', cls: 'bg-purple-100 text-purple-700' },
    enterprise: { label: 'Enterprise', cls: 'bg-amber-100 text-amber-700' },
  }
  const { label, cls } = cfg[plano]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cls} ${!ativo ? 'opacity-50' : ''}`}>
      {!ativo && <XCircle size={11} />}
      {ativo && <CheckCircle2 size={11} />}
      {label}
    </span>
  )
}

function StatusChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {label}
    </span>
  )
}

function trialRestante(expira: string | null): string | null {
  if (!expira) return null
  const diff = new Date(expira).getTime() - Date.now()
  if (diff <= 0) return 'Expirado'
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return `${dias}d restantes`
}

// ─── Modal de ativação ────────────────────────────────────────────────────────

function ModalAtivar({
  tenant,
  onClose,
  onAtivado,
}: {
  tenant: Tenant
  onClose: () => void
  onAtivado: () => void
}) {
  const [plano, setPlano] = useState<PlanoTenant>(tenant.plano)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function handleAtivar() {
    setLoading(true)
    setErro(null)
    try {
      await ativarPlano(tenant.id, plano)
      if (!tenant.onboarding_completo) {
        await inserirConfigPadrao(tenant.id)
      }
      onAtivado()
      onClose()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao ativar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Ativar plano</h2>
        <p className="text-sm text-gray-500 mb-5">
          {tenant.nome_profissional || 'Nutricionista'} —{' '}
          {tenant.nome_consultorio || 'Consultório não configurado'}
        </p>

        <div className="space-y-3">
          {(['trial', 'starter', 'pro', 'enterprise'] as PlanoTenant[]).map((p) => (
            <label
              key={p}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                plano === p ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="plano"
                value={p}
                checked={plano === p}
                onChange={() => setPlano(p)}
                className="accent-purple-600"
              />
              <span className="font-medium text-gray-900 capitalize">{p}</span>
            </label>
          ))}
        </div>

        {erro && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{erro}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleAtivar}
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl transition-colors text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Ativar plano
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

function LinhaTenant({ tenant, onAtivado }: { tenant: Tenant; onAtivado: () => void }) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalAtivacao, setModalAtivacao] = useState(false)
  const [extendendo, setExtendendo] = useState(false)
  const trial = trialRestante(tenant.trial_expira_em)

  async function handleEstenderTrial(dias: number) {
    setMenuAberto(false)
    setExtendendo(true)
    await estenderTrial(tenant.id, dias)
    setExtendendo(false)
    onAtivado()
  }

  async function handleCancelar() {
    if (!confirm(`Cancelar o plano de ${tenant.nome_profissional || 'esta nutricionista'}?`)) return
    setMenuAberto(false)
    await cancelarPlano(tenant.id, 'cancelado pelo admin')
    onAtivado()
  }

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <div>
            <p className="font-medium text-gray-900 text-sm">
              {tenant.nome_profissional || <span className="text-gray-400 italic">Sem nome</span>}
            </p>
            <p className="text-xs text-gray-500">
              {tenant.nome_consultorio || 'Consultório não configurado'}
            </p>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            <PlanoChip plano={tenant.plano} ativo={tenant.plano_ativo} />
            {tenant.plano === 'trial' && trial && (
              <span className={`text-xs ${trial === 'Expirado' ? 'text-red-500' : 'text-gray-400'}`}>
                {trial}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            <StatusChip ok={tenant.onboarding_completo} label="Onboarding" />
            <StatusChip ok={tenant.wa_conectado} label="WhatsApp" />
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {formatDistanceToNow(new Date(tenant.created_at), { locale: ptBR, addSuffix: true })}
          </div>
          <div className="text-gray-400">
            {format(new Date(tenant.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="relative">
            <button
              onClick={() => setMenuAberto((v) => !v)}
              disabled={extendendo}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              {extendendo ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
            </button>
            {menuAberto && (
              <div
                className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 min-w-48"
                onMouseLeave={() => setMenuAberto(false)}
              >
                <button
                  onClick={() => { setModalAtivacao(true); setMenuAberto(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Ativar / alterar plano
                </button>
                <div className="border-t border-gray-100 my-1" />
                <p className="px-4 py-1 text-xs text-gray-400 font-medium">Estender trial</p>
                {[7, 14, 30].map((dias) => (
                  <button
                    key={dias}
                    onClick={() => handleEstenderTrial(dias)}
                    className="w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    +{dias} dias
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { inserirConfigPadrao(tenant.id); setMenuAberto(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Inserir configs padrão
                </button>
                {tenant.plano_ativo && (
                  <button
                    onClick={handleCancelar}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cancelar plano
                  </button>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>

      {modalAtivacao && (
        <ModalAtivar
          tenant={tenant}
          onClose={() => setModalAtivacao(false)}
          onAtivado={onAtivado}
        />
      )}
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function Admin() {
  const { profile } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  if (profile && !profile.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  async function carregar() {
    setLoading(true)
    const { data } = await listarTenants()
    setTenants((data as Tenant[]) || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const filtrados = tenants.filter((t) => {
    const q = busca.toLowerCase()
    return (
      !busca ||
      t.nome_profissional?.toLowerCase().includes(q) ||
      t.nome_consultorio?.toLowerCase().includes(q)
    )
  })

  const total = tenants.length
  const ativos = tenants.filter((t) => t.plano_ativo).length
  const trial = tenants.filter((t) => t.plano === 'trial').length
  const semWhatsApp = tenants.filter((t) => !t.wa_conectado).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
            <p className="text-sm text-gray-500">Gerenciamento de nutricionistas na plataforma</p>
          </div>
          <button
            onClick={carregar}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total cadastradas', valor: total, icon: Users, cor: 'text-gray-700 bg-gray-50 border-gray-200' },
            { label: 'Planos ativos', valor: ativos, icon: CheckCircle2, cor: 'text-green-700 bg-green-50 border-green-200' },
            { label: 'Em trial', valor: trial, icon: Clock, cor: 'text-orange-700 bg-orange-50 border-orange-200' },
            { label: 'Sem WhatsApp', valor: semWhatsApp, icon: Smartphone, cor: 'text-red-700 bg-red-50 border-red-200' },
          ].map((c) => {
            const Icon = c.icon
            return (
              <div key={c.label} className={`border rounded-xl p-4 ${c.cor}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={15} />
                  <span className="text-xs font-medium opacity-70">{c.label}</span>
                </div>
                <p className="text-2xl font-bold">{c.valor}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Barra de busca */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar nutricionista..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <button className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <UserPlus size={15} />
          Criar conta manualmente
        </button>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={24} className="animate-spin text-purple-600" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Bot size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhuma nutricionista encontrada</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Nutricionista
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Plano
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Cadastro
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((t) => (
                <LinhaTenant key={t.id} tenant={t} onAtivado={carregar} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
