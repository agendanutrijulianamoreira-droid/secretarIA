import { supabase } from '../../lib/supabase';
import { Logo } from '../shared/Logo';
import { Btn } from '../../pages/ClientPortal';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';

const PLANS = [
  {
    id: 'starter', name: 'Plano Slim', price: '197',
    desc: 'Essencial para nutris que atuam sozinhas.',
    features: ['Clone de Personalidade', 'WhatsApp 24/7', 'Fluxos de Triagem', 'Dashboard'],
  },
  {
    id: 'pro', name: 'Plano Clinic', price: '497', isPopular: true,
    desc: 'Para quem busca escala massiva e conversão de leads.',
    features: ['Tudo do Slim', 'Agendamento IA', 'Análise de Sentimento', 'Follow-up Cognitivo'],
  },
  {
    id: 'enterprise', name: 'Smart VIP', price: '997',
    desc: 'Para clínicas multiprofissionais e redes de elite.',
    features: ['Tudo do Clinic', 'Interações Ilimitadas', 'Multi-Agentes Custom', 'Suporte VIP'],
  },
];

// Tela de seleção de plano exibida para usuários sem assinatura ativa
export default function PaywallView({ user, onPlanSelected }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 font-sans relative overflow-hidden text-main">
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 blur-[160px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="max-w-7xl w-full space-y-16 animate-fade-in relative z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4"><Logo size={80} /></div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Escolha seu plano</h2>
          <p className="text-secondary max-w-xl mx-auto text-lg font-medium">
            Sua conta está pronta. Selecione o plano ideal para a sua clínica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bento-card group p-10 flex flex-col hover:-translate-y-3 transition-all duration-500 ${
                plan.isPopular
                  ? 'border-primary/50 shadow-[0_0_80px_rgba(16,185,129,0.15)] ring-1 ring-primary/30'
                  : 'border-border-subtle'
              }`}
            >
              <div className="premium-glow opacity-30" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight uppercase italic">{plan.name}</h3>
                    <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.4em] mt-1">{plan.id}</p>
                  </div>
                  {plan.isPopular && (
                    <div className="px-4 py-1.5 rounded-2xl bg-primary text-black text-[10px] font-black uppercase tracking-widest animate-pulse">
                      Recomendado
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-lg font-black text-tertiary">R$</span>
                  <span className="text-6xl font-black tracking-tighter text-main">{plan.price}</span>
                  <span className="text-tertiary text-sm">/ mês</span>
                </div>

                <p className="text-secondary text-base font-medium mb-10 leading-relaxed opacity-80">{plan.desc}</p>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Zap size={10} className="text-primary fill-current" />
                      </div>
                      <span className="text-[11px] text-secondary font-black uppercase tracking-widest">{f}</span>
                    </div>
                  ))}
                </div>

                <Btn onClick={() => onPlanSelected(plan)} className="w-full py-5" icon={Sparkles}>
                  Assinar agora
                </Btn>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-tertiary hover:text-primary transition-all text-sm font-medium flex items-center gap-3 mx-auto group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
