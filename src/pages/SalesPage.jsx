import React, { useEffect, useState } from 'react';
import { 
  Zap, Bot, Layout, Shield, Target, Database, 
  MessageSquare, Calendar, ArrowRight, CheckCircle2, 
  Globe, Clock, Plus, Minus, Activity, Star, ShieldCheck
} from 'lucide-react';
import { Logo } from '../components/UI';

export default function SalesPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { 
      title: "Cérebro IA Especialista", 
      desc: "Clone sua personalidade e conhecimento técnico para um atendimento humanizado e preciso.",
      icon: Bot,
      color: "#10B981"
    },
    { 
      title: "Sincronização Neural", 
      desc: "Integração total com Google Calendar para marcação inteligente sem conflitos 24h por dia.",
      icon: Calendar,
      color: "#3B82F6"
    },
    { 
      title: "Triagem de Alta Precisão", 
      desc: "Qualifique pacientes, tire dúvidas de protocolos e convênios em milissegundos.",
      icon: Target,
      color: "#F59E0B"
    },
    { 
      title: "Multi-Agent System", 
      desc: "Arquitetura de múltiplos agentes trabalhando em paralelo: Vendas, SAC e Agendamento.",
      icon: Layout,
      color: "#8B5CF6"
    }
  ];

  const bentoItems = [
    {
      title: "Alta Conversão",
      desc: "Recupere até 30% dos leads que abandonam o funil tradicional.",
      icon: Zap,
      className: "md:col-span-2 md:row-span-1 bg-emerald-500/5 border-emerald-500/20"
    },
    {
      title: "Segurança Root",
      desc: "Proteção de dados Nível Bancário com criptografia de ponta a ponta.",
      icon: ShieldCheck,
      className: "md:col-span-1 md:row-span-1 bg-blue-500/5 border-blue-500/20"
    },
    {
      title: "Escalabilidade Infinita",
      desc: "Atenda 1.000 pacientes simultaneamente com o mesmo padrão de excelência.",
      icon: Globe,
      className: "md:col-span-1 md:row-span-2 bg-purple-500/5 border-purple-500/20"
    },
    {
      title: "Lembretes Preditivos",
      desc: "Redução drástica de 'No-Show' com lembretes inteligentes 24h antes.",
      icon: Clock,
      className: "md:col-span-2 md:row-span-1 bg-amber-500/5 border-amber-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-primary/20 selection:text-primary font-sans overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[1200px] h-[800px] bg-primary/10 blur-[160px] rounded-full opacity-40 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-blue-500/5 blur-[140px] rounded-full opacity-30" />
      </div>

      {/* Premium Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-slate-900 py-5' : 'py-10'}`}>
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
          <div className="flex items-center gap-4 group">
            <Logo size={36} className="group-hover:rotate-12 transition-transform duration-500" />
            <span className="text-2xl font-black tracking-tighter uppercase italic">Secretár<span className="text-primary">IA</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            <a href="#recursos" className="text-[10px] font-black uppercase tracking-[0.3em] text-tertiary hover:text-primary transition-all">Protocolos</a>
            <a href="#precos" className="text-[10px] font-black uppercase tracking-[0.3em] text-tertiary hover:text-primary transition-all">Planos</a>
            <a href="/" className="px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:scale-105 active:scale-95 transition-all shadow-2xl">Acessar Hub</a>
          </div>
        </div>
      </nav>

      {/* Hero: The Intelligence Reveal */}
      <header className="relative z-10 pt-64 pb-48 px-10">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 animate-fade-in shadow-2xl">
            <Activity size={16} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sistema Multi-Agente v4.0 Ativo</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white uppercase italic">
            A INTELIGÊNCIA <br/>
            QUE <span className="text-primary shadow-glow">ESCALA</span> O SEU <br/> CONSULTÓRIO.
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-400 font-medium leading-relaxed opacity-80">
            O primeiro sistema operacional de atendimento para profissionais de saúde de alto ticket. Automatize, venda e agende com precisão cirúrgica.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <a href="#precos" className="group w-full sm:w-auto px-16 py-7 rounded-[28px] bg-primary text-black font-black text-xs uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4">
              Iniciar Implantação
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </a>
            <button className="w-full sm:w-auto px-16 py-7 rounded-[28px] bg-slate-900 border border-slate-800 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all">
              Ver Manifesto
            </button>
          </div>
        </div>
      </header>

      {/* Bento Framework Section */}
      <section id="recursos" className="relative z-10 py-48 px-10 bg-slate-900/20 backdrop-blur-3xl border-y border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-32 space-y-6">
            <div className="h-1 w-20 bg-primary/40 rounded-full" />
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">Engenharia de Performance.</h2>
            <p className="text-slate-400 text-lg font-medium opacity-60">Arquitetura robusta para quem exige resultados de elite.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[320px]">
            {bentoItems.map((item, i) => (
              <div key={i} className={`p-12 rounded-[48px] border relative overflow-hidden group transition-all duration-1000 ${item.className}`}>
                <div className="premium-glow opacity-10 group-hover:opacity-30 transition-opacity" />
                <div className="relative z-10 flex flex-col justify-end h-full gap-6">
                   <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                     <item.icon size={32} className="text-white" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black tracking-tight uppercase italic mb-2">{item.title}</h3>
                     <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-70">{item.desc}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-48 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          {features.map((f, i) => (
            <div key={i} className="space-y-8 group">
              <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-primary/40 transition-all duration-500 shadow-2xl">
                <f.icon size={40} strokeWidth={1.5} style={{ color: f.color }} />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase italic">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium opacity-60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Elite Social Proof / CTA */}
      <section className="py-48 px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary z-0" />
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay z-0" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-12">
          <Star className="mx-auto text-black animate-spin-slow" size={48} />
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-black leading-[0.85] uppercase italic">
            PRONTA PARA <br/> DOMINAR O <br/> MERCADO?
          </h2>
          <p className="text-xl md:text-2xl text-black/80 font-black max-w-3xl mx-auto uppercase tracking-tight">
            Junte-se à elite da saúde. Mais de 500 consultórios de alta performance já operam sob o núcleo SecretarIA.
          </p>
          <div className="pt-12">
            <a href="#precos" className="inline-flex px-16 py-8 rounded-[32px] bg-black text-white font-black text-xl uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] active:scale-95">
              Assinar Protocolo
            </a>
          </div>
        </div>
      </section>

      {/* FAQ: High Tech Support */}
      <section className="py-48 px-10">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">Central de Inteligência</h2>
            <p className="text-tertiary font-black uppercase tracking-[0.3em] opacity-60 text-xs">Respostas Imediatas</p>
          </div>
          
          <div className="space-y-6">
            {[
              { q: "Preciso alterar meu hardware ou número?", a: "Absolutamente não. A SecretarIA opera sobre seu ecossistema atual do WhatsApp Business de forma transparente." },
              { q: "Qual a precisão do reconhecimento de voz?", a: "Utilizamos processamento neural de última geração com 99.8% de acurácia em contextos clínicos e técnicos." },
              { q: "A implantação é complexa?", a: "Nossa equipe de engenharia realiza o setup completo e a sincronização do seu 'Cérebro Digital' em menos de 48 horas." }
            ].map((item, i) => (
              <div key={i} className="p-10 rounded-[40px] bg-slate-900/30 border border-slate-800 hover:border-primary/20 transition-all duration-500 group">
                <h4 className="text-lg font-black text-main mb-4 flex items-center gap-4 uppercase italic tracking-tight">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:rotate-12 transition-transform">
                     <CheckCircle2 size={18} />
                  </div>
                  {item.q}
                </h4>
                <p className="text-base text-slate-400 font-medium pl-12 leading-relaxed opacity-70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-32 px-10 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-6">
              <Logo size={48} />
              <div className="flex flex-col">
                 <span className="text-xl font-black tracking-tighter uppercase italic">Secretár<span className="text-primary">IA</span></span>
                 <span className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1 italic">Intelligence Systems</span>
              </div>
           </div>
           
           <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic">© 2026 SecretarIA Ecosystem — A Nova Era da Gestão Clínica</p>
              <div className="flex gap-6 mt-4">
                 <a href="#" className="text-[10px] font-black text-tertiary hover:text-primary transition-colors uppercase tracking-widest">Privacidade</a>
                 <a href="#" className="text-[10px] font-black text-tertiary hover:text-primary transition-colors uppercase tracking-widest">Termos</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
