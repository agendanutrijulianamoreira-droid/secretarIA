import React, { useEffect, useState } from 'react';
import { 
  Zap, Bot, Layout, Shield, Target, Database, 
  MessageSquare, Calendar, ArrowRight, CheckCircle2, 
  Globe, Clock, Plus, Minus 
} from 'lucide-react';
import { Logo } from '../components/UI';

export default function SalesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { 
      title: "Cérebro IA Especialista", 
      desc: "Clone sua personalidade e conhecimento técnico para um atendimento humanizado.",
      icon: Bot,
      color: "emerald"
    },
    { 
      title: "Agendamento Inteligente", 
      desc: "Integração total com Google Calendar para marcação sem conflitos 24h por dia.",
      icon: Calendar,
      color: "blue"
    },
    { 
      title: "Filtro de Leads", 
      desc: "Qualifique pacientes, tire dúvidas de preços e convênios no automático.",
      icon: Target,
      color: "amber"
    },
    { 
      title: "Multi-Agent System", 
      desc: "Vários agentes trabalhando juntos: Triagem, FAQ e Agendamento.",
      icon: Layout,
      color: "purple"
    }
  ];

  const bentoItems = [
    {
      title: "Alta Conversão",
      desc: "Recupere até 30% dos leads que 'vão ver e te falar'.",
      icon: Zap,
      className: "md:col-span-2 md:row-span-1 bg-emerald-500/5 border-emerald-500/20"
    },
    {
      title: "Segurança Total",
      desc: "Seus dados e de seus pacientes protegidos com Zero Trust.",
      icon: Shield,
      className: "md:col-span-1 md:row-span-1 bg-blue-500/5 border-blue-500/20"
    },
    {
      title: "Escalabilidade",
      desc: "Atenda 10 ou 1000 pacientes simultaneamente sem perder qualidade.",
      icon: Globe,
      className: "md:col-span-1 md:row-span-2 bg-purple-500/5 border-purple-500/20"
    },
    {
      title: "Lembretes Ativos",
      desc: "Redução drástica de faltas com lembretes inteligentes 24h antes.",
      icon: Clock,
      className: "md:col-span-2 md:row-span-1 bg-amber-500/5 border-amber-500/20"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Glow Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-800 py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="text-xl font-black tracking-tighter">Secretár<span className="text-emerald-500">IA</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Recursos</a>
            <a href="#precos" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Preços</a>
            <a href="/" className="text-sm font-bold px-6 py-2.5 rounded-full bg-white text-black hover:bg-emerald-500 transition-all duration-300">Entrar no Dashboard</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
            <Zap size={14} className="text-emerald-500 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">A Revolução do Atendimento em Nutrição</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
            A INTELIGÊNCIA QUE <br/>
            <span className="text-emerald-500">DOMINA</span> SEU CONSULTÓRIO.
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
            A SecretarIA é o núcleo de inteligência que escala seu atendimento, agenda pacientes e converte leads 24h por dia.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#precos" className="group w-full sm:w-auto px-10 py-5 rounded-full bg-emerald-500 text-black font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
              Começar Agora
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-slate-800 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700">
              Ver Demonstração
            </button>
          </div>
        </div>
      </header>

      {/* Bento Grid Features */}
      <section id="recursos" className="relative z-10 py-32 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">O Cérebro do seu Negócio.</h2>
            <p className="text-slate-400 font-medium">Recursos avançados para quem não aceita menos que a excelência.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[240px]">
            {bentoItems.map((item, i) => (
              <div key={i} className={`p-10 rounded-[32px] border flex flex-col justify-end gap-4 group hover:scale-[1.02] transition-all duration-500 ${item.className}`}>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vertical Features */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((f, i) => (
            <div key={i} className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <f.icon size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black tracking-tight">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Call to Action */}
      <section className="py-32 px-6 text-center bg-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black leading-[0.9]">
            PRONTA PARA ESCALAR <br/> SEU FATURAMENTO?
          </h2>
          <p className="text-xl text-black/80 font-bold max-w-2xl mx-auto">
            Junte-se a centenas de nutricionistas que já automatizaram seu consultório com a tecnologia nº 1 do Brasil.
          </p>
          <div className="pt-8">
            <a href="#precos" className="inline-flex px-12 py-6 rounded-full bg-black text-white font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
              Assinar Agora
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Simple */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tighter">Dúvidas Frequentes</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Preciso de um novo número?", a: "Não, você pode usar seu número atual do WhatsApp Business." },
              { q: "A IA entende áudio?", a: "Sim, ela transcreve e entende perfeitamente áudios enviados pelos pacientes." },
              { q: "É difícil de configurar?", a: "Não, nós cuidamos de toda a implantação inicial para você." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {item.q}
                </h4>
                <p className="text-sm text-slate-400 font-medium pl-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-900 text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size={48} />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">© 2026 SecretarIA Systems — Inteligência que Escala</p>
        </div>
      </footer>
    </div>
  );
}
