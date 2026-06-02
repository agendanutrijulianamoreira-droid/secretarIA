import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clientes } from '../lib/db';
import { ADMIN_EMAIL } from '../design-system/tokens';

const BYPASS_KEY = '__admin_bypass';

// Gerencia sessão de autenticação e portal do cliente logado
export function useAuth() {
  const isBypass = sessionStorage.getItem(BYPASS_KEY) === '1';

  const [user, setUser]           = useState(isBypass ? { email: ADMIN_EMAIL, id: 'local-admin' } : null);
  const [authLoading, setLoading] = useState(!isBypass);
  const [portal, setPortal]       = useState(null);

  const resolvePortal = async (u) => {
    if (!u || u.email === ADMIN_EMAIL) return;
    const match = await Clientes.getByEmail(u.email).catch(() => null);
    setPortal(match || {
      id: 'demo-id',
      name: u.email.split('@')[0],
      email: u.email,
      payment_status: 'paid',
      status: 'active',
    });
  };

  useEffect(() => {
    if (isBypass) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      resolvePortal(u);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (u) resolvePortal(u);
      else setPortal(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = () => {
    if (sessionStorage.getItem(BYPASS_KEY)) {
      sessionStorage.removeItem(BYPASS_KEY);
      window.location.reload();
      return;
    }
    return supabase.auth.signOut();
  };

  return { user, authLoading, portal, setPortal, logout };
}
