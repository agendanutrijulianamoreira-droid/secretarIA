import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

const ADMIN_EMAIL = "agendanutrijulianamoreira@gmail.com";

/**
 * Middleware para garantir que o usuário logado só acesse dados de sua própria clínica.
 * Assume que :clientId ou :id na URL é o identificador único da clínica (ex: e-mail ou UUID).
 */
export const tenantGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  const targetClientId = req.params.clientId || req.params.id;

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Admin tem passe livre para qualquer tenant
  if (user.email === ADMIN_EMAIL) {
    return next();
  }

  // Verifica se o ID solicitado corresponde ao e-mail do usuário logado
  // (Ou outra lógica de mapeamento se o clientId não for o e-mail)
  if (targetClientId && user.email === targetClientId) {
    return next();
  }

  // Se o clientId for um UUID, precisaríamos de uma consulta prévia ao banco 
  // para verificar a relação user.email -> clinic.id. 
  // Por simplicidade e segurança Zero Trust imediata, bloqueamos se não houver match direto.
  
  console.warn(`🚨 Security Alert: User ${user.email} tried to access ${targetClientId}`);
  return res.status(403).json({ error: 'Forbidden: You do not have access to this tenant data' });
};
