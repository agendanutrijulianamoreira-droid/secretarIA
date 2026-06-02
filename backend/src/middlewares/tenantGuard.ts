import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import pool from '../lib/db.js';

if (!process.env.ADMIN_EMAIL) {
  console.error('[SECURITY] ADMIN_EMAIL env var não definida — acesso admin desabilitado');
}

// Garante que o usuário só acessa dados do próprio client_id
export const tenantGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail) {
    return next();
  }

  const requestedClientId = req.params.clientId || req.params.id || req.body?.client_id;

  if (requestedClientId && user.client_id !== requestedClientId) {
    // Persiste falha de autorização no banco (LGPD art. 37)
    pool.query(
      `INSERT INTO audit_logs (user_id, user_email, action, resource, ip, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [user.id, user.email, 'ACCESS_DENIED', req.originalUrl, req.ip]
    ).catch(() => {});
    console.warn(`[SECURITY] Acesso negado: ${user.email} tentou acessar client ${requestedClientId}`);
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};
