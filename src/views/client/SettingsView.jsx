import React, { useState } from "react";
import { Settings, Smartphone, MessageCircle, AlertTriangle, ShieldCheck, Key, Save, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { PageTitle, Card, Btn, Inp, Pulse } from "../../pages/ClientPortal";

export default function SettingsView({ client }) {
  const [loading, setLoading] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const [credentials, setCredentials] = useState({
    accessToken: "",
    phoneNumberId: "",
    wabaId: ""
  });
  
  // Simulando status de conexão do banco
  const [isConnected, setIsConnected] = useState(false);

  const handleSaveCredentials = () => {
    setLoading(true);
    // Simula chamada de API para salvar tokens no banco
    setTimeout(() => {
      setLoading(false);
      setIsConnected(true);
      alert("Credenciais salvas com sucesso! O WhatsApp Cloud API está conectado.");
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageTitle 
        icon={Settings} 
        title="Configurações & Integrações" 
        subtitle="Gerencie os canais de atendimento e os acessos técnicos da sua clínica." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card: Conexão Oficial WhatsApp */}
        <Card className="flex flex-col">
          <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-soft/30 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <MessageCircle size={18} className="text-primary" />
              <h3 className="text-sm font-black text-main">Conexão Oficial WhatsApp</h3>
            </div>
            {/* Status da Conexão */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              <Pulse status={isConnected ? "online" : "offline"} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isConnected ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <p className="text-xs text-secondary leading-relaxed">
              Integre sua conta do WhatsApp Business diretamente pelo nosso portal. Ao utilizar a <b>Cloud API Oficial da Meta</b>, você garante estabilidade e segurança sem depender de QR Codes no celular.
            </p>

            {/* Integração 1-Click (Em breve) */}
            <div className="p-5 rounded-2xl bg-surface-up/30 border border-border-subtle space-y-4">
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-main">Integração Rápida</h4>
                <p className="text-[11px] text-tertiary">
                  Conecte seu catálogo e números com apenas um clique utilizando sua conta do Facebook Business.
                </p>
              </div>
              
              <div className="relative group inline-block w-full">
                <button 
                  disabled
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] font-semibold text-xs opacity-60 cursor-not-allowed transition-all"
                >
                  <MessageCircle size={16} />
                  Conectar com Meta (Em breve)
                </button>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-slate-800 text-slate-200 text-[10px] py-1.5 px-3 rounded shadow-xl whitespace-nowrap border border-slate-700">
                    Integração (Embedded Signup) em fase de homologação pela Meta.
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border-subtle" />

            {/* Área Técnica / Concierge (Manual) */}
            <div>
              <button 
                onClick={() => setShowConcierge(!showConcierge)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-up/20 border border-border-subtle hover:border-primary/20 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold text-main">Área Técnica / Concierge</h4>
                    <p className="text-[10px] text-tertiary mt-0.5">Inserção manual de tokens (Para uso do Suporte)</p>
                  </div>
                </div>
                {showConcierge ? <ChevronUp size={16} className="text-tertiary" /> : <ChevronDown size={16} className="text-tertiary" />}
              </button>

              {/* Formulário Manual Expansível */}
              {showConcierge && (
                <div className="mt-4 p-5 rounded-2xl bg-surface-up/10 border border-amber-500/20 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-[10px] font-medium">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <p>Cuidado: Modificar estas chaves pode desconectar a IA e interromper os fluxos de venda e agendamento da clínica.</p>
                  </div>

                  <Inp 
                    label="Token de Acesso (Access Token)"
                    placeholder="EAAI... ou EAAG..."
                    value={credentials.accessToken}
                    onChange={(val) => setCredentials({ ...credentials, accessToken: val })}
                    icon={Key}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Inp 
                      label="Phone Number ID"
                      placeholder="Ex: 10492839485..."
                      value={credentials.phoneNumberId}
                      onChange={(val) => setCredentials({ ...credentials, phoneNumberId: val })}
                      icon={Smartphone}
                    />
                    <Inp 
                      label="WABA ID"
                      placeholder="Ex: 10293847566..."
                      value={credentials.wabaId}
                      onChange={(val) => setCredentials({ ...credentials, wabaId: val })}
                      icon={Smartphone}
                    />
                  </div>

                  <Btn 
                    variant="primary" 
                    onClick={handleSaveCredentials} 
                    disabled={loading || !credentials.accessToken || !credentials.phoneNumberId || !credentials.wabaId} 
                    className="w-full mt-2" 
                    icon={Save}
                  >
                    {loading ? "Salvando Credenciais..." : "Salvar Credenciais da Meta"}
                  </Btn>
                </div>
              )}
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}
