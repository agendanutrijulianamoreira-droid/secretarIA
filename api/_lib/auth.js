import { auth } from "./firebase.js";

/**
 * Verifica o token Bearer do header Authorization.
 * Retorna o decoded token com uid, email, role, client_id.
 * Lança erro se inválido.
 */
export async function verifyAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    const err = new Error("Token não fornecido");
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || "client",
      client_id: decoded.client_id || null,
    };
  } catch (e) {
    const err = new Error("Token inválido ou expirado");
    err.statusCode = 401;
    throw err;
  }
}

/**
 * Verifica se o usuário tem role 'admin'.
 */
export async function requireAdmin(req) {
  const user = await verifyAuth(req);
  if (user.role !== "admin") {
    const err = new Error("Acesso restrito a administradores");
    err.statusCode = 403;
    throw err;
  }
  return user;
}

/**
 * Verifica se o usuário é admin OU é dono do client_id especificado.
 */
export async function requireAdminOrOwner(req, clientId) {
  const user = await verifyAuth(req);
  if (user.role !== "admin" && user.client_id !== clientId) {
    const err = new Error("Sem permissão para acessar este recurso");
    err.statusCode = 403;
    throw err;
  }
  return user;
}
