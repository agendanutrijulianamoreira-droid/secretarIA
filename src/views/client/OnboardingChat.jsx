import { useState, useRef, useEffect } from "react";
import { Clientes } from "../../lib/db";
import { Logo } from "../../components/UI";
import { Send, Sparkles, CheckCircle } from "lucide-react";

// ── Fluxo de perguntas do Onboarding ────────────────────────────────────────
const STEPS = [
  {
    id: "welcome",
    bot: (name) => `Olá, ${name.split(" ")[0]}! 🎉 Sou a IA da SecretárIA. Vou te ajudar a configurar seu atendimento inteligente em poucos minutos. Vamos lá?`,
    field: null, // Sem campo, só boas-vindas
    options: ["Vamos lá! 🚀"],
  },
  {
    id: "segment",
    bot: () => "Primeiro, qual é o segmento do seu negócio?",
    field: "segment",
    options: ["Nutrição", "Dermatologia", "Psicologia", "Odontologia", "Fisioterapia", "Estética", "Outro"],
  },
  {
    id: "description",
    bot: () => "Me conte um pouco sobre seu consultório/clínica. O que te diferencia dos outros?",
    field: "description",
    placeholder: "Ex: Clínica especializada em emagrecimento feminino com foco em saúde integrativa...",
  },
  {
    id: "ai_name",
    bot: () => "Que nome você quer que a sua IA tenha? Ela será a secretária virtual que atende seus pacientes no WhatsApp.",
    field: "ai_name",
    placeholder: "Ex: Ana, Sofia, Clara...",
  },
  {
    id: "ai_tone",
    bot: (_, answers) => `Perfeito! A ${answers.ai_name || "IA"} vai ter qual tom de comunicação?`,
    field: "ai_tone",
    options: ["Acolhedora e profissional", "Formal e sério", "Descontraído e amigável", "Jovial e animado", "Técnico e objetivo"],
  },
  {
    id: "ai_goal",
    bot: () => "Qual o principal objetivo da IA no atendimento?",
    field: "ai_goal",
    options: ["Agendamentos", "Vendas / Captação", "Suporte ao paciente", "Tirar dúvidas (FAQ)", "Tudo acima"],
  },
  {
    id: "business_hours",
    bot: () => "Qual o horário de funcionamento? A IA vai informar isso aos pacientes quando perguntarem.",
    field: "business_hours",
    placeholder: "Ex: Seg a Sex, 8h às 18h. Sáb, 8h às 12h.",
  },
  {
    id: "services",
    bot: () => "Liste seus principais serviços e preços (um por linha). Isso ajuda a IA a responder sobre valores.",
    field: "services_text",
    placeholder: "Ex:\nConsulta Avaliação - R$ 250\nRetorno - R$ 150\nPlano Alimentar - R$ 350",
    rows: 4,
  },
  {
    id: "done",
    bot: (_, answers) => `Tudo configurado! 🎉 A ${answers.ai_name || "IA"} está pronta para começar a atender seus pacientes no WhatsApp. Agora vou te levar para o seu painel de controle.`,
    field: null,
    options: ["Entrar no Painel →"],
    isFinal: true,
  },
];

// ── Componente de Mensagem ──────────────────────────────────────────────────
function ChatBubble({ from, text, animate }) {
  const isBot = from === "bot";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        marginBottom: 12,
        animation: animate ? "fadeIn 300ms ease" : "none",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "14px 18px",
          borderRadius: isBot ? "4px 18px 18px 18px" : "18px 18px 4px 18px",
          background: isBot ? "var(--color-surface)" : "var(--color-cta)",
          color: isBot ? "var(--color-text)" : "#fff",
          fontSize: 14,
          lineHeight: 1.6,
          border: isBot ? "1px solid var(--color-border)" : "none",
          whiteSpace: "pre-line",
        }}
      >
        {isBot && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, opacity: 0.6 }}>
            <Sparkles size={12} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>SecretárIA</span>
          </div>
        )}
        {text}
      </div>
    </div>
  );
}

// ── Componente Principal ────────────────────────────────────────────────────
export default function OnboardingChat({ client, onComplete }) {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Mostrar primeira mensagem do bot
  useEffect(() => {
    const step = STEPS[0];
    const botText = step.bot(client.name, answers);
    setTimeout(() => {
      setMessages([{ from: "bot", text: botText }]);
    }, 500);
  }, []);

  const advanceToStep = (nextIdx) => {
    if (nextIdx >= STEPS.length) return;
    const step = STEPS[nextIdx];
    setTyping(true);
    setTimeout(() => {
      const botText = step.bot(client.name, answers);
      setMessages((prev) => [...prev, { from: "bot", text: botText }]);
      setCurrentStep(nextIdx);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleSend = async (text) => {
    if (!text?.trim()) return;
    const step = STEPS[currentStep];

    // Adicionar mensagem do usuário
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");

    // Salvar resposta
    const newAnswers = { ...answers };
    if (step.field) {
      newAnswers[step.field] = text;
      setAnswers(newAnswers);
    }

    // Se é o passo final → salvar e redirecionar
    if (step.isFinal) {
      setSaving(true);
      try {
        // Montar briefing
        const briefing = {
          segment: newAnswers.segment || "",
          description: newAnswers.description || "",
          ai_name: newAnswers.ai_name || "",
          ai_tone: newAnswers.ai_tone || "",
          ai_goal: newAnswers.ai_goal || "",
          business_hours: newAnswers.business_hours || "",
          services_text: newAnswers.services_text || "",
        };

        // Salvar briefing e mudar status para active
        await Clientes.update(client.id, {
          briefing,
          status: "active",
        });

        setTimeout(() => onComplete(), 1500);
      } catch (err) {
        console.error("Erro ao salvar onboarding:", err);
        setSaving(false);
      }
      return;
    }

    // Avançar para próxima pergunta
    advanceToStep(currentStep + 1);
  };

  const step = STEPS[currentStep];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
      fontFamily: "inherit",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes typing { 0%, 60% { opacity: 0.3; } 30% { opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Logo size={22} />
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--color-surface-soft)",
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-cta)",
        }}>
          <Sparkles size={14} />
          Configuração Inicial
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ padding: "0 24px", background: "var(--color-surface)" }}>
        <div style={{
          height: 4,
          background: "var(--color-surface-soft)",
          borderRadius: 2,
          overflow: "hidden",
          margin: "12px 0",
        }}>
          <div style={{
            height: "100%",
            width: `${Math.min(100, (currentStep / (STEPS.length - 1)) * 100)}%`,
            background: "var(--color-cta)",
            borderRadius: 2,
            transition: "width 600ms ease",
          }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-sec)", paddingBottom: 12, textAlign: "center" }}>
          Passo {Math.min(currentStep + 1, STEPS.length - 1)} de {STEPS.length - 2}
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} from={msg.from} text={msg.text} animate={i === messages.length - 1} />
        ))}

        {/* Indicador de digitação */}
        {typing && (
          <div style={{ display: "flex", gap: 4, padding: "12px 0" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--color-text-sec)",
                  animation: `typing 1s infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Saving indicator */}
        {saving && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "16px 20px", background: "var(--color-surface)",
            borderRadius: 16, border: "1px solid var(--color-border)",
            animation: "fadeIn 300ms ease",
          }}>
            <CheckCircle size={20} color="var(--color-cta)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Salvando configuração...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: "16px 20px",
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}>
        {/* Opções rápidas (se existirem) */}
        {step?.options && !typing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {step.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSend(opt)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 20,
                  border: "1px solid var(--color-cta)",
                  background: "transparent",
                  color: "var(--color-cta)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 150ms",
                }}
                onMouseEnter={(e) => { e.target.style.background = "var(--color-cta)"; e.target.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "var(--color-cta)"; }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Campo de texto livre (se não houver opções) */}
        {!step?.options && !typing && !saving && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            {step?.rows ? (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={step?.placeholder || "Digite aqui..."}
                rows={step.rows}
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 14,
                  background: "var(--color-bg)", border: "1px solid var(--color-border)",
                  color: "var(--color-text)", fontSize: 14, outline: "none",
                  fontFamily: "inherit", resize: "vertical",
                }}
              />
            ) : (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder={step?.placeholder || "Digite aqui..."}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 14,
                  background: "var(--color-bg)", border: "1px solid var(--color-border)",
                  color: "var(--color-text)", fontSize: 14, outline: "none",
                  fontFamily: "inherit",
                }}
              />
            )}
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              style={{
                width: 48, height: 48, borderRadius: 14,
                background: input.trim() ? "var(--color-cta)" : "var(--color-surface-soft)",
                border: "none", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 150ms",
              }}
            >
              <Send size={18} color={input.trim() ? "#fff" : "var(--color-text-sec)"} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
