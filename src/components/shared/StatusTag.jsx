// Badge de status do cliente (ativo, pausado, configurando)
const STATUS_MAP = {
  active: { l: "Ativo",        c: "#10B981", b: "rgba(16,185,129,0.1)" },
  paused: { l: "Pausado",      c: "#F59E0B", b: "rgba(245,158,11,0.1)" },
  setup:  { l: "Configurando", c: "#94A3B8", b: "rgba(148,163,184,0.1)" },
};

export default function StatusTag({ status }) {
  const m = STATUS_MAP[status] || { l: "—", c: "#94A3B8", b: "transparent" };
  return (
    <div
      className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
      style={{ color: m.c, backgroundColor: m.b, borderColor: m.c + '30' }}
    >
      {m.l}
    </div>
  );
}
