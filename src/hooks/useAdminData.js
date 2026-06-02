import { useState, useEffect } from 'react';
import { Clientes, Alerts } from '../lib/db';
import { COLORS } from '../design-system/tokens';

// Carrega e escuta dados do painel admin em tempo real
export function useAdminData(user, adminEmail) {
  const [clients, setClients] = useState([]);
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.email !== adminEmail) return;

    const unsub = Clientes.onList(data => {
      const enriched = data.map((c, i) => ({
        ...c,
        avatar: c.avatar || c.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
        color:  c.color  || COLORS[i % COLORS.length],
      }));
      setClients(enriched);
      setLoading(false);
    });

    const unsubAlerts = Alerts.onList(data => setAlerts(data));

    return () => { unsub(); unsubAlerts(); };
  }, [user, adminEmail]);

  return { clients, setClients, alerts, loading };
}
