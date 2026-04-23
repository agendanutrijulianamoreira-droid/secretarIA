import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia e-mail de boas-vindas com credenciais de acesso.
 * @param {string} to - E-mail do destinatário
 * @param {string} name - Nome do cliente
 * @param {string} password - Senha gerada automaticamente
 * @param {string} plan - Nome do plano contratado
 */
export async function sendWelcomeEmail(to, name, password, plan) {
  const loginUrl = process.env.APP_URL || "https://secretaria-wa-ai.vercel.app";
  const firstName = name.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; background: #FAFAF7; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
    .card { background: #fff; border-radius: 24px; padding: 48px 36px; border: 1px solid rgba(122,139,130,0.12); box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-text { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #2D3436; }
    .logo-text span { color: #7A8B82; }
    .subtitle { text-align: center; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #7A8B82; font-weight: 700; margin-top: 4px; }
    h1 { font-size: 22px; color: #2D3436; margin: 0 0 8px; }
    p { font-size: 15px; color: #717171; line-height: 1.6; margin: 0 0 16px; }
    .credentials { background: #F5F2ED; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid rgba(122,139,130,0.08); }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(122,139,130,0.08); }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .cred-value { font-size: 15px; color: #2D3436; font-weight: 700; font-family: monospace; }
    .plan-badge { display: inline-block; background: rgba(122,139,130,0.1); color: #7A8B82; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .cta { display: block; text-align: center; background: #7A8B82; color: #fff; padding: 18px 32px; border-radius: 14px; text-decoration: none; font-size: 16px; font-weight: 700; margin: 32px 0 24px; letter-spacing: 0.5px; }
    .footer { text-align: center; font-size: 12px; color: #999; margin-top: 32px; }
    .warning { background: #FFF8E1; border: 1px solid #FFE082; border-radius: 12px; padding: 14px 18px; font-size: 13px; color: #F57F17; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <div class="logo-text">Secretár<span>IA</span></div>
        <div class="subtitle">Artificial Intelligence</div>
      </div>
      
      <h1>Bem-vinda, ${firstName}! 🎉</h1>
      <p>Sua conta <span class="plan-badge">${plan}</span> foi ativada com sucesso. Abaixo estão seus dados de acesso ao painel:</p>
      
      <div class="credentials">
        <div class="cred-row">
          <span class="cred-label">E-mail</span>
          <span class="cred-value">${to}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Senha</span>
          <span class="cred-value">${password}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Plano</span>
          <span class="cred-value">${plan}</span>
        </div>
      </div>

      <div class="warning">
        🔒 Recomendamos que você troque sua senha no primeiro acesso em Configurações.
      </div>

      <a href="${loginUrl}" class="cta">Acessar Meu Painel →</a>

      <p style="font-size: 13px;">Ao entrar pela primeira vez, nossa IA vai te guiar passo a passo para configurar seu atendimento inteligente. Leva menos de 5 minutos!</p>
    </div>
    <div class="footer">
      © 2026 SecretárIA Systems · Todos os direitos reservados.
    </div>
  </div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "SecretárIA <noreply@secretaria.app>",
      to,
      subject: `🎉 Bem-vinda à SecretárIA, ${firstName}! Seus dados de acesso`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("Welcome email sent:", data?.id);
    return data;
  } catch (err) {
    console.error("Email send failed:", err);
    // Não bloquear o fluxo se o e-mail falhar
    return null;
  }
}
