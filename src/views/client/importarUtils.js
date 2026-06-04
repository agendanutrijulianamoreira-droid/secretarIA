export const IMPORT_FIELDS = {
  nome:            "Nome *",
  telefone:        "Telefone / WhatsApp *",
  email:           "E-mail",
  data_nascimento: "Nascimento",
  observacoes:     "Observações",
  tags:            "Tags",
};

const AUTO_KEYS = {
  nome:            ["nome", "name", "cliente", "paciente"],
  telefone:        ["telefone", "celular", "whatsapp", "fone", "phone", "tel"],
  email:           ["email", "e-mail", "mail"],
  data_nascimento: ["nascimento", "nasc", "birthday", "aniversario"],
  observacoes:     ["obs", "observa", "nota", "notes", "comment"],
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
      observacoes:     (row[mapping.observacoes]     || "").trim(),
      tags: mapping.tags && row[mapping.tags]
        ? row[mapping.tags].split(",").map(t => t.trim()).filter(Boolean)
        : [],
    }))
    .filter(r => r.nome && r.telefone);
}
