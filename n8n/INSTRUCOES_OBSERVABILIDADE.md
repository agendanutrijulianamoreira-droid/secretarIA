# Instruções: Ativar Logging no Workflow Principal

## 1. Importar os novos workflows no n8n

Importar os seguintes arquivos em **Workflows > Import**:

- `workflow_log_erro.json` — sub-workflow para registrar erros no Supabase
- `workflow_webhook_logger.json` — health checks a cada 6h + limpeza diária de logs

## 2. Adicionar logging de webhooks ao workflow_cloudapi.json

Após o nó **"Extrair Dados POST"**, adicione um nó HTTP Request paralelo (não bloqueia o fluxo principal):

```
Nó: "Log Webhook Recebido"
Tipo: HTTP Request
Método: POST
URL: {{ $env.SUPABASE_URL }}/rest/v1/webhook_logs

Headers:
  apikey: {{ $env.SUPABASE_SERVICE_KEY }}
  Authorization: Bearer {{ $env.SUPABASE_SERVICE_KEY }}
  Content-Type: application/json
  Prefer: return=minimal

Body (JSON):
{
  "wa_phone_number_id": "{{ $('Extrair Dados POST').first().json.phone_number_id }}",
  "evento": "messages",
  "direcao": "incoming",
  "phone_contato": "{{ $('Extrair Dados POST').first().json.sender_phone }}",
  "conteudo_preview": "{{ $('Extrair Dados POST').first().json.message_body?.substring(0, 200) }}",
  "tipo_conteudo": "{{ $('Extrair Dados POST').first().json.message_type }}",
  "status_processamento": "received"
}
```

Conecte este nó em **paralelo** ao nó "Buscar Tenant" — sem dependência entre eles.

## 3. Adicionar log no resultado do processamento

Após o nó que envia a resposta via Cloud API, adicione um nó para atualizar o status do log:

```
Nó: "Atualizar Log Processado"
Tipo: HTTP Request
Método: PATCH
URL: {{ $env.SUPABASE_URL }}/rest/v1/webhook_logs?wa_phone_number_id=eq.{{ $json.wa_phone_number_id }}&status_processamento=eq.received

Body:
{
  "status_processamento": "processed",
  "user_id": "{{ $json.user_id }}"
}
```

## 4. Adicionar tratamento de erros (Error Branch)

Em qualquer nó crítico (Buscar Tenant, LLM, Enviar mensagem), adicione um branch de erro:

```
Nó de erro: "Capturar Erro"
Tipo: Execute Workflow
Workflow: "SecretarIA — Log de Erro (Sub-Workflow)"

Dados a passar:
{
  "workflow_nome": "SecretarIA Cloud API",
  "node_nome": "{{ $node.name }}",
  "mensagem_erro": "{{ $json.error?.message || 'Erro desconhecido' }}",
  "user_id": "{{ $('Montar Contexto Tenant').first().json.user_id ?? null }}",
  "execucao_id": "{{ $execution.id }}"
}
```

## 5. Configurar variáveis de ambiente no n8n

Certifique-se que as seguintes variáveis estão configuradas em **n8n Settings > Environment Variables**:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

## 6. Executar a migração SQL

Executar no Supabase SQL Editor:

```
\i database/06_observabilidade.sql
```

## Resultado

Após a configuração, o painel de **Observabilidade** no app mostrará:
- Todos os webhooks recebidos com status de processamento
- Erros de workflow com payload e contexto
- Health checks dos componentes (Supabase, OpenAI, n8n)
- Status de conexão de cada tenant
