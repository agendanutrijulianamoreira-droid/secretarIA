import { handleCors, sendError } from "../../_lib/cors.js";
import { requireAdminOrOwner } from "../../_lib/auth.js";
import { db } from "../../_lib/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID do cliente é obrigatório" });
  }

  try {
    const user = await requireAdminOrOwner(req, id);
    const briefingRef = db
      .collection("clients")
      .doc(id)
      .collection("briefing")
      .doc("data");

    // ── GET: Obter briefing ───────────────────────────────
    if (req.method === "GET") {
      const doc = await briefingRef.get();

      if (!doc.exists) {
        return res.status(200).json({
          segment: "",
          description: "",
          site: "",
          instagram: "",
          ai_name: "",
          ai_tone: "",
          ai_goal: "",
          business_hours: "",
          escalation_trigger: "",
          escalation_number: "",
          services: [],
          faqs: [],
          restrictions: "",
          promotions: "",
        });
      }

      return res.status(200).json(doc.data());
    }

    // ── PUT: Atualizar briefing ───────────────────────────
    if (req.method === "PUT") {
      const {
        segment,
        description,
        site,
        instagram,
        ai_name,
        ai_tone,
        ai_goal,
        business_hours,
        escalation_trigger,
        escalation_number,
        services,
        faqs,
        restrictions,
        promotions,
      } = req.body;

      const briefingData = {
        segment: segment ?? "",
        description: description ?? "",
        site: site ?? "",
        instagram: instagram ?? "",
        ai_name: ai_name ?? "",
        ai_tone: ai_tone ?? "",
        ai_goal: ai_goal ?? "",
        business_hours: business_hours ?? "",
        escalation_trigger: escalation_trigger ?? "",
        escalation_number: escalation_number ?? "",
        services: services ?? [],
        faqs: faqs ?? [],
        restrictions: restrictions ?? "",
        promotions: promotions ?? "",
        updated_at: FieldValue.serverTimestamp(),
      };

      await briefingRef.set(briefingData, { merge: true });

      // Atualizar updated_at do cliente também
      await db
        .collection("clients")
        .doc(id)
        .update({ updated_at: FieldValue.serverTimestamp() });

      return res.status(200).json({
        message: "Briefing atualizado com sucesso",
        ...briefingData,
      });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    sendError(res, err);
  }
}
