export const Logo = ({ size = 32, className = "" }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <div className="relative flex items-center justify-center" style={{ width: size * 1.3, height: size * 1.3 }}>
      <svg viewBox="0 0 100 100" width={size * 1.3} height={size * 1.3} className="overflow-visible" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>
        <path d="M50 10 C30 10 15 25 15 50 C15 75 30 90 50 90" fill="none" stroke="var(--color-text-main)" strokeWidth="7" strokeLinecap="round" />
        <path d="M50 10 L85 25 L85 75 L50 90" fill="none" stroke="var(--color-cta)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="68" cy="42" r="6" fill="var(--color-cta)" style={{ filter: 'drop-shadow(0 0 8px var(--color-cta))' }} />
        <path d="M85 50 H75" stroke="var(--color-cta)" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 10 V90" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    </div>
    <div className="flex flex-col leading-none">
      <span style={{ fontSize: size * 0.75, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: "uppercase", color: 'var(--color-text-main)' }}>
        Secretár<span style={{ color: 'var(--color-cta)' }}>IA</span>
      </span>
      <span style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-cta)', marginTop: '4px', opacity: 0.8 }}>
        Artificial Intelligence
      </span>
    </div>
  </div>
);
