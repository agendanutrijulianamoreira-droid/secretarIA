// Shapes dos dados do SecretarIA.
// Nenhum código executável — só documentação de tipos via JSDoc.
// Nenhum código executável — só documentação de tipos via JSDoc.
// A IA lê este arquivo antes de criar/editar qualquer hook ou service.

/**
 * @typedef {'Starter'|'Pro'|'Enterprise'} Plan
 */

/**
 * @typedef {'setup'|'active'|'suspended'} ClientStatus
 */

/**
 * @typedef {'paid'|'pending'|'overdue'} PaymentStatus
 */

/**
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {Plan} plan
 * @property {ClientStatus} status
 * @property {PaymentStatus} payment_status
 * @property {Object} [briefing]
 * @property {number} msgs_today
 * @property {number} msgs_month
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {'novo'|'contatado'|'qualificado'|'convertido'|'perdido'} CRMStatus
 */

/**
 * @typedef {'ativo'|'pausado'} AtendimentoIA
 */

/**
 * @typedef {Object} Contato
 * @property {string} id
 * @property {string} client_id
 * @property {string} telefone
 * @property {string} nome
 * @property {AtendimentoIA} atendimento_ia
 * @property {string} ia_nome
 * @property {CRMStatus} crm_status
 * @property {string} crm_notes
 * @property {string} ultima_interacao
 * @property {number} total_mensagens
 * @property {string} created_at
 */

/**
 * @typedef {Object} Paciente
 * @property {string} id
 * @property {string} client_id
 * @property {string} nome
 * @property {string} telefone
 * @property {string} [email]
 * @property {string} [data_nascimento]
 * @property {string} [observacoes]
 * @property {boolean} ativo
 * @property {'manual'|'lead_convertido'} origem
 * @property {string|null} contato_id
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Servico
 * @property {string} id
 * @property {string} client_id
 * @property {string} nome
 * @property {string} descricao
 * @property {number} preco
 * @property {number} duracao_minutos
 * @property {boolean} ativo
 * @property {string} created_at
 */

/**
 * @typedef {'rascunho'|'agendada'|'enviando'|'concluida'|'cancelada'} CampanhaStatus
 */

/**
 * @typedef {Object} Campanha
 * @property {string} id
 * @property {string} client_id
 * @property {string} tipo
 * @property {string} titulo
 * @property {string} mensagem
 * @property {string[]} pacientes_alvo
 * @property {CampanhaStatus} status
 * @property {string|null} agendada_para
 * @property {number} enviados
 * @property {number} falhas
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Agendamento
 * @property {string} id
 * @property {string} client_id
 * @property {string} data_inicio
 * @property {string} [paciente_nome]
 * @property {string} [servico_nome]
 * @property {string} [profissional_nome]
 * @property {'confirmado'|'pendente'|'cancelado'} [status]
 * @property {string} created_at
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} client_id
 * @property {string} descricao
 * @property {number} valor
 * @property {'pendente'|'pago'|'cancelado'} status
 * @property {string|null} paid_at
 * @property {string} created_at
 */

/**
 * @typedef {Object} PortalMessage
 * @property {string} id
 * @property {string} client_id
 * @property {string} text
 * @property {'client'|'admin'} from_role
 * @property {boolean} read
 * @property {string} created_at
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {string} client_id
 * @property {string} telefone
 * @property {string} content
 * @property {'enviado'|'recebido'} direction
 * @property {string} created_at
 */

/**
 * @typedef {Object} IAAprendizado
 * @property {string} id
 * @property {string} client_id
 * @property {'conversa'|'feedback'} tipo
 * @property {string} resumo
 * @property {string} aprendizado
 * @property {'pendente'|'aprovado'|'rejeitado'} status
 * @property {string} telefone_origem
 * @property {boolean} [corrigido]
 * @property {string} created_at
 */

/**
 * @typedef {'gerente_geral'|'faq'|'recepcionista'|'follow_up'|'acompanhamento'|'vendedor'} AgenteTipo
 */

/**
 * @typedef {Object} AgenteConfig
 * @property {string} id
 * @property {string} client_id
 * @property {AgenteTipo} tipo
 * @property {boolean} ativo
 * @property {string} nome
 * @property {string} instrucoes
 * @property {boolean} pode_falar_preco
 * @property {boolean} pode_agendar
 * @property {boolean} escalar_para_humano
 * @property {Object} config_extra
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} WhatsAppNumber
 * @property {string} id
 * @property {string} client_id
 * @property {string} numero
 * @property {string} nome_display
 * @property {string} ia_nome
 * @property {string} ia_funcao
 * @property {'ativo'|'pendente'|'inativo'} status
 * @property {boolean} cobrado_extra
 * @property {string} created_at
 */
