import { firebaseAuth } from "./firebase.js";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * Faz uma requisição autenticada para a API.
 * Automaticamente adiciona o token Firebase no header.
 */
async function request(path, options = {}) {
  const { method = "GET", body, headers: extraHeaders = {} } = options;

  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  // Adicionar token se o usuário estiver logado
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || "Erro na requisição");
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────
export const api = {
  // Health check
  health: () => request(""),

  // Auth
  auth: {
    me: () => request("/auth/me"),
    login: (email, password) =>
      request("/auth/login", { method: "POST", body: { email, password } }),
  },

  // Clientes
  clients: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/clients${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/clients/${id}`),
    create: (data) =>
      request("/clients", { method: "POST", body: data }),
    update: (id, data) =>
      request(`/clients/${id}`, { method: "PUT", body: data }),
    delete: (id) =>
      request(`/clients/${id}`, { method: "DELETE" }),
  },

  // Briefing
  briefing: {
    get: (clientId) => request(`/clients/${clientId}/briefing`),
    update: (clientId, data) =>
      request(`/clients/${clientId}/briefing`, { method: "PUT", body: data }),
  },

  // Faturas
  invoices: {
    list: (clientId) => request(`/clients/${clientId}/invoices`),
    create: (clientId, data) =>
      request(`/clients/${clientId}/invoices`, {
        method: "POST",
        body: data,
      }),
  },

  // Mensagens
  messages: {
    list: (clientId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/clients/${clientId}/messages${qs ? `?${qs}` : ""}`);
    },
    send: (clientId, text) =>
      request(`/clients/${clientId}/messages`, {
        method: "POST",
        body: { text },
      }),
  },
};
