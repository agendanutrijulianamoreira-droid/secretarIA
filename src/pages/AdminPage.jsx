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
import { supabase }       from '../lib/supabase';
import { COLORS, EMPTY_BRIEFING } from '../design-system/tokens';
import { useAdminData }   from '../hooks/useAdminData';
import { ADMIN_EMAIL }    from '../design-system/tokens';
import { Btn, Inp, Card } from './ClientPortal';
import { KeyRound, X }    from 'lucide-react';

function ResetPasswordModal({ client, onClose, onSave }) {
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (pwd.length < 6) { alert('Mínimo 6 caracteres.'); return; }
    setLoading(true);
    const ok = await onSave(client, pwd);
    setLoading(false);
    if (ok) onClose();
  };
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[400] flex items-center justify-center p-8">
      <Card className="w-full max-w-sm animate-fade-in p-0 overflow-hidden shadow-2xl border-amber-500/20">
        <div className="px-8 py-6 border-b border-border-subtle bg-surface-up/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyRound size={18} className="text-amber-500" />
            <h4 className="text-base font-bold text-main">Redefinir senha</h4>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-2xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-5">
          <p className="text-sm text-secondary">Nova senha para <strong className="text-main">{client.name}</strong></p>
          <Inp label="Nova senha" value={pwd} onChange={setPwd} placeholder="Mínimo 6 caracteres" type="password" icon={KeyRound} />
          <Btn onClick={handle} disabled={loading || pwd.length < 6} className="w-full" icon={KeyRound}>
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// Página admin — orquestra views e estado global do painel
export default function AdminPage({ user, theme, toggleTheme, onPortal }) {
  const [view,        setView]       = useState('dashboard');
  const [showNew,     setShowNew]    = useState(false);
  const [pending,     setPending]    = useState(null);
  const [briefCl,     setBriefCl]   = useState(null);
  const [resetClient, setResetClient] = useState(null);

  const { clients, setClients, alerts, loading } = useAdminData(user, ADMIN_EMAIL);

  const addClient = useCallback(async (base, briefing, plan) => {
    const av    = (base?.name || 'CL').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const color = COLORS[clients.length % COLORS.length];
    const { password, ...rest } = base;
    const data  = { ...rest, avatar: av, color, briefing, plan, capabilities: rest.capabilities || ['text'], status: 'active', payment_status: 'paid' };
    try {
      const id = await Clientes.create(data);
      data.id = id;
      setClients(prev => [...prev, data]);
    } catch (err) {
      alert('Erro ao salvar cliente: ' + (err?.message || 'verifique sua conexão'));
      setPending(null);
      return;
    }
    if (password) {
      const { error: fnErr } = await supabase.functions.invoke('create-client-auth', {
        body: { email: rest.email, password },
      });
      if (fnErr) alert(`Cliente salvo, mas erro ao criar login: ${fnErr.message}`);
    }
    setPending(null);
  }, [clients.length]);

  const handleResetPassword = useCallback(async (client, newPassword) => {
    const { error } = await supabase.functions.invoke('create-client-auth', {
      body: { email: client.email, password: newPassword, mode: 'reset' },
    });
    if (error) { alert('Erro ao redefinir senha: ' + error.message); return false; }
    alert(`Senha de ${client.name} redefinida com sucesso!`);
    return true;
  }, []);

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
        {view === 'clients'    && <ClientsTable     clients={clients} onPortal={onPortal} onBriefing={setBriefCl} onNewClient={() => setShowNew(true)} onResetPassword={setResetClient} />}
        {view === 'fluxos'     && <FluxosView       clients={clients} />}
        {view === 'tokens'     && <TokensView       clients={clients} />}
        {view === 'financeiro' && <FinanceiroAdmin  clients={clients} />}
        {view === 'vendas'     && <VendasView       alerts={alerts} />}
        {view === 'stats'      && <StatsView        clients={clients} />}
        {view === 'alerts'     && <AlertsView       alerts={alerts} />}
        {view === 'settings'   && <AdminSettings    user={user} />}
      </AdminLayout>

      {showNew      && <NewClientModal onClose={() => setShowNew(false)} onNext={f => { setPending(f); setShowNew(false); }} onFinish={f => { addClient(f, EMPTY_BRIEFING, f.plan); setShowNew(false); }} />}
      {pending      && <BriefingWizard initial={EMPTY_BRIEFING} planInit={pending.plan} onSave={(b, p) => addClient(pending, b, p)} onCancel={() => setPending(null)} />}
      {briefCl      && <BriefingWizard initial={briefCl.briefing || {}} planInit={briefCl.plan} onSave={(b, p) => updateBriefing(briefCl.id, b, p)} onCancel={() => setBriefCl(null)} />}
      {resetClient  && <ResetPasswordModal client={resetClient} onClose={() => setResetClient(null)} onSave={handleResetPassword} />}
    </>
  );
}
