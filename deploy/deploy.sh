#!/bin/bash
# ============================================================
# Deploy do SecretarIA no VPS Hostinger
# Execute a partir da raiz do projeto: bash deploy/deploy.sh
# ============================================================

set -e

DEPLOY_DIR="/var/www/secretaria"

echo "🚀 Iniciando deploy..."

# ── 1. Garantir que estamos no diretório certo ────────────
cd "$DEPLOY_DIR"

# ── 2. Puxar últimas alterações do Git ───────────────────
echo "📥 Baixando atualizações do repositório..."
git pull origin main

# ── 3. Instalar dependências do Backend ──────────────────
echo "📦 Instalando dependências do backend..."
cd "$DEPLOY_DIR/backend"
npm install --omit=dev

# ── 4. Compilar o Backend (TypeScript → JavaScript) ──────
echo "🔨 Compilando backend..."
npm run build

# ── 5. Instalar dependências do Frontend ─────────────────
echo "📦 Instalando dependências do frontend..."
cd "$DEPLOY_DIR/frontend-src"
npm install

# ── 6. Compilar o Frontend (React → arquivos estáticos) ──
echo "🔨 Compilando frontend..."
npm run build

# ── 7. Copiar frontend compilado para pasta do Nginx ─────
echo "📁 Atualizando arquivos do frontend..."
rm -rf /var/www/secretaria/frontend/*
cp -r "$DEPLOY_DIR/frontend-src/dist/"* /var/www/secretaria/frontend/

# ── 8. Reiniciar o Backend com PM2 ───────────────────────
echo "🔄 Reiniciando backend..."
if pm2 list | grep -q "secretaria-backend"; then
    pm2 restart secretaria-backend
else
    pm2 start "$DEPLOY_DIR/deploy/ecosystem.config.cjs"
fi

pm2 save

# ── 9. Recarregar Nginx ───────────────────────────────────
echo "🔄 Recarregando Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "Status do backend:"
pm2 status secretaria-backend
