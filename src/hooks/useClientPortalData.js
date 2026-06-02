import { useState, useEffect } from 'react';
import {
  Contatos, Pacientes, Campanhas, WhatsAppNumbers,
  Servicos, Vendas, IAAprendizados, Invoices,
} from '../lib/db';

export function useClientPortalData(clientId) {
  const [leads,        setLeads]        = useState([]);
  const [pacientes,    setPacientes]    = useState([]);
  const [campanhas,    setCampanhas]    = useState([]);
  const [numbers,      setNumbers]      = useState([]);
  const [servicos,     setServicos]     = useState([]);
  const [vendas,       setVendas]       = useState([]);
  const [aprendizados, setAprendizados] = useState([]);
  const [invoices,     setInvoices]     = useState([]);

  useEffect(() => {
    if (!clientId) return;
    const subs = [
      Contatos.onList(clientId,        setLeads),
      Pacientes.onList(clientId,       setPacientes),
      Campanhas.onList(clientId,       setCampanhas),
      WhatsAppNumbers.onList(clientId, setNumbers),
      Servicos.onList(clientId,        setServicos),
      Vendas.onList(clientId,          setVendas),
      IAAprendizados.onList(clientId,  setAprendizados),
      Invoices.onList(clientId,        setInvoices),
    ];
    return () => subs.forEach(fn => fn?.());
  }, [clientId]);

  const reloadNumbers = () => WhatsAppNumbers.list(clientId).then(setNumbers);

  return { leads, pacientes, campanhas, numbers, servicos, vendas, aprendizados, invoices, reloadNumbers };
}
