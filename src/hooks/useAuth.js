import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clientes } from '../lib/db';
import { ADMIN_EMAIL } from '../design-system/tokens';

// Gerencia sessão de autenticação e portal do cliente logado
export function useAuth() {
  const [user, setUser]           = useState(null);
  const [authLoading, setLoading] = useState(true);
  const [portal, setPortal]       = useState(null);

  const resolvePortal = async (u) => {
    if (!u || u.email === ADMIN_EMAIL) return;
    const match = await Clientes.getByEmail(u.email).catch(() => null);
    if (match) { setPortal(match); return; }
    try {
      const id = await Clientes.create({
        name: u.displayName || u.email.split('@')[0],
        email: u.email,
        plan: 'Starter',
        payment_status: 'paid',
        status: 'active',
      });
      const created = await Clientes.get(id);
      setPortal(created);
    } catch {
      setPortal({ id: null, name: u.email.split('@')[0], email: u.email, plan: 'Starter', payment_status: 'paid', status: 'active' });
    }
  };

  useEffect(() => {
    // Limpa bypass antigo que possa ter ficado no sessionStorage
    sessionStorage.removeItem('__admin_bypass');

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

  const logout = () => supabase.auth.signOut();

  return { user, authLoading, portal, setPortal, logout };
}
