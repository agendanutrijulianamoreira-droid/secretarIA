import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiLimiter, webhookLimiter } from './middlewares/rateLimiter.js';
import whatsappRoutes from './routes/whatsapp.js';
import asaasRoutes from './routes/asaas.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Headers de segurança HTTP
app.use(helmet());

// CORS: só aceita do frontend autorizado
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (webhooks do WhatsApp/Asaas não enviam origin)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true,
}));

// Limite de tamanho de payload
app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/webhooks/', webhookLimiter);

// Rotas
app.use('/webhooks/whatsapp', whatsappRoutes);
app.use('/webhooks/asaas', asaasRoutes);

// Jobs agendados
import { initScheduler } from './services/scheduler.js';
initScheduler();

// Health check (sem dados sensíveis)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler global de erros
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`SecretarIA Backend rodando na porta ${port}`);
});
