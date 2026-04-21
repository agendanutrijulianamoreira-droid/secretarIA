-- =============================================================================
-- SECRETARIA IA — FUNÇÕES AUXILIARES DE FOLLOW-UP
-- 07_followup_helper.sql
-- =============================================================================

-- Busca contatos elegíveis para follow-up de um tenant específico com limite
CREATE OR REPLACE FUNCTION get_eligible_followups(p_user_id UUID, p_limit INT DEFAULT 20)
RETURNS SETOF contatos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM contatos
  WHERE user_id = p_user_id
    AND proximo_followup <= now()
    AND status IN ('LEAD', 'AGENDADO')
    AND ia_pausada = false
    AND lgpd_consent = true
    AND followup_count < (
      COALESCE(
        (SELECT valor::int FROM config WHERE user_id = p_user_id AND chave = 'followup_max'),
        3
      )
    )
  ORDER BY proximo_followup ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário para documentação:
-- Esta função permite que o n8n processe follow-ups em lotes controlados por nutricionista,
-- respeitando as configurações individuais de limite (followup_max).
