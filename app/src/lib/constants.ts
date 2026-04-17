import type { EtiquetaContato } from './supabase'

export const ETIQUETA_CONFIG: Record<
  EtiquetaContato,
  { label: string; cor: string; bg: string; border: string }
> = {
  NOVO_LEAD: {
    label: 'Novo Lead',
    cor: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  EM_ATENDIMENTO_IA: {
    label: 'IA Ativa',
    cor: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  AGUARDANDO_HUMANO: {
    label: 'Aguard. Humano',
    cor: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
  },
  CONSULTA_AGENDADA: {
    label: 'Consulta Agendada',
    cor: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  PACIENTE_ATIVO: {
    label: 'Paciente Ativa',
    cor: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  FOLLOW_UP_PENDENTE: {
    label: 'Follow-up Pendente',
    cor: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  INATIVO_30D: {
    label: 'Inativa 30d',
    cor: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
  AGUARDANDO_PRECO: {
    label: 'Aguard. Preço',
    cor: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
}

export const ETIQUETAS_ORDEM: EtiquetaContato[] = [
  'AGUARDANDO_HUMANO',
  'AGUARDANDO_PRECO',
  'NOVO_LEAD',
  'EM_ATENDIMENTO_IA',
  'FOLLOW_UP_PENDENTE',
  'CONSULTA_AGENDADA',
  'PACIENTE_ATIVO',
  'INATIVO_30D',
]
