import React, { useEffect, useState } from 'react';
import {
  Zap, Bot, Layout, Shield, Target, Database,
  MessageSquare, Calendar, ArrowRight, CheckCircle2,
  Globe, Clock, Plus, Minus, Brain, Lock, Sparkles,
  TrendingUp, Users, Star, ChevronRight, Activity,
  BarChart3, Cpu, Layers
} from 'lucide-react';
import { Logo } from '../components/UI';

/* ── Static data ─────────────────────────────────────────────────────────── */
const STATS = [
  { value: "60%",  label: "Redução de faltas" },
  { value: "24h",  label: "Atendimento ativo" },
  { value: "3×",   label: "Mais conversões" },
  { value: "< 5s", label: "Tempo de resposta" },
];

const BENTO = [
  {
    col: "md:col-span-2", row: "md:row-span-1",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/8",
    border: "border-emerald-500/15 hover:border-emerald-500/40",
    icon: Brain,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    tag: "Core Feature",
    tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    title: "IA que aprende com você",
    desc: "Clone sua persona, protocolos e FAQ. A IA responde como se fosse você — com sua linguagem, sua empatia e seu conhecimento clínico.",
    glow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]",
  },
  {
    col: "md:col-span-1", row: "md:row-span-2",
    bg: "bg-blue-500/5 hover:bg-blue-500/8",
    border: "border-blue-500/15 hover:border-blue-500/40",
    icon: Shield,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    tag: "Zero Trust",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    title: "Segurança Hospitalar",
    desc: "Dados dos seus pacientes protegidos com isolamento estrito por clínica, criptografia e auditoria em tempo real.",
    glow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]",
  },
  {
    col: "md:col-span-1", row: "md:row-span-1",
    bg: "bg-amber-500/5 hover:bg-amber-500/8",
    border: "border-amber-500/15 hover:border-amber-500/40",
    icon: Calendar,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    tag: "Google Calendar",
    tagColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    title: "Agenda Inteligente",
    desc: "Agendamentos 24h, sem conflitos, sincronizados com seu Google Calendar.",
    glow: "hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]",
  },
  {
    col: "md:col-span-1", row: "md:row-span-1",
    bg: "bg-purple-500/5 hover:bg-purple-500/8",
    border: "border-purple-500/15 hover:border-purple-500/40",
    icon: Target,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    tag: "CRM Integrado",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    title: "Filtro de Leads",
    desc: "Qualificação automática. Só chegam até você os leads prontos para converter.",
    glow: "hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]",
  },
  {
    col: "md:col-span-1", row: "md:row-span-1",
    bg: "bg-rose-500/5 hover:bg-rose-500/8",
    border: "border-rose-500/15 hover:border-rose-500/40",
    icon: Clock,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    tag: "Lembretes Ativos",
    tagColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    title: "Zero Faltas",
    desc: "Lembretes automáticos 24h e 2h antes. Redução de 60% nas faltas.",
    glow: "hover:shadow-[0_0_40px_rgba(244,63,94,0.12)]",
  },
];

const FAQS = [
  { q: "Preciso de um número novo de WhatsApp?", a: "Não. Conectamos ao seu número atual do WhatsApp Business sem alterações." },
  { q: "A IA entende áudios?", a: "Sim. Ela transcreve, interpreta e responde a áudios com a mesma qualidade que mensagens de texto." },
  { q: "É difícil de configurar?", a: "Zero complicação. Nossa equipe cuida de toda a implantação inicial em até 48 horas." },
  { q: "Posso personalizar as respostas da IA?", a: "Totalmente. Você define o tom de voz, protocolos, FAQ e regras de escalação para humano." },
];

export default function SalesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-300 overflow-x-hidden">

      {/* ── Ambient glow layer ───────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-emerald-500/8 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] right-[-200px] w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-100px] w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0F172A]/85 backdrop-blur-xl border-b border-slate-800/80 py-3' : 'py-7'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={30} />
            <span className="text-lg font-black tracking-tighter">
              Secretár<span className="text-emerald-500">IA</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors duration-200">Recursos</a>
            <a href="#precos" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors duration-200">Preços</a>
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-black px-6 py-2.5 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              Entrar no Dashboard
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header className="relative z-10 pt-44 pb-28 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
            <Zap size={13} className="text-emerald-400 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
              A Revolução do Atendimento em Nutrição
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.88] text-white animate-fade-in-1">
            A INTELIGÊNCIA QUE<br />
            <span className="text-emerald-500">DOMINA</span> SEU<br />
            CONSULTÓRIO.
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium leading-relaxed animate-fade-in-2">
            SecretarIA é o núcleo de IA que agenda pacientes, qualifica leads e
            atende com a sua voz — <strong className="text-slate-200 font-bold">24 horas por dia, 7 dias por semana.</strong>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-3">
            <a
              href="#precos"
              className="btn-premium group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-emerald-500 text-black font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/25"
            >
              Começar Agora — Grátis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white/5 text-white font-black text-sm uppercase tracking-[0.15em] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <Activity size={16} className="text-slate-400" />
              Ver Demo ao Vivo
            </button>
          </div>

          {/* Trust signal */}
          <div className="flex items-center justify-center gap-2 pt-2 animate-fade-in-4">
            <Lock size={12} className="text-slate-500" />
            <span className="text-[11px] text-slate-500 font-medium">Dados protegidos por Zero Trust Security · SSL · LGPD</span>
          </div>
        </div>
      </header>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div className="relative z-10 py-12 border-y border-slate-800/60 bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <div className="text-4xl font-black text-emerald-400 tracking-tighter">{s.value}</div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bento Grid ──────────────────────────────────────────────────── */}
      <section id="recursos" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
              <Layers size={12} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tecnologia de Ponta</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
              O Cérebro do<br />
              <span className="text-emerald-500">seu Negócio.</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-xl mx-auto">
              Recursos avançados que trabalham em conjunto para automatizar e escalar seu consultório.
            </p>
          </div>

          {/* Bento cells */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[260px]">
            {BENTO.map((item, i) => (
              <div
                key={i}
                className={`
                  ${item.col} ${item.row} ${item.bg} ${item.border} ${item.glow}
                  p-8 rounded-[28px] border flex flex-col justify-between
                  group transition-all duration-500 cursor-default
                `}
              >
                {/* Top: tag + icon */}
                <div className="flex items-start justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border ${item.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon size={22} className={item.iconColor} />
                  </div>
                </div>

                {/* Bottom: title + desc */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-50 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 bg-slate-950/50 border-y border-slate-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
              Funcionando em <span className="text-emerald-500">48 horas.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Cpu,         title: "Configure a IA",   desc: "Preencha o briefing da sua clínica: serviços, FAQ, horários e persona da IA." },
              { step: "02", icon: MessageSquare, title: "Conecte o WhatsApp", desc: "Integração com seu número atual em minutos, sem trocar chip." },
              { step: "03", icon: TrendingUp,   title: "Cresça no piloto",  desc: "Leads qualificados, agenda cheia e pacientes sendo convertidos — automaticamente." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/20 transition-all duration-300 group">
                <div className="text-[80px] font-black text-slate-800 leading-none absolute top-4 right-6 select-none group-hover:text-emerald-500/10 transition-colors duration-300">{step}</div>
                <div className="relative z-10 space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Icon size={22} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-50 tracking-tight">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section id="precos" className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/15 border border-black/10 mb-2">
            <Star size={11} className="text-black/70 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black/70">Centenas de Nutricionistas Confiam</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black leading-[0.9]">
            PRONTA PARA ESCALAR<br />
            SEU FATURAMENTO?
          </h2>

          <p className="text-xl text-black/75 font-semibold max-w-xl mx-auto leading-relaxed">
            Comece hoje. Nenhum cartão de crédito necessário.
            Sua IA ativa em até 48 horas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="/"
              className="group inline-flex items-center gap-2 px-12 py-5 rounded-full bg-black text-white font-black text-sm uppercase tracking-[0.15em] hover:bg-slate-900 transition-all duration-300 shadow-2xl hover:-translate-y-1 hover:shadow-black/30"
            >
              Assinar Agora
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white/20 border border-white/30 text-black font-black text-sm uppercase tracking-[0.15em] hover:bg-white/30 transition-all duration-300"
            >
              Falar com Especialista
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Dúvidas Frequentes</h2>
            <p className="text-slate-400 font-medium">Respostas rápidas para as perguntas mais comuns.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  openFaq === i
                    ? 'bg-slate-900 border-emerald-500/30'
                    : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">{item.q}</span>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-300 ${
                    openFaq === i ? 'bg-emerald-500/20 text-emerald-400 rotate-45' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Plus size={14} />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed font-medium animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-16 px-6 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <div className="text-sm font-black tracking-tighter">
                Secretár<span className="text-emerald-500">IA</span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Intelligence That Scales</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium">
            <Lock size={10} />
            <span>© 2026 SecretarIA Systems · Zero Trust · LGPD Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
