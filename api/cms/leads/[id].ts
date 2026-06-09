import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { db, ensureSchema } from "../_lib/db.js";
import { body, cors, json, now } from "../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (req.method !== "PATCH" && req.method !== "PUT") return json(res, 405, { error: "Metodo nao permitido" });

  const id = String(req.query.id || "");
  const input = body<Record<string, unknown>>(req);
  await ensureSchema();

  const current = await db.execute({ sql: "SELECT data FROM cms_leads WHERE id = ?", args: [id] });
  if (!current.rows[0]) return json(res, 404, { error: "Lead nao encontrado" });

  const lead = {
    ...JSON.parse(String(current.rows[0].data)),
    ...input,
    updated_at: now(),
  };

  await db.execute({
    sql: `UPDATE cms_leads SET status = ?, data = ?, updated_at = ? WHERE id = ?`,
    args: [String(lead.status || "new"), JSON.stringify(lead), lead.updated_at, id],
  });

  return json(res, 200, { data: lead });
}
