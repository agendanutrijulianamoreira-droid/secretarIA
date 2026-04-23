import { db } from "./_lib/firebase.js";
import { handleCors } from "./_lib/cors.js";
import { createN8nWorkflow, activateN8nWorkflow } from "./_lib/n8n.js";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { clientId, adminEmail } = req.body;
    // Autenticação simples baseada no e-mail do admin no payload (Na vida real, verificar Token)
    if (adminEmail !== "agendanutrijulianamoreira@gmail.com") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 1. Pegar dados do cliente
    const clientDoc = await db.collection("clients").doc(clientId).get();
    if (!clientDoc.exists) return res.status(404).json({ error: "Client not found" });
    const client = clientDoc.data();

    if (client.n8n_status === "online") {
      return res.status(400).json({ error: "Workflow already provisioned" });
    }

    // 2. Carregar o Workflow Mestre localmente
    const templatePath = path.resolve(process.cwd(), "../n8n/workflow_principal.json");
    let masterWorkflowStr;
    try {
      masterWorkflowStr = fs.readFileSync(templatePath, "utf-8");
    } catch(e) {
      // Tentar caminho alternativo
      const altPath = path.resolve(process.cwd(), "n8n/workflow_principal.json");
      masterWorkflowStr = fs.readFileSync(altPath, "utf-8");
    }
    
    let workflowData = JSON.parse(masterWorkflowStr);

    // 3. Modificações Padrão dos Agentes de IA
    // 3A. Atualizar nome do Workflow
    workflowData.name = `SaaS - ${client.name} (${clientId})`;
    
    // 3B. Procurar o Node de Webhook para alterar o Endpoint e evitar conflito
    const webhookNode = workflowData.nodes.find(n => n.name === "Webhook EVO" || n.type === "n8n-nodes-base.webhook");
    if (webhookNode) {
      webhookNode.parameters.path = `asaas-${clientId}`;
    }

    // 3C. Injetar o Prompt compilado do Briefing no Node de IA (se existir)
    // Exemplo: O nó pode se chamar "AI Chat Model" ou algo parecido
    const briefing = client.briefing || {};
    const compiledPrompt = `
      Você é ${briefing.ai_name || "um assistente virtual"} da empresa ${client.name}.
      Seu tom é ${briefing.ai_tone || "profissional"}.
      Segmento: ${briefing.segment || "Geral"}.
      Serviços: ${briefing.services ? briefing.services.join(", ") : "Gerais"}.
      Regras: ${briefing.restrictions || "Nenhuma regra específica"}.
    `;

    // Vamos varrer os nodes procurando campos de texto que costumem guardar o prompt do n8n Advanced AI
    for (const node of workflowData.nodes) {
      if (node.parameters && node.parameters.systemMessage) {
        node.parameters.systemMessage = compiledPrompt;
      } else if (node.parameters && node.parameters.prompt) {
        node.parameters.prompt = compiledPrompt;
      }
    }

    // 4. Criar Workflow no n8n via API
    const newWf = await createN8nWorkflow(workflowData);

    // 5. Ativar Workflow no n8n via API
    if (newWf && newWf.id) {
      await activateN8nWorkflow(newWf.id);
    }

    // 6. Salvar ID do n8n e atualizar status
    await db.collection("clients").doc(clientId).update({
      n8n_id: newWf?.id || null,
      n8n_status: "online",
      n8n_webhook: webhookNode ? `${process.env.N8N_API_URL}/webhook/asaas-${clientId}` : "",
      updated_at: new Date().toISOString()
    });

    return res.status(200).json({ success: true, n8n_id: newWf?.id });
  } catch (error) {
    console.error("Provisioning Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
