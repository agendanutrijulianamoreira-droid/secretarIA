import { useState, useRef, useEffect } from "react";
import { Clientes } from "../../lib/db";
import { Logo } from "../../components/UI";
import { Send, Sparkles, CheckCircle, Bot, User, ArrowRight, Brain, Zap } from "lucide-react";

// ── Fluxo de perguntas do Onboarding ────────────────────────────────────────
const STEPS = [
  {
    id: "welcome",
    bot: (name) => `Olá, ${name.split(" ")[0]}! 🎉 Sou o motor de inteligência da SecretarIA. Vou configurar seu atendimento premium em poucos segundos. Preparado(a)?`,
    field: null, 
    options: ["Começar Configuração 🚀"],
  },
  {
    id: "segment",
    bot: () => "Para começar, em qual nicho da saúde você atua?",
    field: "segment",
    options: ["Nutrição", "Dermatologia", "Psicologia", "Odontologia", "Fisioterapia", "Estética", "Outro"],
  },
  {
    id: "description",
    bot: () => "Defina sua clínica em uma frase. Qual o seu diferencial competitivo?",
    field: "description",
    placeholder: "Ex: Especialista em emagrecimento com foco em longevidade...",
  },
  {
    id: "ai_name",
    bot: () => "Como devemos chamar sua IA no WhatsApp? (Escolha um nome amigável)",
    field: "ai_name",
    placeholder: "Ex: Ana, Sofia, Clara...",
  },
  {
    id: "ai_tone",
    bot: (_, answers) => `Entendido. A ${answers.ai_name || "IA"} deve se comunicar em qual tom?`,
    field: "ai_tone",
    options: ["Acolhedora e Empática", "Formal e Técnica", "Descontraída e Ágil", "Objetiva e Direta"],
  },
  {
    id: "ai_goal",
    bot: () => "Qual a missão principal da sua nova assistente?",
    field: "ai_goal",
    options: ["Agendamentos", "Vendas Ativas", "Suporte FAQ", "Tudo acima"],
  },
  {
    id: "business_hours",
    bot: () => "Quais os horários de atendimento da clínica?",
    field: "business_hours",
    placeholder: "Ex: Seg a Sex, 08h às 19h.",
  },
  {
    id: "services",
    bot: () => "Liste seus principais serviços e valores sugeridos (opcional).",
    field: "services_text",
    placeholder: "Ex:\nConsulta - R$ 300\nBioimpedância - R$ 100",
    rows: 4,
  },
  {
    id: "done",
    bot: (_, answers) => `Arquitetura concluída! 🦾 A ${answers.ai_name || "IA"} já está carregada com sua personalidade. Vamos ao painel?`,
    field: null,
    options: ["Ativar Dashboard →"],
    isFinal: true,
  },
];

// ── Componente de Mensagem ──────────────────────────────────────────────────
function ChatBubble({ from, text, animate }) {
  const isBot = from === "bot";
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6 animate-fade-in`}>
      <div className={`max-w-[85%] p-6 rounded-[28px] text-sm leading-relaxed ${isBot ? 'bg-surface border border-border-subtle rounded-bl-none shadow-sm' : 'bg-primary text-black font-medium rounded-br-none shadow-lg shadow-primary/20'}`}>
        {isBot && (
          <div className="flex items-center gap-2 mb-3 opacity-50">
            <Bot size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">SecretarIA Intelligence</span>
          </div>
        )}
        <p className="whitespace-pre-line">{text}</p>
        {!isBot && (
           <div className="mt-2 flex items-center justify-end gap-2 text-[9px] font-black uppercase tracking-widest opacity-40">
              <User size={10} /> Você
           </div>
        )}
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

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

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

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");

    const newAnswers = { ...answers };
    if (step.field) {
      newAnswers[step.field] = text;
      setAnswers(newAnswers);
    }

    if (step.isFinal) {
      setSaving(true);
      try {
        const briefing = {
          segment: newAnswers.segment || "",
          description: newAnswers.description || "",
          ai_name: newAnswers.ai_name || "",
          ai_tone: newAnswers.ai_tone || "",
          ai_goal: newAnswers.ai_goal || "",
          business_hours: newAnswers.business_hours || "",
          services_text: newAnswers.services_text || "",
        };

        await Clientes.update(client.id, { briefing, status: "active" });
        setTimeout(() => onComplete(), 1500);
      } catch (err) {
        setSaving(false);
      }
      return;
    }

    advanceToStep(currentStep + 1);
  };

  const step = STEPS[currentStep];

  return (
    <div className="flex flex-col h-screen bg-background text-main font-sans selection:bg-primary/20">
      {/* Header */}
      <div className="px-8 py-6 bg-surface border-b border-border-subtle flex items-center justify-between sticky top-0 z-50">
        <Logo size={28} />
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest shadow-sm">
           <Zap size={14} className="fill-current" />
           Deploy de Inteligência
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-8 bg-surface border-b border-border-subtle/50">
        <div className="h-1 w-full bg-surface-up rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${Math.min(100, (currentStep / (STEPS.length - 1)) * 100)}%` }}
          />
        </div>
        <p className="text-[9px] text-tertiary font-black uppercase tracking-[0.3em] py-4 text-center">
          Calibragem: {Math.floor((currentStep / (STEPS.length - 1)) * 100)}%
        </p>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto p-8 flex flex-col custom-scrollbar bg-surface/30"
      >
        <div className="max-w-3xl mx-auto w-full">
          {messages.map((msg, i) => (
            <ChatBubble key={i} from={msg.from} text={msg.text} animate={i === messages.length - 1} />
          ))}

          {typing && (
            <div className="flex gap-1.5 p-4 bg-surface rounded-2xl w-fit animate-pulse border border-border-subtle">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/30" />
            </div>
          )}

          {saving && (
            <div className="p-8 rounded-[32px] bg-primary text-black flex items-center gap-4 animate-bounce shadow-2xl shadow-primary/30 mx-auto w-fit">
               <CheckCircle size={24} />
               <span className="font-black text-xs uppercase tracking-widest">Sincronizando com o Core...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8 bg-surface border-t border-border-subtle relative z-10">
        <div className="max-w-3xl mx-auto w-full">
          {step?.options && !typing && !saving && (
            <div className="flex flex-wrap gap-3 mb-6 justify-center">
              {step.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSend(opt)}
                  className="px-6 py-4 rounded-2xl bg-surface-up border border-border-subtle text-main text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {!step?.options && !typing && !saving && (
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative group">
                {step?.rows ? (
                  <textarea
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={step?.placeholder || "Escreva aqui..."}
                    rows={step.rows}
                    className="w-full p-5 rounded-[28px] bg-surface-up border border-border-subtle text-main text-sm outline-none focus:border-primary/50 transition-all resize-none shadow-inner"
                  />
                ) : (
                  <input
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                    placeholder={step?.placeholder || "Sua resposta..."}
                    className="w-full px-8 py-5 rounded-full bg-surface-up border border-border-subtle text-main text-sm outline-none focus:border-primary/50 transition-all shadow-inner"
                  />
                )}
              </div>
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-xl ${input.trim() ? 'bg-primary text-black shadow-primary/20 scale-110' : 'bg-surface-up text-tertiary opacity-50 cursor-default'}`}
              >
                <ArrowRight size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
