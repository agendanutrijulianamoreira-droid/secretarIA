import { ETIQUETA_CONFIG } from '../lib/constants'
import type { EtiquetaContato } from '../lib/supabase'

interface Props {
  etiqueta: EtiquetaContato
  small?: boolean
}

export function BadgeEtiqueta({ etiqueta, small }: Props) {
  const cfg = ETIQUETA_CONFIG[etiqueta]
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${cfg.cor} ${cfg.bg} ${cfg.border} ${
        small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {cfg.label}
    </span>
  )
}
