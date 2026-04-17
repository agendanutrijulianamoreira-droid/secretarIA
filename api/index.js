import { handleCors } from "./_lib/cors.js";

export default function handler(req, res) {
  if (handleCors(req, res)) return;

  res.status(200).json({
    status: "ok",
    service: "SecretarIA API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
}
