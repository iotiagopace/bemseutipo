import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { normalizeLead } from "../_lib/cms.js";
import { db, ensureSchema } from "../_lib/db.js";
import { body, cors, json } from "../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  await ensureSchema();

  if (req.method === "GET") {
    if (!requireAdmin(req, res)) return;
    const result = await db.execute("SELECT data FROM cms_leads ORDER BY created_at DESC");
    return json(res, 200, { data: result.rows.map((row) => JSON.parse(String(row.data))) });
  }

  if (req.method === "POST") {
    const lead = normalizeLead(body(req));
    await db.execute({
      sql: `INSERT INTO cms_leads
        (id, name, email, phone, subject, message, status, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        lead.id,
        lead.name,
        lead.email,
        lead.phone,
        lead.subject,
        lead.message,
        lead.status,
        JSON.stringify(lead),
        lead.created_at,
        lead.updated_at,
      ],
    });
    return json(res, 200, { success: true, lead_id: lead.id });
  }

  return json(res, 405, { error: "Metodo nao permitido" });
}
