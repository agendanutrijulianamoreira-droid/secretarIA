const variants = {
  primary:   { background: 'var(--color-cta)', color: '#FFFFFF', boxShadow: '0 4px 20px -4px rgba(122,139,130,0.4)' },
  secondary: { background: 'var(--color-surface-up)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' },
  ghost:     { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', boxShadow: 'none' },
  danger:    { background: 'rgba(248,81,73,0.05)', color: '#F85149', border: '1px solid rgba(248,81,73,0.12)' },
};

const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: '8px', padding: '10px 20px', borderRadius: '12px',
  fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none',
  fontFamily: 'inherit', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
};

export const Button = ({ children, variant = 'primary', className = "", onClick, icon: Icon, ...props }) => (
  <button
    className={`btn-hover ${className}`}
    onClick={onClick}
    style={{ ...base, ...variants[variant] }}
    {...props}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
);
