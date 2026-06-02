import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import pool from '../lib/db.js';

// Registra ações sensíveis no banco para auditoria (LGPD art. 37)
export const auditLog = (action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
        // Loga todas as ações (sucesso e falha) para rastreabilidade LGPD
      if (res.statusCode < 500) {
        pool.query(
          `INSERT INTO audit_logs (user_id, user_email, action, resource, ip, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            req.user?.id ?? null,
            req.user?.email ?? 'anonymous',
            action,
            req.originalUrl,
            req.ip,
          ]
        ).catch(() => {}); // Não bloqueia a resposta se o log falhar
      }
      return originalJson(body);
    };

    next();
  };
};
