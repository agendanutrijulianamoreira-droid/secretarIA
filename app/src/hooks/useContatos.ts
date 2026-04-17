import { useEffect, useState, useCallback } from 'react'
import { supabase, type Contato, type EtiquetaContato } from '../lib/supabase'

export function useContatos(filtroEtiqueta?: EtiquetaContato) {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContatos = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('contatos')
        .select('*')
        .order('ultima_mensagem', { ascending: false, nullsFirst: false })

      if (filtroEtiqueta) {
        query = query.eq('etiqueta', filtroEtiqueta)
      }

      const { data, error: err } = await query
      if (err) throw err
      setContatos(data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar contatos')
    } finally {
      setLoading(false)
    }
  }, [filtroEtiqueta])

  useEffect(() => {
    fetchContatos()

    // Realtime subscription
    const channel = supabase
      .channel('contatos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos' },
        () => fetchContatos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchContatos])

  return { contatos, loading, error, refetch: fetchContatos }
}

export function useContato(phone: string) {
  const [contato, setContato] = useState<Contato | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!phone) return

    const fetchContato = async () => {
      const { data } = await supabase
        .from('contatos')
        .select('*')
        .eq('phone', phone)
        .single()
      setContato(data)
      setLoading(false)
    }

    fetchContato()

    const channel = supabase
      .channel(`contato-${phone}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contatos', filter: `phone=eq.${phone}` },
        (payload) => setContato(payload.new as Contato)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [phone])

  return { contato, loading }
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<import('../lib/supabase').Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('notificacoes_humano')
        .select('*')
        .eq('lida', false)
        .order('criado_em', { ascending: false })
        .limit(50)
      setNotificacoes(data || [])
      setNaoLidas(data?.length || 0)
    }

    fetch()

    const channel = supabase
      .channel('notificacoes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notificacoes_humano' },
        fetch
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { notificacoes, naoLidas }
}
