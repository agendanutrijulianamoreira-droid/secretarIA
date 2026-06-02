#!/bin/bash
# ============================================================
# Setup inicial do VPS Hostinger — SecretarIA
# Execute como root: bash setup-vps.sh
# ============================================================

set -e  # Para se qualquer comando falhar

echo "🚀 Iniciando configuração do VPS..."

# ── 1. Atualizar o sistema ────────────────────────────────
echo "📦 Atualizando pacotes..."
apt-get update -y && apt-get upgrade -y

# ── 2. Instalar Node.js 20 LTS ───────────────────────────
echo "📦 Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ── 3. Instalar PM2 e ferramentas ─────────────────────────
echo "📦 Instalando PM2..."
npm install -g pm2

# ── 4. Instalar Nginx ─────────────────────────────────────
echo "📦 Instalando Nginx..."
apt-get install -y nginx

# ── 5. Instalar Certbot (SSL grátis) ──────────────────────
echo "📦 Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx

# ── 6. Criar estrutura de pastas ──────────────────────────
echo "📁 Criando estrutura de pastas..."
mkdir -p /var/www/secretaria/frontend
mkdir -p /var/www/secretaria/logs
mkdir -p /var/www/secretaria/backend

# ── 7. Instalar Git ───────────────────────────────────────
apt-get install -y git

echo ""
echo "✅ Setup básico concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Clone o repositório: git clone <URL_DO_SEU_REPO> /var/www/secretaria"
echo "  2. Configure o domínio no Nginx: cp /var/www/secretaria/deploy/nginx.conf /etc/nginx/sites-available/secretaria"
echo "  3. Edite o nginx.conf com seu domínio real"
echo "  4. Execute: bash /var/www/secretaria/deploy/deploy.sh"
