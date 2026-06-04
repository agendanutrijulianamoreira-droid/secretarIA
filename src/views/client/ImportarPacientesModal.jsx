import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { Pacientes } from "../../lib/db";
import { Btn, Card } from "../../pages/ClientPortal";
import { IMPORT_FIELDS, parseCSV, autoMap, buildRows } from "./importarUtils";

export function ImportarPacientesModal({ clientId, onClose }) {
  const [csv,     setCSV]     = useState(null);
  const [mapping, setMapping] = useState({});
  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(null);
  const fileRef = useRef(null);

  const load = text => {
    const parsed = parseCSV(text);
    setCSV(parsed);
    setMapping(autoMap(parsed.headers));
    setError("");
  };

  const onFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => load(ev.target.result);
    reader.readAsText(file, "UTF-8");
  };

  const fetchURL = async () => {
    setLoading(true); setError("");
    try {
      const m = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!m) throw new Error("URL inválida. Cole o link do Google Sheets.");
      const gid = url.match(/gid=(\d+)/)?.[1] ?? "0";
      const csvUrl = `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`;
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error("Planilha inacessível. Certifique-se que está publicada: Arquivo → Compartilhar → Publicar na web.");
      load(await res.text());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const doImport = async () => {
    setLoading(true); setError("");
    try {
      const rows = buildRows(csv.data, mapping);
      await Pacientes.bulkCreate(clientId, rows);
      setDone(rows.length);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const rows = csv ? buildRows(csv.data, mapping) : [];
  const inputCls = "flex-1 w-full px-5 py-4 bg-surface-up/20 border border-border-subtle rounded-2xl text-main placeholder:text-tertiary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm";
  const selectCls = "w-full px-4 py-3 bg-surface-up/20 border border-border-subtle rounded-xl text-sm text-main focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer";

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[300] flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl animate-fade-in p-0 overflow-hidden shadow-2xl border-primary/20">
        <div className="px-10 py-8 border-b border-border-subtle flex items-center justify-between bg-surface-up/30">
          <div>
            <h4 className="text-xl font-black text-main tracking-tighter uppercase">Importar via Google Sheets</h4>
            <p className="text-[10px] text-tertiary font-black uppercase tracking-[0.2em] mt-1.5">Importe toda a base de clientes de uma só vez.</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-surface-up flex items-center justify-center text-tertiary hover:text-main transition-all cursor-pointer"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
          {done !== null ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 size={64} className="mx-auto text-emerald-500" />
              <p className="text-2xl font-black text-main">{done} clientes importados!</p>
              <p className="text-sm text-tertiary">Dados já disponíveis na base de clientes.</p>
              <Btn onClick={onClose} className="mt-4">Fechar</Btn>
            </div>
          ) : !csv ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">Link do Google Sheets</label>
                <div className="flex gap-3">
                  <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && url.trim() && fetchURL()} placeholder="https://docs.google.com/spreadsheets/d/..." className={inputCls} />
                  <Btn onClick={fetchURL} disabled={!url.trim() || loading}>{loading ? "Buscando…" : "Carregar"}</Btn>
                </div>
                <p className="text-[10px] text-tertiary opacity-70">Planilha deve ser publicada: <strong>Arquivo → Compartilhar → Publicar na Web → Formato CSV</strong></p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border-subtle" />
                <span className="text-[10px] font-black text-tertiary uppercase tracking-widest">ou</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <button onClick={() => fileRef.current?.click()} className="w-full py-10 rounded-[24px] border-2 border-dashed border-border-subtle hover:border-primary/50 flex flex-col items-center gap-4 text-tertiary hover:text-primary transition-all cursor-pointer group">
                <Upload size={36} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest">Carregar arquivo CSV / TSV</p>
                  <p className="text-[10px] mt-1 opacity-60">No Sheets: Arquivo → Fazer download → CSV</p>
                </div>
              </button>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={onFile} />
              {error && <p className="flex items-center gap-2 text-sm text-red-400"><AlertTriangle size={16} />{error}</p>}
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-sm text-secondary"><strong>{csv.data.length}</strong> linhas encontradas. Mapeie as colunas:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(IMPORT_FIELDS).map(([field, label]) => (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">{label}</label>
                    <select value={mapping[field] || ""} onChange={e => setMapping(m => ({ ...m, [field]: e.target.value || undefined }))} className={selectCls}>
                      <option value="">— não importar —</option>
                      {csv.headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {rows.length > 0 ? (
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-sm font-black text-emerald-400">{rows.length} registros válidos (com nome e telefone)</p>
                  {rows.length < csv.data.length && <p className="text-[10px] text-tertiary mt-1">{csv.data.length - rows.length} linhas ignoradas por falta de nome ou telefone</p>}
                </div>
              ) : (
                <p className="text-sm text-amber-400">Nenhum registro válido. Certifique-se de mapear Nome e Telefone.</p>
              )}
              {error && <p className="flex items-center gap-2 text-sm text-red-400"><AlertTriangle size={16} />{error}</p>}
              <div className="flex gap-4">
                <button onClick={() => { setCSV(null); setError(""); }} className="px-6 py-3 rounded-2xl bg-surface-up border border-border-subtle text-secondary font-black text-[10px] uppercase tracking-[0.3em] hover:bg-surface transition-all cursor-pointer">Voltar</button>
                <Btn disabled={rows.length === 0 || loading} onClick={doImport} className="flex-1" icon={FileSpreadsheet}>
                  {loading ? "Importando…" : `Importar ${rows.length} clientes`}
                </Btn>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
