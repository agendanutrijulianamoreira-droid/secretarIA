import { useState, useCallback } from 'react';
import AdminLayout        from '../components/layout/AdminLayout';
import DashboardView      from '../views/admin/DashboardView';
import FluxosView         from '../views/admin/FluxosView';
import TokensView         from '../views/admin/TokensView';
import FinanceiroAdmin    from '../components/financeiro/FinanceiroAdmin';
import AlertsView         from '../components/alerts/AlertsView';
import VendasView         from '../components/vendas/VendasView';
import StatsView          from '../components/stats/StatsView';
import AdminSettings      from '../components/settings/AdminSettings';
import ClientsTable       from '../components/clients/ClientsTable';
import NewClientModal     from '../components/clients/NewClientModal';
import BriefingWizard     from '../components/briefing/BriefingWizard';
import { Clientes }       from '../lib/db';
import { COLORS, EMPTY_BRIEFING } from '../design-system/tokens';
import { useAdminData }   from '../hooks/useAdminData';
import { ADMIN_EMAIL }    from '../design-system/tokens';

// Página admin — orquestra views e estado global do painel
export default function AdminPage({ user, theme, toggleTheme, onPortal }) {
  const [view,       setView]      = useState('dashboard');
  const [showNew,    setShowNew]   = useState(false);
  const [pending,    setPending]   = useState(null);
  const [briefCl,    setBriefCl]   = useState(null);

  const { clients, setClients, alerts, loading } = useAdminData(user, ADMIN_EMAIL);

  const addClient = useCallback(async (base, briefing, plan) => {
    const av    = (base?.name || 'CL').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const color = COLORS[clients.length % COLORS.length];
    const data  = { ...base, avatar: av, color, briefing, plan, capabilities: base.capabilities || ['text'], status: 'active', payment_status: 'paid' };
    try {
      await Clientes.create(data);
    } catch {
      data.id = 'demo-' + Date.now();
    }
    setClients(prev => [...prev, data]);
    setPending(null);
  }, [clients.length]);

  const updateBriefing = useCallback(async (id, briefing, plan) => {
    try { await Clientes.updateBriefing(id, briefing, plan); } catch { /* local only */ }
    setClients(prev => prev.map(c => c.id === id ? { ...c, briefing, plan } : c));
    setBriefCl(null);
  }, []);

  return (
    <>
      <AdminLayout
        user={user} logout={() => {}} setView={setView}
        activeView={view} alertCount={alerts.filter(a => !a.read).length}
        theme={theme} toggleTheme={toggleTheme}
      >
        {view === 'dashboard'  && <DashboardView   clients={clients} alerts={alerts} onPortal={onPortal} />}
        {view === 'clients'    && <ClientsTable     clients={clients} onPortal={onPortal} onBriefing={setBriefCl} onNewClient={() => setShowNew(true)} />}
        {view === 'fluxos'     && <FluxosView       clients={clients} />}
        {view === 'tokens'     && <TokensView       clients={clients} />}
        {view === 'financeiro' && <FinanceiroAdmin  clients={clients} />}
        {view === 'vendas'     && <VendasView       alerts={alerts} />}
        {view === 'stats'      && <StatsView        clients={clients} />}
        {view === 'alerts'     && <AlertsView       alerts={alerts} />}
        {view === 'settings'   && <AdminSettings    user={user} />}
      </AdminLayout>

      {showNew && (
        <NewClientModal
          onClose={() => setShowNew(false)}
          onNext={f => { setPending(f); setShowNew(false); }}
          onFinish={f => { addClient(f, EMPTY_BRIEFING, f.plan); setShowNew(false); }}
        />
      )}
      {pending  && <BriefingWizard initial={EMPTY_BRIEFING} planInit={pending.plan} onSave={(b, p) => addClient(pending, b, p)} onCancel={() => setPending(null)} />}
      {briefCl  && <BriefingWizard initial={briefCl.briefing || {}} planInit={briefCl.plan} onSave={(b, p) => updateBriefing(briefCl.id, b, p)} onCancel={() => setBriefCl(null)} />}
    </>
  );
}
