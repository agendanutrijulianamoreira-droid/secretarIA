import React from 'react';

export const Card = ({ children, className = "", style = {} }) => (
  <div 
    className={`glass-card ${className}`} 
    style={{ 
      padding: '24px', 
      borderRadius: '24px', 
      ...style 
    }}
  >
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = "", onClick, icon: Icon, ...props }) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const variants = {
    primary: {
      background: 'var(--color-cta)',
      color: '#FFFFFF',
      boxShadow: '0 4px 20px -4px rgba(122, 139, 130, 0.4)',
    },
    secondary: {
      background: 'var(--color-surface-up)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-sec)',
      border: '1px solid var(--color-border)',
      boxShadow: 'none',
    },
    danger: {
      background: 'rgba(248, 81, 73, 0.05)',
      color: '#F85149',
      border: '1px solid rgba(248, 81, 73, 0.12)',
    }
  };

  return (
    <button 
      className={`btn-hover ${className}`}
      onClick={onClick}
      style={{ ...baseStyle, ...variants[variant] }}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'green', className = "" }) => {
  const colors = {
    green: { bg: 'rgba(122, 139, 130, 0.1)', text: '#7A8B82' }, // Sálvia
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6' },
    amber: { bg: 'rgba(182, 122, 98, 0.1)', text: '#B67A62' }, // Terracota
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444' },
  };

  return (
    <span 
      className={className}
      style={{
        padding: '6px 12px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: colors[color]?.bg || colors.green.bg,
        color: colors[color]?.text || colors.green.text,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        border: `1px solid ${colors[color]?.text}22`
      }}
    >
      {children}
    </span>
  );
};

export const Logo = ({ size = 32, className = "" }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <div className="relative flex items-center justify-center" style={{ width: size * 1.3, height: size * 1.3 }}>
      <svg viewBox="0 0 100 100" width={size * 1.3} height={size * 1.3} className="overflow-visible" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>
        {/* Lado Humano - Curva Suave e Orgânica */}
        <path 
          d="M50 10 C30 10 15 25 15 50 C15 75 30 90 50 90" 
          fill="none" 
          stroke="var(--color-text)" 
          strokeWidth="7" 
          strokeLinecap="round" 
        />
        {/* Lado Robótico - Geometria de Precisão */}
        <path 
          d="M50 10 L85 25 L85 75 L50 90" 
          fill="none" 
          stroke="var(--color-cta)" 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Core de Inteligência (O olho da IA) */}
        <circle 
          cx="68" 
          cy="42" 
          r="6" 
          fill="var(--color-cta)" 
          style={{ filter: 'drop-shadow(0 0 8px var(--color-cta))' }}
        />
        {/* Conexões de Circuito */}
        <path d="M85 50 H75" stroke="var(--color-cta)" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 10 V90" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    </div>
    
    <div className="flex flex-col leading-none">
      <span style={{ 
        fontSize: size * 0.75, 
        fontWeight: 900, 
        letterSpacing: '-0.04em',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textTransform: "uppercase",
        color: 'var(--color-text)'
      }}>
        Secretár<span style={{ color: 'var(--color-cta)' }}>IA</span>
      </span>
      <span style={{ 
        fontSize: '9px', 
        letterSpacing: '0.4em', 
        textTransform: 'uppercase', 
        fontWeight: 800,
        color: 'var(--color-cta)',
        marginTop: '4px',
        opacity: 0.8
      }}>
        Artificial Intelligence
      </span>
    </div>
  </div>
);


