// PM2 — Gerenciador de processos Node.js
// Mantém o backend rodando 24h e reinicia automaticamente em caso de falha
// Uso: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "secretaria-backend",
      script: "./backend/dist/server.js",
      cwd: "/var/www/secretaria",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",

      // Reinicia automaticamente às 4h da manhã (limpeza de memória)
      cron_restart: "0 4 * * *",

      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },

      // Logs ficam em /var/www/secretaria/logs/
      error_file: "/var/www/secretaria/logs/backend-error.log",
      out_file: "/var/www/secretaria/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
