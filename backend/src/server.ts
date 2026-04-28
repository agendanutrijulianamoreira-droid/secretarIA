import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import whatsappRoutes from './routes/whatsapp.js';
import asaasRoutes from './routes/asaas.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/webhooks/whatsapp', whatsappRoutes);
app.use('/webhooks/asaas', asaasRoutes);

// Initialize Scheduler
import { initScheduler } from './services/scheduler.js';
initScheduler();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 SecretarIA Backend running on port ${port}`);
});
