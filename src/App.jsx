import LoginForm      from './components/auth/LoginForm';
import PaywallView    from './components/paywall/PaywallView';
import LoadingScreen  from './components/shared/LoadingScreen';
import AdminPage      from './pages/AdminPage';
import ClientPortalPage from './pages/ClientPortalPage';
import LandingPage    from './pages/LandingPage';
import { useAuth }    from './hooks/useAuth';
import { useTheme }   from './hooks/useTheme';
import { Clientes }   from './lib/db';
import { COLORS, ADMIN_EMAIL } from './design-system/tokens';

export default function App() {
  const { user, authLoading, portal, setPortal, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (window.location.search.includes('vendas=true')) return <LandingPage />;
  if (authLoading) return <LoadingScreen />;
  if (!user)       return <LoginForm />;

  const isAdmin    = user.email === ADMIN_EMAIL;
  const showPaywall = !isAdmin && (!portal || portal.payment_status !== 'paid');

  if (showPaywall) return <PaywallView user={user} onPlanSelected={handlePlan} />;
  if (portal)      return <ClientPortalPage client={portal} onBack={() => setPortal(null)} />;

  return <AdminPage user={user} theme={theme} toggleTheme={toggleTheme} onPortal={setPortal} logout={logout} />;

  async function handlePlan(plan) {
    try {
      const data = { name: user.displayName || user.email.split('@')[0], email: user.email, plan: plan.id, payment_status: 'paid', status: 'active' };
      let id = portal?.id && portal.id !== 'demo-id' && portal.id !== null ? portal.id : null;
      if (id) {
        await Clientes.update(id, data);
      } else {
        id = await Clientes.create(data);
      }
      const updated = await Clientes.get(id);
      setPortal(updated);
    } catch (err) { alert('Erro ao processar plano: ' + err.message); }
  }
}
