import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[SecretarIA] Supabase não configurado!\n" +
    "Crie um arquivo .env.local na raiz do projeto com:\n" +
    "  VITE_SUPABASE_URL=https://xxxx.supabase.co\n" +
    "  VITE_SUPABASE_ANON_KEY=eyJ...\n" +
    "Valores encontrados em: Supabase > Project Settings > API"
  );
}

export const supabase = createClient(supabaseUrl ?? "http://localhost", supabaseKey ?? "missing");
export const auth     = supabase.auth;
