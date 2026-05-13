import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[SecretarIA] Erro crítico:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#020617',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          fontFamily: 'Inter, sans-serif',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h1 style={{ color: '#F8FAFC', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Falha ao inicializar o sistema
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '14px', maxWidth: '420px', margin: 0, lineHeight: 1.6 }}>
            As variáveis de ambiente do Firebase não estão configuradas no Railway.
            Acesse o painel do Railway → serviço <strong style={{ color: '#F8FAFC' }}>secretaria</strong> → <strong style={{ color: '#F8FAFC' }}>Variables</strong> e adicione as chaves <code style={{ background: '#1E293B', padding: '2px 6px', borderRadius: '4px' }}>VITE_FIREBASE_*</code>.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#10B981',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Recarregar
          </button>
          <details style={{ color: '#475569', fontSize: '12px', maxWidth: '500px' }}>
            <summary style={{ cursor: 'pointer' }}>Detalhes técnicos</summary>
            <pre style={{ marginTop: '8px', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
