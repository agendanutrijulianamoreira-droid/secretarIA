import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useContatos } from '../hooks/useContatos'
import { BadgeEtiqueta } from '../components/BadgeEtiqueta'
import {
  supabase,
  pausarIA,
  retomarIA,
  atualizarEtiqueta,
} from '../lib/supabase'
import { ETIQUETA_CONFIG, ETIQUETAS_ORDEM } from '../lib/constants'
import type { Contato, EtiquetaContato } from '../lib/supabase'
import {
  Bot, User, Search, MessageSquare, Phone, MapPin, AlertTriangle,
  ChevronDown, ArrowLeft, CheckSquare, Square, X, SlidersHorizontal,
  Calendar, Star, Hash, Clock,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Mensagem {
  id: number
  session_id: string
  message: { type: 'human' | 'ai'; content: string }
  created_at: string
}

type Ordenacao = 'recente' | 'antiga' | 'mensagens'
type AbaDetalhe = 'historico' | 'info'

// ─── Constante: todos os filtros de etiqueta ──────────────────────────────────

const FILTROS_ETIQUETA: Array<{ label: string; valor: EtiquetaContato | undefined; cor: string }> = [
  { label: 'Todas', valor: undefined, cor: 'bg-purple-600 text-white' },
  { label: 'Aguard. Humano',   valor: 'AGUARDANDO_HUMANO',  cor: 'bg-yellow-500 text-white' },
  { label: 'Aguard. Preço',    valor: 'AGUARDANDO_PRECO',   cor: 'bg-red-500 text-white' },
  { label: 'Novo Lead',        valor: 'NOVO_LEAD',          cor: 'bg-blue-600 text-white' },
  { label: 'IA Ativa',         valor: 'EM_ATENDIMENTO_IA',  cor: 'bg-green-600 text-white' },
  { label: 'Follow-up',        valor: 'FOLLOW_UP_PENDENTE', cor: 'bg-orange-500 text-white' },
  { label: 'Agendada',         valor: 'CONSULTA_AGENDADA',  cor: 'bg-emerald-600 text-white' },
  { label: 'Paciente Ativa',   valor: 'PACIENTE_ATIVO',     cor: 'bg-purple-700 text-white' },
  { label: 'Inativa 30d',      valor: 'INATIVO_30D',        cor: 'bg-gray-500 text-white' },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function Conversas() {
  const [searchParams] = useSearchParams()
  const phoneParam = searchParams.get('phone')

  // Filtros e busca
  const [filtroEtiqueta, setFiltroEtiqueta] = useState<EtiquetaContato | undefined>()
  const [filtroTurno, setFiltroTurno] = useState<'todos' | 'ia' | 'humano'>('todos')
  const [busca, setBusca] = useState('')
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('recente')
  const [mostrarFiltrosExtras, setMostrarFiltrosExtras] = useState(false)

  // Seleção em lote
  const [modoSelecao, setModoSelecao] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [etiquetaLote, setEtiquetaLote] = useState(false)
  const [aplicandoLote, setAplicandoLote] = useState(false)

  // Detalhe do contato
  const [contatoSelecionado, setContatoSelecionado] = useState<Contato | null>(null)
  const [abaDetalhe, setAbaDetalhe] = useState<AbaDetalhe>('historico')
  const [historico, setHistorico] = useState<Mensagem[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [etiquetaDropdown, setEtiquetaDropdown] = useState(false)

  // Mobile
  const [mostrarConversa, setMostrarConversa] = useState(false)

  const fimRef = useRef<HTMLDivElement>(null)
  const { contatos, loading } = useContatos(filtroEtiqueta)

  // ── Filtro + ordenação client-side ─────────────────────────────────────────
  const contatosFiltrados = useMemo(() => {
    let lista = contatos.filter((c) => {
      if (busca) {
        const t = busca.toLowerCase()
        const match =
          c.nome?.toLowerCase().includes(t) ||
          c.phone.includes(t) ||
          c.principal_queixa?.toLowerCase().includes(t)
        if (!match) return false
      }
      if (filtroTurno === 'ia' && c.ia_pausada) return false
      if (filtroTurno === 'humano' && !c.ia_pausada) return false
      return true
    })

    if (ordenacao === 'recente') {
      lista = [...lista].sort((a, b) =>
        new Date(b.ultima_mensagem ?? 0).getTime() - new Date(a.ultima_mensagem ?? 0).getTime()
      )
    } else if (ordenacao === 'antiga') {
      lista = [...lista].sort((a, b) =>
        new Date(a.ultima_mensagem ?? 0).getTime() - new Date(b.ultima_mensagem ?? 0).getTime()
      )
    } else if (ordenacao === 'mensagens') {
      lista = [...lista].sort((a, b) => b.total_mensagens - a.total_mensagens)
    }
    return lista
  }, [contatos, busca, filtroTurno, ordenacao])

  // ── Abrir por query string (?phone=...) ───────────────────────────────────
  useEffect(() => {
    if (phoneParam && contatos.length > 0) {
      const c = contatos.find((x) => x.phone === phoneParam)
      if (c) abrirContato(c)
    }
  }, [phoneParam, contatos])

  // ── Histórico ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!contatoSelecionado) return

    const fetch = async () => {
      setLoadingHistorico(true)
      const { data } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', contatoSelecionado.phone)
        .order('id', { ascending: true })
        .limit(100)
      setHistorico((data as Mensagem[]) || [])
      setLoadingHistorico(false)
    }
    fetch()

    const channel = supabase
      .channel(`hist-${contatoSelecionado.phone}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'n8n_chat_histories',
          filter: `session_id=eq.${contatoSelecionado.phone}` },
        (payload) => setHistorico((prev) => [...prev, payload.new as Mensagem])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [contatoSelecionado])

  useEffect(() => {
    if (abaDetalhe === 'historico') fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historico, abaDetalhe])

  // ── Ações individuais ──────────────────────────────────────────────────────
  const abrirContato = (c: Contato) => {
    setContatoSelecionado(c)
    setMostrarConversa(true)
    setAbaDetalhe('historico')
    if (modoSelecao) toggleSelecionar(c.id)
  }

  const handlePausar = async () => {
    if (!contatoSelecionado) return
    await pausarIA(contatoSelecionado.phone)
    setContatoSelecionado({ ...contatoSelecionado, ia_pausada: true, turno_atual: 'humano' })
  }

  const handleRetomar = async () => {
    if (!contatoSelecionado) return
    await retomarIA(contatoSelecionado.phone)
    setContatoSelecionado({ ...contatoSelecionado, ia_pausada: false, turno_atual: 'ia' })
  }

  const handleEtiqueta = async (etiqueta: EtiquetaContato) => {
    if (!contatoSelecionado) return
    await atualizarEtiqueta(contatoSelecionado.phone, etiqueta)
    setContatoSelecionado({ ...contatoSelecionado, etiqueta })
    setEtiquetaDropdown(false)
  }

  // ── Seleção em lote ────────────────────────────────────────────────────────
  const toggleSelecionar = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selecionarTodos = () => {
    if (selecionados.size === contatosFiltrados.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(contatosFiltrados.map((c) => c.id)))
    }
  }

  const cancelarSelecao = () => {
    setModoSelecao(false)
    setSelecionados(new Set())
  }

  const contatosSelecionados = contatos.filter((c) => selecionados.has(c.id))

  const aplicarPausarLote = async () => {
    setAplicandoLote(true)
    await Promise.all(contatosSelecionados.map((c) => pausarIA(c.phone)))
    cancelarSelecao()
    setAplicandoLote(false)
  }

  const aplicarRetomarLote = async () => {
    setAplicandoLote(true)
    await Promise.all(contatosSelecionados.map((c) => retomarIA(c.phone)))
    cancelarSelecao()
    setAplicandoLote(false)
  }

  const aplicarEtiquetaLote = async (etiqueta: EtiquetaContato) => {
    setAplicandoLote(true)
    await Promise.all(contatosSelecionados.map((c) => atualizarEtiqueta(c.phone, etiqueta)))
    cancelarSelecao()
    setEtiquetaLote(false)
    setAplicandoLote(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ── Lista de contatos ── */}
      <div className={`
        ${mostrarConversa ? 'hidden sm:flex' : 'flex'}
        w-full sm:w-80 shrink-0 border-r border-gray-100 bg-white flex-col
      `}>

        {/* Cabeçalho da lista */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Conversas
              {contatosFiltrados.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {contatosFiltrados.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMostrarFiltrosExtras(!mostrarFiltrosExtras)}
                title="Filtros avançados"
                className={`p-1.5 rounded-lg transition-colors ${
                  mostrarFiltrosExtras ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <SlidersHorizontal size={15} />
              </button>
              <button
                onClick={() => { setModoSelecao(!modoSelecao); setSelecionados(new Set()) }}
                title="Seleção em lote"
                className={`p-1.5 rounded-lg transition-colors ${
                  modoSelecao ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CheckSquare size={15} />
              </button>
            </div>
          </div>

          {/* Campo de busca */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nome, número, queixa..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
            />
            {busca && (
              <button onClick={() => setBusca('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtros de etiqueta — scroll horizontal */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {FILTROS_ETIQUETA.map((f) => {
              const ativo = filtroEtiqueta === f.valor
              return (
                <button
                  key={f.label}
                  onClick={() => setFiltroEtiqueta(f.valor)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    ativo ? f.cor : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Filtros extras */}
          {mostrarFiltrosExtras && (
            <div className="space-y-2 pt-1 border-t border-gray-100">
              {/* Turno */}
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Turno</p>
                <div className="flex gap-1.5">
                  {([['todos', 'Todos'], ['ia', 'IA'], ['humano', 'Humano']] as const).map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setFiltroTurno(v)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        filtroTurno === v ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Ordenação */}
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Ordenar por</p>
                <div className="flex gap-1.5">
                  {([['recente', 'Mais recente'], ['antiga', 'Mais antiga'], ['mensagens', 'Mais msgs']] as const).map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setOrdenacao(v)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        ordenacao === v ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Barra de seleção em lote */}
          {modoSelecao && (
            <div className="flex items-center justify-between text-xs bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <button onClick={selecionarTodos} className="flex items-center gap-1.5 text-purple-700 font-medium">
                {selecionados.size === contatosFiltrados.length && contatosFiltrados.length > 0
                  ? <CheckSquare size={14} />
                  : <Square size={14} />
                }
                {selecionados.size === 0
                  ? 'Selecionar todos'
                  : `${selecionados.size} selecionado${selecionados.size > 1 ? 's' : ''}`}
              </button>
              <button onClick={cancelarSelecao} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Lista de cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <p className="text-center text-sm text-gray-400 mt-8">Carregando...</p>
          ) : contatosFiltrados.length === 0 ? (
            <div className="text-center mt-10">
              <MessageSquare size={32} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhuma conversa encontrada</p>
              {busca && (
                <button onClick={() => setBusca('')} className="text-xs text-purple-500 mt-1 hover:underline">
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            contatosFiltrados.map((c) => (
              <CardContatoLista
                key={c.id}
                contato={c}
                ativo={contatoSelecionado?.id === c.id}
                modoSelecao={modoSelecao}
                selecionado={selecionados.has(c.id)}
                onSelect={() => modoSelecao ? toggleSelecionar(c.id) : abrirContato(c)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Ações em lote (barra flutuante) ── */}
      {modoSelecao && selecionados.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 text-sm">
          <span className="font-medium">{selecionados.size} selecionado{selecionados.size > 1 ? 's' : ''}</span>
          <div className="w-px h-4 bg-gray-600" />
          <button
            disabled={aplicandoLote}
            onClick={aplicarPausarLote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            <User size={12} /> Assumir
          </button>
          <button
            disabled={aplicandoLote}
            onClick={aplicarRetomarLote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Bot size={12} /> Devolver à IA
          </button>
          <div className="relative">
            <button
              disabled={aplicandoLote}
              onClick={() => setEtiquetaLote(!etiquetaLote)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Etiqueta <ChevronDown size={12} />
            </button>
            {etiquetaLote && (
              <div className="absolute bottom-10 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                {ETIQUETAS_ORDEM.map((e) => (
                  <button
                    key={e}
                    onClick={() => aplicarEtiquetaLote(e)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BadgeEtiqueta etiqueta={e} small />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={cancelarSelecao} className="p-1 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Painel de detalhe ── */}
      {contatoSelecionado ? (
        <div className={`
          ${mostrarConversa ? 'flex' : 'hidden sm:flex'}
          flex-1 flex-col min-w-0 bg-white
        `}>

          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Voltar (mobile) */}
              <button
                onClick={() => setMostrarConversa(false)}
                className="sm:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-semibold text-purple-700 shrink-0">
                {(contatoSelecionado.nome?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {contatoSelecionado.nome || contatoSelecionado.phone}
                  </h3>
                  {contatoSelecionado.tentativa_jailbreak && (
                    <AlertTriangle size={13} className="text-red-400 shrink-0" />
                  )}
                  <BadgeEtiqueta etiqueta={contatoSelecionado.etiqueta} small />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Phone size={11} />
                    {contatoSelecionado.phone.replace('@s.whatsapp.net', '')}
                  </span>
                  {contatoSelecionado.cidade && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {contatoSelecionado.cidade}/{contatoSelecionado.estado}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Etiqueta dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setEtiquetaDropdown(!etiquetaDropdown)}
                  className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-300"
                >
                  <span className="text-gray-500">Etiqueta</span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                {etiquetaDropdown && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    {ETIQUETAS_ORDEM.map((e) => (
                      <button
                        key={e}
                        onClick={() => handleEtiqueta(e)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <BadgeEtiqueta etiqueta={e} small />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pausar / retomar */}
              {contatoSelecionado.ia_pausada ? (
                <button
                  onClick={handleRetomar}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Bot size={13} />
                  <span className="hidden sm:inline">Devolver para IA</span>
                  <span className="sm:hidden">IA</span>
                </button>
              ) : (
                <button
                  onClick={handlePausar}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <User size={13} />
                  <span className="hidden sm:inline">Assumir Conversa</span>
                  <span className="sm:hidden">Assumir</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs: Histórico | Informações */}
          <div className="flex border-b border-gray-100">
            {(['historico', 'info'] as const).map((aba) => (
              <button
                key={aba}
                onClick={() => setAbaDetalhe(aba)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  abaDetalhe === aba
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {aba === 'historico' ? 'Histórico' : 'Informações'}
              </button>
            ))}
          </div>

          {/* ── Aba Histórico ── */}
          {abaDetalhe === 'historico' && (
            <>
              {contatoSelecionado.principal_queixa && (
                <div className="px-6 py-2 bg-purple-50 border-b border-purple-100">
                  <p className="text-xs text-purple-700">
                    <strong>Queixa principal:</strong> {contatoSelecionado.principal_queixa}
                  </p>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-gray-50">
                {loadingHistorico ? (
                  <p className="text-center text-sm text-gray-400 mt-10">Carregando histórico...</p>
                ) : historico.length === 0 ? (
                  <div className="text-center mt-10">
                    <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Nenhuma mensagem registrada</p>
                  </div>
                ) : (
                  historico.map((msg, i) => {
                    const isHuman = msg.message?.type === 'human'
                    const conteudo = msg.message?.content || ''
                    const hora = msg.created_at
                      ? format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })
                      : ''
                    const isAuto = conteudo.startsWith('[') && conteudo.includes('AUTOMÁTICO')

                    return (
                      <div key={i} className={`flex ${isHuman ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isHuman
                              ? 'bg-[#8B5CF6] text-white rounded-br-sm'
                              : isAuto
                              ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-sm'
                              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">{conteudo}</p>
                          <p className={`text-[10px] mt-1 ${isHuman ? 'text-purple-200' : 'text-gray-400'}`}>
                            {hora}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={fimRef} />
              </div>
              {!contatoSelecionado.ia_pausada && (
                <div className="px-4 sm:px-6 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
                  <Bot size={14} className="text-green-600 shrink-0" />
                  <p className="text-xs text-green-700">
                    A IA está respondendo. Clique em <strong>Assumir Conversa</strong> para responder manualmente.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── Aba Informações ── */}
          {abaDetalhe === 'info' && (
            <div className="flex-1 overflow-y-auto p-6">
              <InfoGrid contato={contatoSelecionado} />
            </div>
          )}
        </div>
      ) : (
        <div className={`
          ${mostrarConversa ? 'hidden sm:flex' : 'hidden sm:flex'}
          flex-1 items-center justify-center bg-gray-50
        `}>
          <div className="text-center">
            <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Selecione uma conversa</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Card da lista (versão interna melhorada) ──────────────────────────────────

function CardContatoLista({
  contato,
  ativo,
  modoSelecao,
  selecionado,
  onSelect,
}: {
  contato: Contato
  ativo: boolean
  modoSelecao: boolean
  selecionado: boolean
  onSelect: () => void
}) {
  const nome = contato.nome || contato.phone.replace('@s.whatsapp.net', '')
  const tempoAtras = contato.ultima_mensagem
    ? formatDistanceToNow(new Date(contato.ultima_mensagem), { locale: ptBR, addSuffix: true })
    : '—'

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
        selecionado
          ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300'
          : ativo
          ? 'border-purple-300 bg-purple-50/60 shadow-sm'
          : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/30'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox ou Avatar */}
        <div className="shrink-0 mt-0.5">
          {modoSelecao ? (
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selecionado ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'
            }`}>
              {selecionado && <span className="text-white text-[10px] font-bold">✓</span>}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700">
              {(contato.nome?.[0] || '?').toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p className="font-semibold text-gray-900 text-sm truncate">{nome}</p>
            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
              contato.ia_pausada ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              {contato.ia_pausada
                ? <User size={10} className="text-yellow-600" />
                : <Bot size={10} className="text-green-600" />
              }
            </div>
          </div>

          {contato.principal_queixa && (
            <p className="text-xs text-gray-500 truncate mb-1.5">{contato.principal_queixa}</p>
          )}

          <div className="flex items-center justify-between gap-1">
            <BadgeEtiqueta etiqueta={contato.etiqueta} small />
            <div className="flex items-center gap-1 text-gray-400 shrink-0">
              {contato.tentativa_jailbreak && (
                <AlertTriangle size={11} className="text-red-400" />
              )}
              <span className="text-[10px]">{tempoAtras}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Grid de informações do contato ──────────────────────────────────────────

function InfoGrid({ contato }: { contato: Contato }) {
  const campos: Array<{ icon: React.ReactNode; label: string; valor: string | null | undefined }> = [
    { icon: <Phone size={14} />,        label: 'Telefone',           valor: contato.phone.replace('@s.whatsapp.net', '') },
    { icon: <MapPin size={14} />,       label: 'Localização',        valor: contato.cidade ? `${contato.cidade} / ${contato.estado}` : null },
    { icon: <Hash size={14} />,         label: 'Status',             valor: contato.status },
    { icon: <Bot size={14} />,          label: 'Turno atual',        valor: contato.ia_pausada ? '👤 Humano' : '🤖 IA' },
    { icon: <Clock size={14} />,        label: 'Primeiro contato',   valor: contato.primeiro_contato ? format(new Date(contato.primeiro_contato), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : null },
    { icon: <Clock size={14} />,        label: 'Última mensagem',    valor: contato.ultima_mensagem ? format(new Date(contato.ultima_mensagem), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : null },
    { icon: <Calendar size={14} />,     label: 'Consulta agendada',  valor: contato.consulta_agendada_em ? format(new Date(contato.consulta_agendada_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : null },
    { icon: <Star size={14} />,         label: 'NPS (última nota)',  valor: contato.nps_ultima_nota != null ? `${contato.nps_ultima_nota}/10` : null },
    { icon: <MessageSquare size={14} />,label: 'Total de mensagens', valor: String(contato.total_mensagens) },
    { icon: <AlertTriangle size={14} />,label: 'Jailbreak count',    valor: contato.jailbreak_count > 0 ? String(contato.jailbreak_count) : null },
  ]

  return (
    <div className="space-y-4">
      {/* Queixa */}
      {contato.principal_queixa && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">Queixa Principal</p>
          <p className="text-sm text-purple-900">{contato.principal_queixa}</p>
        </div>
      )}

      {/* Campos */}
      <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
        {campos
          .filter((c) => c.valor)
          .map((campo) => (
            <div key={campo.label} className="flex items-center gap-3 px-4 py-3">
              <span className="text-gray-400 shrink-0">{campo.icon}</span>
              <span className="text-xs text-gray-500 w-36 shrink-0">{campo.label}</span>
              <span className="text-sm text-gray-800 font-medium truncate">{campo.valor}</span>
            </div>
          ))}
      </div>

      {/* Alertas */}
      {contato.tentativa_jailbreak && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Tentativa de jailbreak registrada</p>
            <p className="text-xs text-red-500">{contato.jailbreak_count} ocorrência{contato.jailbreak_count > 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  )
}
