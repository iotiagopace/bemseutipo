import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db, ensureSchema } from "../../_lib/db.js";
import { cors, json } from "../../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== "GET") return json(res, 405, { error: "Metodo nao permitido" });

  const key = String(req.query.key || "");
  await ensureSchema();
  const result = await db.execute({ sql: "SELECT value FROM cms_settings WHERE key = ?", args: [key] });
  return json(res, 200, { data: result.rows[0] ? JSON.parse(String(result.rows[0].value)) : null });
}
