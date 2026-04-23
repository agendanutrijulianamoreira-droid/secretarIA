import { useState, useEffect } from "react";
import { Tokens } from "../../lib/db";
import { Eye, EyeOff, Save } from "lucide-react";

const T = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  up: "var(--color-surface-up)",
  border: "var(--color-border)",
  green: "var(--color-cta)",
  greenDim: "var(--color-surface-soft)",
  amber: "#B67A62", // Terracota
  amberDim: "rgba(182, 122, 98, 0.1)",
  red: "#EF4444",
  redDim: "rgba(239, 68, 68, 0.1)",
  cyan: "#3B82F6",
  cyanDim: "rgba(59, 130, 246, 0.1)",
  ink: "var(--color-text)",
  inkSec: "var(--color-text-sec)",
  inkTert: "var(--color-text-sec)",
  n8n: "var(--color-cta)",
  n8nDim: "var(--color-surface-soft)",
  borderSt: "var(--color-border)",
};

function TokenField({ label, hint, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:11, color:T.inkTert, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} style={{ width:"100%", padding:"10px 42px 10px 12px", borderRadius:10, background:T.bg, border:`1px solid ${T.border}`, color:T.ink, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
        <button onClick={() => setShow(s => !s)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:T.inkTert }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {hint && <div style={{ fontSize:11, color:T.inkTert }}>{hint}</div>}
    </div>
  );
}

function ClientTokenPanel({ client }) {
  const [tokens, setTokens] = useState({ openai_key:"", waba_token:"", waba_verify_token:"", phone_number_id:"", waba_id:"" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    Tokens.get(client.id).then(t => { if (t) setTokens(t); });
  }, [open, client.id]);

  const save = async () => {
    setSaving(true);
    try {
      await Tokens.update(client.id, tokens);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  return (
    <div style={{ background:T.surface, border:`1px solid ${open ? T.borderSt : T.border}`, borderRadius:14, overflow:"hidden", transition:"all 200ms" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:"100%", padding:"14px 18px", display:"flex", alignItems:"center", gap:12, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", textAlign:"left" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${client.color || T.cyan}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:client.color || T.cyan, flexShrink:0 }}>
          {client.avatar || client.name?.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:T.ink }}>{client.name}</div>
          <div style={{ fontSize:11, color:T.inkTert }}>{client.plan} · {client.email}</div>
        </div>
        <span style={{ fontSize:11, color: open ? T.cyan : T.inkTert }}>{open ? "▲ Fechar" : "▼ Configurar"}</span>
      </button>

      {open && (
        <div style={{ borderTop:`1px solid ${T.border}`, padding:20, display:"flex", flexDirection:"column", gap:14, animation:"fadeIn 150ms ease" }}>
          <TokenField label="OpenAI API Key" hint="Usada para GPT-4o e Whisper" value={tokens.openai_key} onChange={v => setTokens(p => ({ ...p, openai_key:v }))} />
          <TokenField label="WhatsApp Cloud API Token" hint="Token permanente do app Meta" value={tokens.waba_token} onChange={v => setTokens(p => ({ ...p, waba_token:v }))} />
          <TokenField label="Verify Token (Webhook)" hint="Token de verificação do webhook" value={tokens.waba_verify_token} onChange={v => setTokens(p => ({ ...p, waba_verify_token:v }))} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <TokenField label="Phone Number ID" value={tokens.phone_number_id} onChange={v => setTokens(p => ({ ...p, phone_number_id:v }))} />
            <TokenField label="WABA ID" value={tokens.waba_id} onChange={v => setTokens(p => ({ ...p, waba_id:v }))} />
          </div>
          <button onClick={save} disabled={saving} style={{ padding:"10px 18px", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", background: saved ? T.greenDim : T.green, color: saved ? T.green : "#000", border: saved ? `1px solid ${T.green}44` : "none", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
            <Save size={14} /> {saving ? "Salvando…" : saved ? "✅ Salvo!" : "Salvar Tokens"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TokensView({ clients }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, animation:"fadeIn 300ms ease" }}>
      <div>
        <h1 style={{ margin:"0 0 4px", fontSize:22, fontWeight:800, color:T.ink }}>🔑 Tokens / API</h1>
        <p style={{ margin:0, fontSize:13, color:T.inkTert }}>Configure as chaves de API por cliente. Os tokens são armazenados de forma segura.</p>
      </div>

      <div style={{ background:`${T.amber}10`, border:`1px solid ${T.amber}33`, borderRadius:12, padding:"12px 16px", fontSize:13, color:T.amber, display:"flex", gap:10 }}>
        ⚠️ <span>Mantenha os tokens sempre atualizados. Tokens inválidos interrompem o atendimento da IA.</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {clients.map(c => <ClientTokenPanel key={c.id} client={c} />)}
        {clients.length === 0 && (
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:32, textAlign:"center", color:T.inkTert }}>
            Nenhum cliente cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
