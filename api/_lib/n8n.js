export async function createN8nWorkflow(workflowData) {
  const n8nUrl = process.env.N8N_API_URL;
  const n8nKey = process.env.N8N_API_KEY;

  if (!n8nUrl || !n8nKey) {
    throw new Error("Credenciais do n8n (N8N_API_URL, N8N_API_KEY) não estão configuradas no ambiente.");
  }

  const res = await fetch(`${n8nUrl}/api/v1/workflows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": n8nKey,
    },
    body: JSON.stringify(workflowData),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao criar workflow no n8n. Status: ${res.status} - ${err}`);
  }

  return await res.json();
}

export async function activateN8nWorkflow(workflowId) {
  const n8nUrl = process.env.N8N_API_URL;
  const n8nKey = process.env.N8N_API_KEY;

  const res = await fetch(`${n8nUrl}/api/v1/workflows/${workflowId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": n8nKey,
    },
    body: JSON.stringify({ active: true }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao ativar workflow no n8n. Status: ${res.status} - ${err}`);
  }

  return await res.json();
}
