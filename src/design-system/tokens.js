// Tokens de design e constantes de negócio centralizadas
// Edite aqui para propagar mudanças em todo o projeto

export const COLORS = [
  "#6366F1", "#EC4899", "#F59E0B",
  "#0EA5E9", "#10B981", "#8B5CF6", "#F43F5E",
];

export const PLAN_META = {
  Starter:    { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", label: "START" },
  Pro:        { color: "#10B981", bg: "rgba(16,185,129,0.1)",  label: "PRO" },
  Enterprise: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  label: "ELITE" },
};

export const CRM_STATUSES = {
  novo:        { label: "Novo Lead",   color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  contatado:   { label: "Conversando", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  qualificado: { label: "Interessado", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  convertido:  { label: "Convertido",  color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  perdido:     { label: "Arquivado",   color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
};

export const SEGMENTS = [
  "Nutricionista",
  "Saúde / Clínica", "Saúde / Odontologia", "Psicologia",
  "Fisioterapia", "Estética / Beleza", "Beleza / Salão",
  "Educação", "Imobiliária", "Jurídico", "Alimentação",
  "Varejo", "Serviços Gerais", "Outro",
];

export const TONES = [
  "Acolhedora e profissional", "Formal e sério",
  "Descontraído e amigável", "Jovial e animado", "Técnico e objetivo",
];

export const GOALS = [
  "Agendamentos", "Vendas / Captação",
  "Suporte ao cliente", "Tirar dúvidas (FAQ)", "Tudo acima",
];

export const EMPTY_BRIEFING = {
  segment: "", description: "", site: "", instagram: "",
  ai_name: "", ai_tone: "", ai_goal: "", business_hours: "",
  escalation_trigger: "", escalation_number: "",
  services: [], faqs: [], restrictions: "", promotions: "",
  ia_fala_preco: false,
};

export const AGENT_TYPES = [
  {
    tipo: "gerente_geral",
    label: "Gerente Geral",
    descricao: "Classifica a mensagem e decide qual agente responde. Não conversa diretamente com o paciente.",
    pode_editar: false,
  },
  {
    tipo: "faq",
    label: "FAQ",
    descricao: "Responde dúvidas sobre horários, localização, especialidades e informações gerais.",
    pode_editar: true,
  },
  {
    tipo: "recepcionista",
    label: "Recepcionista",
    descricao: "Cuida de agendamentos, recados, confirmações e triagem inicial.",
    pode_editar: true,
  },
  {
    tipo: "follow_up",
    label: "Follow-up & Recuperação",
    descricao: "Reativa pacientes que sumiram e faz check-in de retorno após abandono.",
    pode_editar: true,
  },
  {
    tipo: "acompanhamento",
    label: "Acompanhamento",
    descricao: "Suporte para pacientes em tratamento ativo: lembretes, orientações e evolução.",
    pode_editar: true,
  },
  {
    tipo: "vendedor",
    label: "Vendedor",
    descricao: "Apresenta serviços e converte leads do CRM em consultas agendadas.",
    pode_editar: true,
  },
];

export const PLAN_LIMITS = {
  Starter:    1,
  Pro:        3,
  Enterprise: 5,
};

export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "agendanutrijulianamoreira@gmail.com";
