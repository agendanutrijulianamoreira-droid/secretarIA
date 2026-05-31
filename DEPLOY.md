# Deploy no VPS Hostinger

## Plano recomendado
**VPS KVM 1** (~R$25-35/mês) — suficiente para começar com 1-3 clínicas.

---

## 1. Configuração inicial do VPS (só na primeira vez)

Acesse o VPS via SSH como root:

```bash
ssh root@IP_DO_SEU_VPS
```

Baixe e execute o script de setup:

```bash
curl -O https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/deploy/setup-vps.sh
bash setup-vps.sh
```

Isso instala: Node.js 20, PM2, Nginx, Certbot e Git.

---

## 2. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPO.git /var/www/secretaria
```

---

## 3. Configurar variáveis de ambiente

```bash
# Backend
cp /var/www/secretaria/.env.example /var/www/secretaria/backend/.env
nano /var/www/secretaria/backend/.env
# Preencha todas as variáveis

# Frontend
cp /var/www/secretaria/.env.example /var/www/secretaria/.env
nano /var/www/secretaria/.env
# Preencha as variáveis VITE_*
```

---

## 4. Configurar o Nginx

```bash
cp /var/www/secretaria/deploy/nginx.conf /etc/nginx/sites-available/secretaria
ln -s /etc/nginx/sites-available/secretaria /etc/nginx/sites-enabled/secretaria
nano /etc/nginx/sites-available/secretaria
# Substitua SEU_DOMINIO.com pelo seu domínio real

nginx -t && systemctl reload nginx
```

---

## 5. Gerar certificado SSL gratuito

```bash
certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com
```

---

## 6. Primeiro deploy

```bash
bash /var/www/secretaria/deploy/deploy.sh
```

---

## 7. Deploys futuros (atualizar o sistema)

Sempre que fizer alterações no código:

```bash
ssh root@IP_DO_SEU_VPS
bash /var/www/secretaria/deploy/deploy.sh
```

---

## Comandos úteis no VPS

```bash
# Ver status do backend
pm2 status

# Ver logs em tempo real
pm2 logs secretaria-backend

# Reiniciar o backend manualmente
pm2 restart secretaria-backend

# Ver logs do Nginx
tail -f /var/log/nginx/error.log

# Ver logs do app
tail -f /var/www/secretaria/logs/backend-error.log
```

---

## Configurar o WhatsApp (Evolution API)

O Evolution API precisa ser instalado separadamente. Opções:
1. **No mesmo VPS** — instale via Docker na porta 8080
2. **Serviço separado** — use um VPS menor ou serviço gerenciado

Após instalar, crie uma instância e configure o webhook apontando para:
```
https://SEU_DOMINIO.com/webhooks/whatsapp
```

---

## Variáveis obrigatórias para funcionar

| Variável | Onde encontrar |
|----------|---------------|
| `SUPABASE_URL` | Supabase > Project Settings > API |
| `SUPABASE_SERVICE_KEY` | Supabase > Project Settings > API > service_role |
| `POSTGRES_*` | Supabase > Project Settings > Database |
| `OPENAI_API_KEY` | platform.openai.com > API Keys |
| `EVO_*` | Painel do seu Evolution API |
| `VITE_SUPABASE_URL` | Supabase > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase > Project Settings > API > anon/public |
