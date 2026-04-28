import React, { useState, useEffect } from "react";
import { Megaphone, Save, Plus, Trash2, Clock, Percent, ShieldCheck, Zap } from "lucide-react";
import { PageTitle, Card, Btn, Inp } from "../../pages/ClientPortal";

// Componente para Toggle Switch animado
function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-up/20 border border-border-subtle hover:border-primary/20 transition-all">
      <div className="flex-1">
        <h4 className="text-sm font-black text-main">{label}</h4>
        {description && <p className="text-[10px] text-tertiary mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background ${
          enabled ? "bg-primary" : "bg-surface-up border border-border-subtle"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-300 ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function MarketingView({ client }) {
  // Estados para PUV
  const [puv, setPuv] = useState("");
  const [loadingPuv, setLoadingPuv] = useState(false);

  // Estados para Promoções
  const [promotions, setPromotions] = useState([]);
  const [newPromo, setNewPromo] = useState({ title: "", description: "", discount_rules: "" });
  const [loadingPromos, setLoadingPromos] = useState(false);

  // Estados para Automações
  const [config, setConfig] = useState({
    recovery_enabled: true,
    nps_enabled: true,
    reengagement_enabled: false
  });

  // Simulando chamadas de API (como o backend para essas rotas CRUD precisa ser criado,
  // faremos a estrutura pronta para receber o fetch real).
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // O fetch real usaria:
  // fetch(`${API_URL}/api/marketing/promotions`, { headers: { Authorization: `Bearer ${client.token}` }})

  useEffect(() => {
    // Aqui seria o GET real no PostgreSQL. Como o prompt focou na UI e chamadas, 
    // vamos inicializar com vazio para o usuário cadastrar.
    // Simulando carregamento:
    setTimeout(() => {
      setPromotions([
        { id: '1', title: 'Mês da Mulher', description: '50% off na bioimpedância', discount_rules: 'Válido até fim do mês' }
      ]);
      setPuv("Nosso método foca em reequilibrar seus hormônios sem dietas restritivas, permitindo que você perca peso com saúde e mantenha a energia o dia todo.");
    }, 500);
  }, []);

  const handleSavePuv = async () => {
    setLoadingPuv(true);
    // Simular API Call:
    // await fetch('/api/marketing/templates', { method: 'POST', body: JSON.stringify({ type: 'puv', content_text: puv }) })
    setTimeout(() => {
      setLoadingPuv(false);
      alert("PUV salva com sucesso!");
    }, 800);
  };

  const handleAddPromo = async () => {
    if (!newPromo.title) return;
    setLoadingPromos(true);
    // Simular API Call
    setTimeout(() => {
      setPromotions([...promotions, { ...newPromo, id: Date.now().toString() }]);
      setNewPromo({ title: "", description: "", discount_rules: "" });
      setLoadingPromos(false);
    }, 600);
  };

  const handleDeletePromo = async (id) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageTitle 
        icon={Megaphone} 
        title="Marketing & Vendas" 
        subtitle="Gerencie sua Proposta Única de Valor (PUV), promoções e o motor de automação." 
      />

      {/* Bento Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: PUV & Automações */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          
          {/* Card: Automações do Scheduler */}
          <Card className="flex flex-col">
            <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-surface-soft/30 rounded-t-2xl">
              <Zap size={18} className="text-cta" />
              <h3 className="text-sm font-black text-main">Motor de Automação</h3>
            </div>
            <div className="p-6 space-y-4">
              <Toggle 
                label="Recuperação de Leads (7 dias)"
                description="Aciona o agente de vendas para leads estagnados."
                enabled={config.recovery_enabled}
                onChange={(val) => setConfig({...config, recovery_enabled: val})}
              />
              <Toggle 
                label="Pesquisa NPS (24h)"
                description="Envia avaliação pós-consulta automaticamente."
                enabled={config.nps_enabled}
                onChange={(val) => setConfig({...config, nps_enabled: val})}
              />
              <Toggle 
                label="Reengajamento (3/6 meses)"
                description="Busca pacientes antigos para novas consultas."
                enabled={config.reengagement_enabled}
                onChange={(val) => setConfig({...config, reengagement_enabled: val})}
              />
            </div>
          </Card>

          {/* Card: PUV Editor */}
          <Card className="flex-1 flex flex-col">
             <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-surface-soft/30 rounded-t-2xl">
                <ShieldCheck size={18} className="text-primary" />
                <h3 className="text-sm font-black text-main">Proposta Única de Valor (PUV)</h3>
             </div>
             <div className="p-6 flex-1 flex flex-col gap-4">
                <p className="text-xs text-secondary mb-2">
                  Escreva o diferencial competitivo da clínica. O Agente de Vendas usará este texto para argumentar com os pacientes antes de apresentar o preço.
                </p>
                <Inp 
                  rows={6}
                  placeholder="Ex: Somos especialistas em emagrecimento sem dietas restritivas..."
                  value={puv}
                  onChange={setPuv}
                />
                <Btn onClick={handleSavePuv} disabled={loadingPuv} className="mt-auto w-full" icon={Save}>
                  {loadingPuv ? "Salvando..." : "Salvar PUV"}
                </Btn>
             </div>
          </Card>
        </div>

        {/* Coluna Direita: Promoções Ativas */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-surface-soft/30 rounded-t-2xl">
              <Percent size={18} className="text-amber-500" />
              <h3 className="text-sm font-black text-main">Gerenciador de Promoções</h3>
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-8">
              
              {/* Add New Promo */}
              <div className="p-5 rounded-2xl bg-surface-up/10 border border-primary/20 space-y-4">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Adicionar Nova Promoção</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Inp 
                    placeholder="Título (ex: Semana da Mulher)" 
                    value={newPromo.title} 
                    onChange={(val) => setNewPromo({...newPromo, title: val})} 
                  />
                  <Inp 
                    placeholder="Regras (ex: 20% OFF no checkup)" 
                    value={newPromo.discount_rules} 
                    onChange={(val) => setNewPromo({...newPromo, discount_rules: val})} 
                  />
                </div>
                <Inp 
                  placeholder="Descrição interna para o agente..." 
                  value={newPromo.description} 
                  onChange={(val) => setNewPromo({...newPromo, description: val})} 
                />
                <Btn variant="primary" onClick={handleAddPromo} disabled={loadingPromos} icon={Plus}>
                  Adicionar Oferta
                </Btn>
              </div>

              {/* List of Promos */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em] ml-1">Promoções Ativas</h4>
                
                {promotions.length === 0 ? (
                  <div className="p-10 text-center border border-dashed border-border-subtle rounded-2xl">
                    <p className="text-tertiary text-sm font-medium">Nenhuma promoção ativa no momento.</p>
                  </div>
                ) : (
                  promotions.map(promo => (
                    <div key={promo.id} className="group p-5 rounded-2xl bg-surface-up/30 border border-border-subtle flex items-center justify-between hover:border-primary/30 transition-all">
                      <div>
                        <h5 className="text-sm font-black text-main">{promo.title}</h5>
                        <p className="text-[11px] text-tertiary mt-1 max-w-md">{promo.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {promo.discount_rules}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePromo(promo.id)}
                        className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
