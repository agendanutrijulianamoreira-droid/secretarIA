export const IMPORT_FIELDS = {
  nome:            "Nome *",
  telefone:        "Telefone / WhatsApp *",
  email:           "E-mail",
  data_nascimento: "Data de Nascimento",
  tags:            "Tags",
};

const AUTO_KEYS = {
  nome:            ["nome", "name", "cliente", "paciente"],
  telefone:        ["telefone", "celular", "whatsapp", "fone", "phone", "tel"],
  email:           ["email", "e-mail", "mail"],
  data_nascimento: ["nascimento", "nasc", "birthday", "aniversario"],
  tags:            ["tag", "categ", "label", "grupo", "tipo"],
};

export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n").filter(Boolean);
  if (!lines.length) return { headers: [], data: [] };
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const strip = s => s.trim().replace(/^"|"$/g, "");
  const headers = lines[0].split(sep).map(strip);
  const data = lines.slice(1).map(l => {
    const vals = l.split(sep).map(strip);
    return headers.reduce((o, h, i) => ({ ...o, [h]: vals[i] ?? "" }), {});
  });
  return { headers, data };
}

export function autoMap(headers) {
  const norm = h => h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const m = {};
  for (const [field, keys] of Object.entries(AUTO_KEYS)) {
    const h = headers.find(hdr => keys.some(k => norm(hdr).includes(k)));
    if (h) m[field] = h;
  }
  return m;
}

export function buildRows(data, mapping) {
  return data
    .map(row => ({
      nome:            (row[mapping.nome]            || "").trim(),
      telefone:        (row[mapping.telefone]        || "").trim(),
      email:           (row[mapping.email]           || "").trim(),
      data_nascimento: (row[mapping.data_nascimento] || "").trim(),
      tags: mapping.tags && row[mapping.tags]
        ? row[mapping.tags].split(",").map(t => t.trim()).filter(Boolean)
        : [],
    }))
    .filter(r => r.nome && r.telefone);
}

const normPhone = p => (p || "").replace(/\D/g, "");
const normName  = n => (n || "").toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function deduplicateRows(rows, existing) {
  const phones = new Set(existing.map(p => normPhone(p.telefone)));
  const names  = new Set(existing.map(p => normName(p.nome)));
  const toImport = [], skipped = [];
  for (const row of rows) {
    const phone = normPhone(row.telefone);
    const name  = normName(row.nome);
    if (phones.has(phone))     { skipped.push({ row, reason: `Telefone já cadastrado (${row.telefone})` }); }
    else if (names.has(name))  { skipped.push({ row, reason: "Nome já cadastrado" }); }
    else { toImport.push(row); phones.add(phone); names.add(name); }
  }
  return { toImport, skipped };
}

function triggerDownload(content, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

const CSV_HEADERS = ["Nome", "Telefone", "Email", "Data de Nascimento", "Tags"];
const esc = v => `"${(v || "").replace(/"/g, '""')}"`;
const toCSV = (headers, rows) => [headers.map(esc), ...rows.map(r => headers.map(h => esc(r[h])))].map(r => r.join(",")).join("\n");

export function downloadTemplate() {
  const examples = [
    { Nome: "Maria Silva", Telefone: "+55 11 99999-0001", Email: "maria@email.com", "Data de Nascimento": "15/03/1990", Tags: "VIP, retorno" },
    { Nome: "João Santos", Telefone: "+55 11 99999-0002", Email: "", "Data de Nascimento": "", Tags: "ativo" },
  ];
  triggerDownload(toCSV(CSV_HEADERS, examples), "modelo-importacao.csv");
}

export function exportPacientes(pacientes) {
  const rows = pacientes.map(p => ({
    Nome: p.nome, Telefone: p.telefone, Email: p.email || "",
    "Data de Nascimento": p.data_nascimento || "",
    Tags: (p.tags || []).join(", "),
  }));
  triggerDownload(toCSV(CSV_HEADERS, rows), "clientes.csv");
}
