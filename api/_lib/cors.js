const ALLOWED_ORIGINS = [
  "http://localhost:5180",
  "http://localhost:3000",
  "https://secretaria-wa-ai.vercel.app",
];

/**
 * Configura headers CORS e trata preflight (OPTIONS).
 * Retorna true se a request é OPTIONS (preflight) e já foi respondida.
 */
export function handleCors(req, res) {
  const origin = req.headers.origin || "";

  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".vercel.app")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}

/**
 * Envia resposta de erro padronizada.
 */
export function sendError(res, err) {
  const status = err.statusCode || 500;
  const message = err.message || "Erro interno do servidor";
  console.error(`[API Error ${status}]`, message);
  res.status(status).json({ error: message });
}
