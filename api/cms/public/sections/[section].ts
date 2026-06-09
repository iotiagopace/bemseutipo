import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rowToItem } from "../../_lib/cms.js";
import { db, ensureSchema } from "../../_lib/db.js";
import { cors, json } from "../../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "Metodo nao permitido" });

  const section = String(req.query.section || "");
  const status = String(req.query.status || "published");
  await ensureSchema();
  const result = await db.execute({
    sql: "SELECT * FROM cms_entries WHERE section = ? AND status = ? ORDER BY display_order ASC, created_at DESC",
    args: [section, status],
  });
  return json(res, 200, { data: result.rows.map(rowToItem) });
}
