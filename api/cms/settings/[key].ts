import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { db, ensureSchema } from "../_lib/db.js";
import { body, cors, json, now } from "../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  const key = String(req.query.key || "");
  if (!key) return json(res, 400, { error: "Key obrigatoria" });

  await ensureSchema();

  if (req.method === "GET") {
    const result = await db.execute({ sql: "SELECT value FROM cms_settings WHERE key = ?", args: [key] });
    return json(res, 200, { data: result.rows[0] ? JSON.parse(String(result.rows[0].value)) : null });
  }

  if (req.method === "PUT" || req.method === "POST") {
    const input = body<{ value?: unknown }>(req);
    const value = input.value ?? input;
    await db.execute({
      sql: `INSERT INTO cms_settings (key, value, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      args: [key, JSON.stringify(value), now()],
    });
    return json(res, 200, { data: value });
  }

  return json(res, 405, { error: "Metodo nao permitido" });
}
