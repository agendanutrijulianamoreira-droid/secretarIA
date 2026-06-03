import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "agendanutrijulianamoreira@gmail.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autorizado" }, 401);

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || user?.email !== ADMIN_EMAIL) return json({ error: "Não autorizado" }, 401);

    const { email, password, mode = "create" } = await req.json();
    if (!email || !password) return json({ error: "Email e senha são obrigatórios" }, 400);
    if (password.length < 6) return json({ error: "A senha precisa ter pelo menos 6 caracteres" }, 400);

    if (mode === "reset") {
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listErr) return json({ error: listErr.message }, 500);
      const target = users.find((u: { email: string }) => u.email === email);
      if (!target) return json({ error: "Usuário não encontrado. Verifique o e-mail." }, 404);
      const { error } = await supabaseAdmin.auth.admin.updateUserById((target as { id: string }).id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    // mode === "create"
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        return json({ user_id: null, already_exists: true });
      }
      return json({ error: error.message }, 400);
    }

    return json({ user_id: data.user.id });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
