# Adaptação Firebase — Nós n8n

O n8n não tem nó nativo para Firebase/Firestore.
Use **HTTP Request** chamando a **Firebase REST API** ou **Cloud Functions**.

## Opção 1 — Firebase REST API (sem servidor extra)

Endpoint base:
```
https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents
```

### Buscar config do cliente (substitui "Busca Config Cliente")
```
GET /clientes?where=waba_id={WABA_ID}
Authorization: Bearer {ID_TOKEN}
```

### Buscar/criar contato (substitui "Busca Contato" e "Cadastrar Contato")
```
GET /clientes/{clienteId}/contatos?where=telefone={TEL}
POST /clientes/{clienteId}/contatos
  Body: { fields: { telefone: {stringValue: "..."}, atendimento_ia: {stringValue: "ativo"} } }
```

### Verificar pause (substitui "Verificar Pause")
```
GET /clientes/{clienteId}/contatos/{contatoId}
→ Checar campo atendimento_ia
```

### Pausar IA (substitui "Pausar IA")
```
PATCH /clientes/{clienteId}/contatos/{contatoId}?updateMask.fieldPaths=atendimento_ia
  Body: { fields: { atendimento_ia: {stringValue: "pause"} } }
```

### Salvar mensagem (substitui "Salvar Histórico")
```
POST /clientes/{clienteId}/chat_messages
  Body: { fields: { telefone: {stringValue}, mensagem: {stringValue}, papel: {stringValue: "assistant"} } }
```

## Opção 2 — Firebase Admin SDK via Cloud Function (RECOMENDADA)

Crie uma Cloud Function que exponha endpoints REST simples para o n8n:

```
POST /api/getClientByWaba   → busca cliente pelo waba_id
POST /api/upsertContato     → cria ou retorna contato
POST /api/checkPause        → verifica atendimento_ia
POST /api/setPause          → atualiza atendimento_ia
POST /api/saveMessage       → salva chat_message
```

O n8n chama essas funções via HTTP Request com um token secreto no header.

## Credencial no n8n

Crie uma credencial "Header Auth":
- Name: Authorization  
- Value: Bearer {FIREBASE_ADMIN_TOKEN}

## Variáveis de ambiente no n8n

Crie variáveis globais:
- FIREBASE_PROJECT_ID = seu-projeto
- FIREBASE_API_BASE = https://firestore.googleapis.com/v1/projects/seu-projeto/databases/(default)/documents
- FIREBASE_FUNCTION_BASE = https://us-central1-seu-projeto.cloudfunctions.net/api

## Memória do Agente (LangChain)

O nó "Postgres Chat Memory" exige PostgreSQL — **não funciona com Firebase**.

Opções:
1. **Manter um Postgres** (Railway free tier: 100MB gratuito) só para memória
2. **Usar Redis Memory** — substitui Postgres Memory pelo nó "Redis Chat Memory"
3. **Buffer Memory** — memória apenas na execução atual (sem histórico entre sessões)

**Recomendado:** Railway Postgres para memória + Firebase para todo o resto.
