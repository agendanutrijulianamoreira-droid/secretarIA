const colors = {
  green: { bg: 'rgba(122,139,130,0.1)', text: '#7A8B82' },
  blue:  { bg: 'rgba(59,130,246,0.1)',  text: '#3B82F6' },
  amber: { bg: 'rgba(182,122,98,0.1)',  text: '#B67A62' },
  red:   { bg: 'rgba(239,68,68,0.1)',   text: '#EF4444' },
};

export const Badge = ({ children, color = 'green', className = "" }) => {
  const c = colors[color] || colors.green;
  return (
    <span
      className={className}
      style={{
        padding: '6px 12px', borderRadius: '100px', fontSize: '11px',
        fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
        background: c.bg, color: c.text, display: 'inline-flex',
        alignItems: 'center', gap: '6px', border: `1px solid ${c.text}22`,
      }}
    >
      {children}
    </span>
  );
};
