import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'agendanutrijulianamoreira@gmail.com';

// Garante que o usuário só acessa dados do próprio client_id
export const tenantGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (user.email === ADMIN_EMAIL) {
    return next();
  }

  const requestedClientId = req.params.clientId || req.params.id || req.body?.client_id;

  if (requestedClientId && user.client_id !== requestedClientId) {
    console.warn(`[SECURITY] Acesso negado: ${user.email} tentou acessar client ${requestedClientId}`);
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};
