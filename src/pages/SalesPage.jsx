import React, { useEffect, useState } from 'react';

const T = {
  bg: "#000000",
  surface: "rgba(15, 15, 15, 0.6)",
  up: "rgba(30, 30, 30, 0.8)",
  border: "rgba(255, 255, 255, 0.06)",
  green: "#00E676",
  greenDim: "rgba(0, 230, 118, 0.1)",
  ink: "#FFFFFF",
  inkSec: "#888888",
  inkTert: "#5C6270",
  amber: "#FFB020"
};

export default function SalesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [spots] = useState(3);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const plans = [
    {
      id: "starter",
      name: "Plano Slim",
      price: "197",
      desc: "Ideal para nutris que atuam sozinhas e querem sair do operacional.",
      features: [
        "Clone da sua Personalidade (IA)",
        "Atendimento WhatsApp Automático",
        "Até 500 interações/mês",
        "Respostas básicas de cardápio"
      ],
      link: "https://sandbox.asaas.com/c/placeholder_starter"
    },
    {
      id: "pro",
      name: "Plano Clinic",
      price: "497",
      desc: "A verdadeira máquina de conversão para agendas prósperas.",
      isPopular: true,
      features: [
        "Tudo do Slim",
        "Agendamento automático via IA",
        "Follow-up de leads perdidos",
        "Até 2.000 interações/mês",
        "Integração Google Calendar"
      ],
      link: "https://sandbox.asaas.com/c/placeholder_pro"
    },
    {
      id: "enterprise",
      name: "Clínica Smart VIP",
      price: "997",
      desc: "Automações customizadas para redes e clínicas multiprofissionais.",
      features: [
        "Tudo do Clinic",
        "Disparo de lembretes em Massa",
        "Interações Ilimitadas",
        "Criação Fluxo n8n Avançado",
        "Gerente de Suporte Dedicado"
      ],
      link: "https://sandbox.asaas.com/c/placeholder_enterprise"
    }
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: T.bg, minHeight: "100vh", color: T.ink, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        
        body { background: ${T.bg}; color: ${T.ink}; }
        
        .premium-bg {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #000; /* Preenchimento Base */
          z-index: 0;
          overflow: hidden;
        }

        /* -------------------------------------
           ESTÉTICA BOTCONVERSA (MATRIX GRID) 
           ------------------------------------- */
        .perspective-grid {
          position: absolute;
          top: 30%;
          left: 50%;
          width: 300vw;
          height: 150vh;
          margin-left: -150vw;
          /* Grade Verde estilo Matrix */
          background-image: 
            linear-gradient(rgba(0, 230, 118, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 230, 118, 0.2) 1px, transparent 1px);
          background-size: 100px 100px;
          background-position: center bottom;
          transform: perspective(700px) rotateX(75deg);
          animation: gridMove 2.5s linear infinite;
        }

        .grid-fade {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to bottom, #000 20%, transparent 80%, #000 100%);
          pointer-events: none;
        }

        @keyframes gridMove {
          0% { transform: perspective(700px) rotateX(75deg) translateY(0); }
          100% { transform: perspective(700px) rotateX(75deg) translateY(100px); }
        }

        /* -------------------------------------
           BOLHAS FLUTUANTES WHATSAPP (BOT) 
           ------------------------------------- */
        @keyframes bubbleFloat {
          0% { top: 100%; transform: scale(0.8) rotate(-5deg); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; top: 10%; transform: scale(1) rotate(2deg); }
          100% { top: -10%; transform: scale(1) rotate(5deg); opacity: 0; }
        }

        .chat-bubble {
          position: absolute;
          background: rgba(20, 20, 20, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #E0E0E0;
          padding: 16px 24px;
          border-radius: 20px 20px 20px 4px;
          font-family: "Inter", sans-serif;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 20px 40px rgba(0, 230, 118, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1;
          pointer-events: none;
          max-width: 280px;
        }

        .chat-bubble.green {
          background: rgba(0, 230, 118, 0.15);
          border-color: rgba(0, 230, 118, 0.3);
          border-radius: 20px 20px 4px 20px;
          box-shadow: 0 0 30px rgba(0, 230, 118, 0.2);
        }

        .hero-glow { position: absolute; width: 800px; height: 800px; background: ${T.green}; filter: blur(250px); opacity: 0.15; top: -400px; left: 50%; transform: translateX(-50%); z-index: 0; pointer-events: none; border-radius: 50%; }
        
        .urgency-bar { background: ${T.amber}; color: #000; text-align: center; padding: 12px 20px; font-weight: 800; font-size: 13px; position: relative; z-index: 20; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px;}
        
        .glass-nav { background: ${scrolled ? "rgba(0, 0, 0, 0.7)" : "transparent"}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1); border-bottom: ${scrolled ? `1px solid ${T.border}` : "1px solid transparent"}; }
        
        .anim-fade-up { animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .anim-delay-1 { animation-delay: 0.15s; }
        .anim-delay-2 { animation-delay: 0.3s; }
        .anim-delay-3 { animation-delay: 0.45s; }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes pulseSonar {
          0% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(0, 230, 118, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
        }
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .card-glass {
          background: ${T.surface};
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid ${T.border};
          border-radius: 32px;
        }

        .card-hover { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .card-hover:hover { 
          transform: translateY(-16px) scale(1.02) !important; 
          box-shadow: 0 40px 80px -20px rgba(0,230,118,0.15), inset 0 1px 1px rgba(255,255,255,0.1) !important; 
          border-color: rgba(0, 230, 118, 0.5) !important; 
          background: rgba(20, 25, 20, 0.8) !important;
        }
        
        .text-gradient {
          background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 1000px 100%; animation: shimmer 3s infinite linear; pointer-events: none; }
      `}</style>

      {/* MATRIX BACKGROUND E BOLHAS BOTCONVERSA */}
      <div className="premium-bg">
        <div className="perspective-grid"></div>
        <div className="grid-fade"></div>
      </div>
      
      <div className="hero-glow"></div>
      <div className="urgency-bar">
        <span>⚠️ ATENÇÃO: Devido ao alto nível de personalização do cérebro da IA, restam apenas <span style={{background:"#000", color:T.amber, padding:"2px 8px", borderRadius:4, margin:"0 4px"}}>{spots} VAGAS</span> de implantação para a turma deste mês.</span>
      </div>

      {/* Navbar Estilo BotConversa */}
      <nav className="glass-nav" style={{ padding: "16px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "fixed", top: 44, left: 0, right: 0, zIndex: 100 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo-secretaria-ai.png?v=2" alt="SecretarIA Logo" style={{ height: 40, objectFit: "contain", animation: "float 6s ease-in-out infinite" }} />
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.8px", color: T.ink }}>Secretár<span style={{color: T.green}}>IA</span></div>
        </div>
        
        {/* Links Centrais (Visíveis em Telas Maiores) */}
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }} className="nav-links-desktop">
          <a href="#recursos" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, fontWeight: 600, transition: "color 0.3s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Recursos</a>
          <a href="#planos" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, fontWeight: 600, transition: "color 0.3s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Preços</a>
          <a href="#faq" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, fontWeight: 600, transition: "color 0.3s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Perguntas Frequentes</a>
        </div>

        {/* Fazer Login (Botão Claro como BotConversa) */}
        <a href="/" style={{ color: "#000", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "10px 24px", borderRadius: 8, transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", background: "#EAEAEA" }} onMouseEnter={e=>{e.currentTarget.style.background=T.green; e.currentTarget.style.color="#000"; e.currentTarget.style.boxShadow="0 4px 15px rgba(0,230,118,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.background="#EAEAEA"; e.currentTarget.style.color="#000"; e.currentTarget.style.boxShadow="none"}}>Fazer Login</a>
      </nav>

      <header className="anim-fade-up" style={{ padding: "220px 20px 100px", textAlign: "center", position: "relative", zIndex: 5, maxWidth: 960, margin: "0 auto", overflow: "hidden" }}>
        
        {/* Bolhas Simuladas */}
        <div className="chat-bubble" style={{ left: "0%", animation: "bubbleFloat 14s infinite linear", animationDelay: "1s" }}>
          Oi, boa tarde! Queria saber os horários para amanhã.
        </div>
        <div className="chat-bubble green" style={{ left: "5%", animation: "bubbleFloat 15s infinite linear", animationDelay: "4s", maxWidth: 320 }}>
          Olá! Sou a Secretária IA da Nutri. Tenho as 14h e 16h disponíveis, qual prefere? ⚡
        </div>
        <div className="chat-bubble" style={{ right: "2%", animation: "bubbleFloat 18s infinite linear", animationDelay: "0s" }}>
          Vocês aceitam Unimed?
        </div>
        <div className="chat-bubble green" style={{ right: "8%", animation: "bubbleFloat 12s infinite linear", animationDelay: "7s" }}>
          Atendemos sim! 😊
        </div>
        <div className="chat-bubble" style={{ left: "-5%", animation: "bubbleFloat 20s infinite linear", animationDelay: "10s", filter: "blur(2px)" }}>
          Qual o valor da consulta online?
        </div>
        <div className="chat-bubble green" style={{ right: "-5%", animation: "bubbleFloat 22s infinite linear", animationDelay: "13s", filter: "blur(1px)" }}>
          A primeira avaliação completa fica R$250. Posso reservar? 💚
        </div>
        
           <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "inline-block", background: T.greenDim, color: T.green, padding: "8px 20px", borderRadius: 100, fontSize: 12, fontWeight: 800, marginBottom: 40, border: `1px solid ${T.green}66`, letterSpacing: "2px", textTransform:"uppercase" }}>
            The Health-Tech Core #1
          </div>
          <h1 className="text-gradient" style={{ fontSize: 72, fontWeight: 900, lineHeight: 1, marginBottom: 24, letterSpacing: "-4px", fontFamily: "'Syncopate', sans-serif" }}>
            A INTELIGÊNCIA QUE DOMINA SEU CONSULTÓRIO.
          </h1>
          <p style={{ fontSize: 20, color: T.inkSec, lineHeight: 1.6, marginBottom: 48, maxWidth: 800, margin: "0 auto 48px", fontWeight: 500 }}>
            Assuma o controle absoluto. A <strong>SecretárIA</strong> é o núcleo de inteligência que escala seu atendimento, agenda pacientes e converte leads 24h por dia, com a precisão de uma máquina e a empatia de uma especialista.
          </p>
          <div style={{display:"flex", gap: 20, justifyContent: "center", alignItems: "center", marginBottom: 60}}>
            <a href="#planos" className="shimmer-btn" style={{ background: T.green, color: "#000", padding: "22px 54px", borderRadius: 100, fontSize: 18, fontWeight: 800, textDecoration: "none", transition: "all 300ms", display: "inline-flex", alignItems: "center", gap: 12, boxShadow: `0 10px 40px ${T.greenDim}` }}>
              REVOLUCIONAR MEU CONSULTÓRIO
            </a>
          </div>
        </div>

        {/* IMAGEM DA MASCOTE CYBORG */}
        <div className="anim-fade-up anim-delay-3" style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ background: T.surface, borderRadius: 32, padding: 12, border: `1px solid ${T.border}`, boxShadow: `0 40px 100px -20px rgba(0,0,0,0.2), 0 20px 40px -20px ${T.greenDim}` }}>
            <img 
              src="file:///C:/Users/Nutri/.gemini/antigravity/brain/f6ec4d5a-ee10-40c0-8b7c-2429654c9d36/secretaria_ai_mascot_concept_1776957095223.png" 
              alt="Mascote SecretárIA" 
              style={{ width: "100%", height: "auto", borderRadius: 24, display: "block" }} 
            />
          </div>
        </div>
      </header>

      {/* Marquee Infinite (Integrações e High-Tech) */}
      <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: "rgba(255,255,255,0.01)", padding: "24px 0", position: "relative", zIndex: 5 }}>
        <div style={{ display: "inline-block", animation: "scrollMarquee 20s linear infinite" }}>
          <div style={{ display: "inline-flex", gap: 60, alignItems: "center", paddingRight: 60, fontWeight: 800, fontSize: 14, color: T.inkSec, textTransform: "uppercase", letterSpacing: "1px" }}>
            <span style={{color: T.green}}>⚡ Conexão Oficial WhatsApp Cloud</span>
            <span>Integração Asaas</span>
            <span>Inteligência GPT-4o</span>
            <span>Automação n8n</span>
            <span>CRM Pacientes</span>
            <span style={{color: T.green}}>⚡ Conexão Oficial WhatsApp Cloud</span>
            <span>Integração Asaas</span>
            <span>Inteligência GPT-4o</span>
            <span>Automação n8n</span>
            <span>CRM Pacientes</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE RECURSOS (FEATURES) - Completando a Leadpage */}
      <section id="recursos" style={{ padding: "120px 20px", position: "relative", zIndex: 10, background: T.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }} className="anim-fade-up">
            <h2 className="text-gradient" style={{ fontSize: 40, fontWeight: 900, marginBottom: 20, letterSpacing: "-1.5px" }}>
              Tudo o que sua clínica precisa <span style={{color: T.green}}>no automático</span>.
            </h2>
            <p style={{ fontSize: 18, color: T.inkSec, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              A SecretarIA faz todo o processo de captação até deixar o paciente sentado na sua frente ou com o PIX na sua conta.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32 }}>
            {[
              { icon: "📅", title: "Agendamento Automático", desc: "A IA tem acesso total à sua agenda. Ela confere as brechas, oferece ao paciente e já marca os horários na hora." },
              { icon: "🛡️", title: "Filtro Anti-Curioso", desc: "Responde dúvidas de preço, plano de saúde e envia PDFs antes mesmo de notificar você, poupando sua energia." },
              { icon: "📊", title: "Mini-CRM Embutido", desc: "Use o Painel WAAI Manager para ter controle imediato das conversas e do status de fechamento de cada lead." },
              { icon: "♻️", title: "Follow-up Ativo", desc: "Muitos dizem 'vou ver e te falo'. A IA é programada para chamar o contato dias depois, recuperando até 30% das avaliações." },
              { icon: "🎙️", title: "Clonagem de Personalidade", desc: "Treinamos a IA para falar as suas gírias e responder com o seu nível técnico, garantindo uma recepção super humana." },
              { icon: "🔔", title: "Lembrete Dia da Consulta", desc: "Um dia antes, ela manda as orientações para o exame de Bioimpedância e confere se a pessoa vem, diminuindo faltas." },
            ].map((feature, i) => (
              <div key={i} className="card-hover card-glass anim-fade-up" style={{ padding: 32, display: "flex", flexDirection: "column", animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 40, marginBottom: 20, background: T.up, width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, border: `1px solid ${T.border}` }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 12px", color: T.ink }}>{feature.title}</h3>
                <p style={{ color: T.inkSec, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: "relative", zIndex: 5, background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "100px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 80, alignItems: "center", justifyContent: "center" }}>
          <div style={{ flex: "1 1 400px" }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 24px", lineHeight: 1.2, letterSpacing: "-1px", color: "#FFF" }}>
              Por que nutris que usam a SecretarIA <span style={{color: T.green}}>faturam 40% a mais?</span>
            </h2>
            <p style={{ color: "#CCC", fontSize: 16, lineHeight: 1.6, margin: "0 0 20px" }}>
              O primeiro princípio da venda na nutrição é o <strong style={{color: "#FFF"}}>acolhimento rápido</strong>. Se um lead pede o valor da consulta e você demora 3 horas para responder (porque estava clinicando), a neurociência diz que a dopamina daquele possível paciente já evaporou. Ele já procurou outra.
            </p>
            <p style={{ color: "#CCC", fontSize: 16, lineHeight: 1.6 }}>
              A <strong style={{color: "#FFF"}}>SecretarIA</strong> domina o pico de atenção do seu lead. Ela responde em 5 segundos, manda sua tabela de preços, tira dúvidas da sua metodologia e ainda coloca a consulta direto no seu Google Calendar.
            </p>
          </div>
          <div style={{ flex: "1 1 400px", background: T.up, padding: 40, borderRadius: 24, border: `1px solid ${T.border}`, position: "relative" }}>
            <div style={{ position: "absolute", top: -15, left: -15, background: T.green, color: "#000", width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>✓</div>
            <div style={{ fontSize: 14, color: T.inkTert, marginBottom: 12 }}>SIMULAÇÃO DE CONVERSA REAL</div>
            <div style={{ background: T.bg, padding: 16, borderRadius: "16px 16px 16px 0", marginBottom: 16, maxWidth: "85%", border: `1px solid ${T.border}`, color: "#FFF"}}>
              "Oi, qual o valor da consulta da Dra. Juliana?"
            </div>
            <div style={{ background: T.greenDim, padding: 16, borderRadius: "16px 16px 0 16px", marginLeft: "auto", maxWidth: "85%", border: `1px solid rgba(37,211,102,0.2)`, color: "#FFF"}}>
              "Oii! Tudo bem? Aqui é a assistente virtual da Dra. Juliana 💚 A consulta completa, que inclui o rastreamento metabólico e bioimpedância, é R$ 350. Quer que eu veja os horários para essa semana?"
            </div>
          </div>
        </div>
      </section>

      <section id="planos" style={{ padding: "100px 20px 160px", position: "relative", zIndex: 5, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }} className="anim-fade-up">
          <h2 className="text-gradient" style={{ fontSize: 48, fontWeight: 900, marginBottom: 20, letterSpacing: "-1.5px" }}>
            Escolha sua nova Secretária.
          </h2>
          <p style={{ fontSize: 18, color: T.inkSec, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Selecione o plano ideal para a quantidade de pacientes que entram em contato por mês.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40 }}>
          {plans.map((plan, index) => (
            <div key={plan.id} className={`card-hover card-glass anim-fade-up anim-delay-${index + 1}`} style={{ 
              border: `1px solid ${plan.isPopular ? T.green : T.border}`, 
              padding: 48,
              position: "relative",
              transform: plan.isPopular ? "scale(1.03) translateY(-10px)" : "none",
              boxShadow: plan.isPopular ? `0 30px 60px -15px rgba(0,230,118,0.15)` : "0 10px 30px -10px rgba(0,0,0,0.5)",
              display: "flex", flexDirection: "column"
            }}>
              {plan.isPopular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: T.green, color: "#000", padding: "6px 20px", borderRadius: 30, fontSize: 12, fontWeight: 800, letterSpacing: "1px" }}>ESCOLHA MAIS INTELIGENTE</div>
              )}
              <h3 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px", letterSpacing:"-0.5px" }}>{plan.name}</h3>
              <p style={{ color: T.inkSec, fontSize: 15, margin: "0 0 32px", minHeight: 48 }}>{plan.desc}</p>
              
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 40 }}>
                <span style={{ fontSize: 24, color: T.inkTert, fontWeight: 700 }}>R$</span>
                <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-2px" }}>{plan.price}</span>
                <span style={{ color: T.inkTert }}>/mês</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ color: T.green, fontSize: 18, lineHeight: 1.2 }}>✓</span>
                    <span style={{ fontSize: 15, color: T.inkSec, fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href={plan.link} className={plan.isPopular ? "shimmer-btn" : ""} target="_blank" rel="noreferrer" style={{ 
                display: "block", 
                width: "100%", 
                padding: "20px", 
                background: plan.isPopular ? T.green : "rgba(255,255,255,0.03)", 
                color: plan.isPopular ? "#000" : T.ink, 
                border: plan.isPopular ? "none" : `1px solid ${T.border}`,
                textAlign: "center", 
                borderRadius: 100, 
                fontSize: 15,
                fontWeight: 800, 
                textDecoration: "none",
                transition: "all 300ms",
                boxShadow: plan.isPopular ? "0 10px 20px -5px rgba(0,230,118,0.4)" : "none"
              }} onMouseEnter={e=>{e.currentTarget.style.filter="brightness(1.2)"; e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.filter="brightness(1)"; e.currentTarget.style.transform="none"}}>
                CRIAR MINHA IA AGORA
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO O QUEBRADOR DE OBJEÇÕES: DEPOIMENTOS (OCULTADA TEMPORARIAMENTE) */}
      {/* 
      <section id="depoimentos" style={{ position: "relative", zIndex: 5, background: T.up, padding: "100px 20px", borderTop: `1px solid ${T.border}`}}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 60px", letterSpacing: "-1px", color: "#FFF" }}>
            As nutris estão abandonando a <span style={{color: T.green}}>secretária humana</span>.
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32 }}>
            <div className="card-hover card-glass" style={{ padding: 32, textAlign: "left", flex: "1 1 300px" }}>
              <div style={{ display: "flex", gap: 4, color: T.amber, marginBottom: 16 }}>★★★★★</div>
              <p style={{ color: "#FFF", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>"Chegava do consultório às 21h e ainda tinha que responder WhatsApp. Hoje a SecretarIA faz os filtros, me manda quem agendou e eu só atendo no dia seguinte. Surreal."</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#444" }}></div>
                <div>
                  <div style={{ fontWeight: 700, color: "#FFF" }}>Dra. Mariana Costa</div>
                  <div style={{ fontSize: 13, color: T.inkTert }}>Nutricionista Clínica</div>
                </div>
              </div>
            </div>
            <div className="card-hover card-glass" style={{ padding: 32, textAlign: "left", flex: "1 1 300px" }}>
              <div style={{ display: "flex", gap: 4, color: T.amber, marginBottom: 16 }}>★★★★★</div>
              <p style={{ color: "#FFF", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>"Aumentei meu faturamento em 40% só por responder na hora. A IA já fecha o pix da avaliação sozinha. Eu acordo com notificação de pagamento."</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#444" }}></div>
                <div>
                  <div style={{ fontWeight: 700, color: "#FFF" }}>Juliana Moreira</div>
                  <div style={{ fontSize: 13, color: T.inkTert }}>Nutricionista Esportiva</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> 
      */}

      {/* FAQ */}
      <section id="faq" style={{ position: "relative", zIndex: 5, padding: "100px 20px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px", color: T.ink }}>Perguntas Frequentes</h2>
          <p style={{ color: T.inkSec, fontSize: 18 }}>Tudo o que você precisa saber antes de assinar.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { q: "Preciso de um novo número de WhatsApp?", a: "Não. O sistema conecta diretamente no WhatsApp Business que você já usa, ou podemos te ajudar a configurar um novo exclusivo." },
            { q: "A IA tem uma voz robótica?", a: "Pelo contrário. A sua SecretarIA é treinada com diretrizes do seu consultório. Ela vai falar com o paciente no seu tom, com seus emojis e suas gírias." },
            { q: "Eu tenho que saber programar?", a: "Zero. O sistema de automação no n8n é implantado por nós, você só recebe uma interface super fácil (o Painel WAAI Manager) para gerenciar tudo." }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              style={{ background: T.surface, border: `1px solid ${openFaq === idx ? T.green : T.border}`, borderRadius: 16, padding: "24px 32px", cursor: "pointer", transition: "all 0.3s" }}
              onMouseEnter={e => { if (openFaq !== idx) e.currentTarget.style.borderColor = "rgba(0, 230, 118, 0.5)" }}
              onMouseLeave={e => { if (openFaq !== idx) e.currentTarget.style.borderColor = T.border }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: openFaq === idx ? T.green : T.ink, transition: "color 0.3s" }}>{item.q}</h4>
                <div style={{ 
                  color: openFaq === idx ? T.bg : T.ink, 
                  background: openFaq === idx ? T.green : "transparent",
                  border: `1px solid ${openFaq === idx ? T.green : T.border}`,
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, transform: openFaq === idx ? "rotate(45deg)" : "none", transition: "all 0.3s" 
                }}>+</div>
              </div>
              <div style={{ 
                maxHeight: openFaq === idx ? "200px" : "0", 
                overflow: "hidden", 
                transition: "all 0.3s ease-in-out", 
                opacity: openFaq === idx ? 1 : 0, 
                marginTop: openFaq === idx ? 16 : 0 
              }}>
                <p style={{ margin: 0, color: T.inkSec, lineHeight: 1.6 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER ESTILO BOTCONVERSA */}
      <footer style={{ position: "relative", zIndex: 5, background: T.up, borderTop: `1px solid ${T.border}`, padding: "80px 40px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 60 }}>
          {/* Logo e Texto */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <img src="/logo-secretaria-ai.png?v=2" alt="SecretarIA Logo" style={{ height: 32, objectFit: "contain" }} />
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.8px", color: T.ink }}>Secretár<span style={{color: T.green}}>IA</span></div>
            </div>
            <p style={{ color: T.inkSec, fontSize: 15, lineHeight: 1.6, maxWidth: 300, marginBottom: 32 }}>
              A maior plataforma de secretárias inteligentes com automação de neurovendas do Brasil.
            </p>
            {/* Social Icons Placeholder */}
            <div style={{ display: "flex", gap: 16 }}>
              {["F", "I", "Y", "L"].map(icon => (
                <div key={icon} style={{ width: 40, height: 40, borderRadius: "50%", background: T.surface, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s", color: T.inkSec, fontWeight: 700, fontSize: 14 }} onMouseEnter={e=>{e.currentTarget.style.background=T.green; e.currentTarget.style.color="#000"}} onMouseLeave={e=>{e.currentTarget.style.background=T.surface; e.currentTarget.style.color=T.inkSec}}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
          
          {/* Produtos/Atalhos */}
          <div>
            <h4 style={{ color: T.ink, fontSize: 15, fontWeight: 700, marginBottom: 24, textTransform: "uppercase", letterSpacing: "1px" }}>Produto</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <a href="#recursos" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Recursos</a>
              <a href="#planos" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Preços</a>
              <a href="#faq" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Perguntas Frequentes</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ color: T.ink, fontSize: 15, fontWeight: 700, marginBottom: 24, textTransform: "uppercase", letterSpacing: "1px" }}>Legal</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <a href="#privacidade" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Política de Privacidade</a>
              <a href="#termos" style={{ color: T.inkSec, textDecoration: "none", fontSize: 15, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=T.green} onMouseLeave={e=>e.currentTarget.style.color=T.inkSec}>Termos de Serviço</a>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 60, paddingTop: 32, textAlign: "center", color: T.inkTert, fontSize: 14 }}>
          © 2026 SecretárIA. Todos os direitos reservados. CNPJ: 00.000.000/0000-00.
        </div>
      </footer>
    </div>
  );
}
