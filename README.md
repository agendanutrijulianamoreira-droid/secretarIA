# SecretarIA — WA AI Manager

Plataforma de gestão para implementações de IA assistente no WhatsApp.

## Funcionalidades

- **Dashboard admin** — visão geral de todos os clientes, status n8n, métricas
- **Briefing Wizard** — 6 passos para configurar a IA de cada cliente (negócio, persona, serviços, FAQs, regras, plano)
- **Portal do Cliente** — área autenticada onde o cliente visualiza o briefing, envia mensagens para a equipe e acessa cobranças
- **Pagamentos via Asaas** — histórico de implementação + mensalidades com status e link de pagamento

## Stack

- React + Vite
- Sem dependências externas além do React

## Rodar localmente

```bash
npm install
npm run dev
```

## Próximos passos

- [ ] Autenticação (magic link via Supabase)
- [ ] Integração API Asaas (geração automática de cobranças)
- [ ] API oficial WhatsApp Cloud (Meta)
- [ ] Webhook n8n por cliente
- [ ] Google Calendar OAuth por conta
