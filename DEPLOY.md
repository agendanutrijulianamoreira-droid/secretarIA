# Deploy no Railway — Guia de Serviços

Este projeto é um **monorepo** com três serviços independentes no Railway:

| Serviço | Diretório | Tipo |
|---------|-----------|------|
| `secretarIA` (frontend) | `/` (raiz) | Web estático (Vite) |
| `secretarIA-backend` | `/backend` | API Node.js/Express |
| `secretarIA-db` | — | PostgreSQL (plugin Railway) |

---

## 1. Criar o serviço de Backend

O frontend já está criado. Para adicionar o backend:

1. No painel do Railway, clique em **"+ New"** (botão no canto superior do canvas)
2. Escolha **"GitHub Repo"**
3. Selecione o repositório `secretarIA`
4. Em **"Root Directory"**, coloque: `backend`
5. O Railway vai detectar o `railway.toml` dentro de `/backend` automaticamente
6. Clique em **"Deploy"**

> O arquivo `backend/railway.toml` já está configurado com Nixpacks, build e start commands.

---

## 2. Criar o banco de dados PostgreSQL

1. No painel do Railway, clique em **"+ New"**
2. Escolha **"Database" → "Add PostgreSQL"**
3. O Railway cria o banco e expõe a variável `DATABASE_URL` automaticamente
4. Vincule essa variável ao serviço `secretarIA-backend`:
   - Clique no serviço `secretarIA-backend` → **"Variables"**
   - Clique em **"+ New Variable"** → **"Add Reference"**
   - Selecione `Postgres.DATABASE_URL`

---

## 3. Variáveis de ambiente necessárias

### Frontend (`secretarIA`)

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL pública do backend (ex: `https://secretaria-backend-xxx.up.railway.app`) |
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon do Supabase |

### Backend (`secretarIA-backend`)

| Variável | Fonte |
|----------|-------|
| `DATABASE_URL` | Referência ao `Postgres.DATABASE_URL` |
| `FRONTEND_URL` | URL pública do frontend |
| `OPENAI_API_KEY` | Chave da OpenAI |
| `ASAAS_API_KEY` | Chave da API Asaas |
| `WHATSAPP_TOKEN` | Token da API WhatsApp Cloud (Meta) |
| `WHATSAPP_VERIFY_TOKEN` | Token de verificação do webhook |

---

## 4. Expor o backend publicamente

Por padrão, novos serviços no Railway são **internos** (sem domínio público).

1. Clique no serviço `secretarIA-backend`
2. Vá em **"Settings"**
3. Em **"Networking"**, clique em **"Generate Domain"**
4. Copie o domínio gerado e cole como `VITE_API_URL` no frontend

---

## 5. Ordem de deploy recomendada

```
1. PostgreSQL (banco de dados)
2. secretarIA-backend (API)
3. secretarIA (frontend — após ter a URL da API)
```

---

## 6. Rodar as migrations do banco

Após o PostgreSQL estar online, execute os scripts SQL em ordem no **SQL Editor do Supabase** ou via `psql`:

```
database/01_supabase.sql
database/02_postgres.sql
database/03_saas_multitenancy.sql
...
database/11_marketing_and_followup.sql
```

---

## Verificar saúde dos serviços

- **Frontend**: acesse a URL pública → deve carregar a interface
- **Backend**: `GET /health` → retorna `{ "status": "ok" }`
- **Banco**: verifique em **"Data"** no plugin PostgreSQL do Railway
