import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Bell, Settings, Bot, Shield, Loader2, BarChart2, Activity } from 'lucide-react'
import { Dashboard } from './pages/Dashboard'
import { Conversas } from './pages/Conversas'
import { Configuracoes } from './pages/Configuracoes'
import { Notificacoes } from './pages/Notificacoes'
import { Admin } from './pages/Admin'
import { Analytics } from './pages/Analytics'
import { Observabilidade } from './pages/Observabilidade'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useNotificacoes } from './hooks/useContatos'
import { BannerTrial } from './components/BannerTrial'

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  const { profile, user } = useAuth()
  const { naoLidas } = useNotificacoes()

  const links = [
    { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/conversas',  icon: MessageSquare,   label: 'Conversas' },
    { to: '/analytics',  icon: BarChart2,        label: 'Analytics' },
    { to: '/notificacoes', icon: Bell,           label: 'Alertas', badge: naoLidas },
    { to: '/configuracoes', icon: Settings,      label: 'Config.' },
    ...(profile?.is_admin ? [
      { to: '/admin',           icon: Shield,   label: 'Admin',  badge: undefined },
      { to: '/observabilidade', icon: Activity, label: 'Obs.',   badge: undefined },
    ] : []),
  ]

  return (
    <aside className="w-16 shrink-0 bg-[#1a1033] flex flex-col items-center py-6 gap-2">
      {/* Logo */}
      <div className="mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
      </div>

      {links.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            `relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isActive
                ? 'bg-[#8B5CF6] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`
          }
        >
          <Icon size={18} />
          {badge != null && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </NavLink>
      ))}

      {/* Avatar do usuário */}
      <div className="mt-auto">
        <NavLink
          to="/configuracoes"
          title={profile?.nome_profissional || user?.email || 'Perfil'}
          className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold"
        >
          {(profile?.nome_profissional || user?.email || '?')[0].toUpperCase()}
        </NavLink>
      </div>
    </aside>
  )
}

// ─── Guarda de rota autenticada ───────────────────────────────────────────────

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 size={28} className="animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (profile && !profile.onboarding_completo && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

// ─── Layout principal ─────────────────────────────────────────────────────────

function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <BannerTrial />
        <div className="flex-1 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/conversas"    element={<Conversas />} />
            <Route path="/analytics"    element={<Analytics />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/admin"           element={<Admin />} />
          <Route path="/observabilidade" element={<Observabilidade />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0a1e]">
        <Loader2 size={28} className="animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Onboarding — requer auth mas não onboarding_completo */}
      <Route
        path="/onboarding"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <Onboarding />
          )
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/*"
        element={
          <RotaProtegida>
            <Layout />
          </RotaProtegida>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
