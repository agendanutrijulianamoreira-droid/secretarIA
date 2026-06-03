import { useState } from "react";
import { useClientPortalData } from "../hooks/useClientPortalData";
import { ClientDashboardView, WhatsAppView } from "./ClientPortal";
import CRM1View            from "../views/client/CRM1View";
import CRM2View            from "../views/client/CRM2View";
import FinanceiroClienteView from "../views/client/FinanceiroCliente";
import IAAprendizadosView  from "../views/client/IAAprendizados";
import EquipeView          from "../views/client/EquipeView";
import MarketingView       from "../views/client/MarketingView";
import SettingsView        from "../views/client/SettingsView";
import OnboardingChat      from "../views/client/OnboardingChat";
import PlanoView           from "../views/client/PlanoView";
import { ClientSidebar }   from "../components/shared/ClientSidebar";
import { ClientHeader }    from "../components/shared/ClientHeader";

const VIEW_LABELS = {
  dashboard:  "Dashboard de Inteligência",
  whatsapp:   "Agentes IA",
  crm1:       "Funil de Leads",
  crm2:       "Gestão de Clientes",
  equipe:     "Equipe & Agenda",
  financeiro: "Financeiro & Vendas",
  marketing:  "Marketing & Vendas",
  ia:         "Cérebro da IA",
  plano:      "Plano & Cobrança",
  settings:   "Configurações",
};

export default function ClientPortalMain({ client, onBack }) {
  const [view, setView] = useState("dashboard");
  const { leads, pacientes, campanhas, numbers, servicos, vendas, aprendizados, invoices, reloadNumbers } = useClientPortalData(client.id);
  const numPendentes = aprendizados.filter(a => a.status === "pendente").length;

  if (client.status === "onboarding" || client.status === "setup") {
    return <OnboardingChat client={client} onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="flex min-h-screen bg-background text-main font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      <ClientSidebar client={client} view={view} setView={setView} numPendentes={numPendentes} onBack={onBack} />
      <main className="flex-1 ml-[300px] min-h-screen flex flex-col relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cta/5 rounded-full blur-[100px] pointer-events-none" />
        <ClientHeader viewLabel={VIEW_LABELS[view]} numbers={numbers} />
        <div className="flex-1 p-12 overflow-x-hidden relative z-10">
          <div className="max-w-7xl mx-auto pb-20">
            {view === "dashboard"  && <ClientDashboardView client={client} leads={leads} pacientes={pacientes} whatsappNums={numbers} />}
            {view === "whatsapp"   && <WhatsAppView client={client} numbers={numbers} reload={reloadNumbers} />}
            {view === "crm1"       && <CRM1View client={client} leads={leads} />}
            {view === "crm2"       && <CRM2View client={client} pacientes={pacientes} campanhas={campanhas} />}
            {view === "equipe"     && <EquipeView client={client} />}
            {view === "financeiro" && <FinanceiroClienteView client={client} servicos={servicos} vendas={vendas} invoices={invoices} />}
            {view === "marketing"  && <MarketingView client={client} />}
            {view === "ia"         && <IAAprendizadosView client={client} aprendizados={aprendizados} />}
            {view === "plano"      && <PlanoView client={client} invoices={invoices} />}
            {view === "settings"   && <SettingsView client={client} />}
          </div>
        </div>
      </main>
    </div>
  );
}
