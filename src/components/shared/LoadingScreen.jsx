import { Logo } from '../UI';

// Tela de carregamento inicial enquanto verifica sessão
export default function LoadingScreen() {
  return (
    <div style={{
      background: "var(--color-bg)", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "24px",
    }}>
      <Logo size={48} />
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--color-primary)", opacity: 0.3,
              animation: `glow-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-tertiary)" }}>
        Carregando...
      </span>
    </div>
  );
}
