import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { normalizeItem, itemArgs, rowToItem } from "../_lib/cms.js";
import { db, ensureSchema } from "../_lib/db.js";
import { body, cors, json } from "../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  const section = String(req.query.section || "");
  if (!section) return json(res, 400, { error: "Section obrigatoria" });

  await ensureSchema();

  if (req.method === "GET") {
    const result = await db.execute({
      sql: "SELECT * FROM cms_entries WHERE section = ? ORDER BY display_order ASC, created_at DESC",
      args: [section],
    });
    return json(res, 200, { data: result.rows.map(rowToItem) });
  }

  if (req.method === "POST") {
    const item = normalizeItem(body(req), section);
    if (!item.title) return json(res, 400, { error: "Titulo obrigatorio" });

    await db.execute({
      sql: `INSERT INTO cms_entries
        (id, section, title, slug, category, status, is_featured, display_order, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: itemArgs(section, item),
    });
    return json(res, 200, { data: item });
  }

  return json(res, 405, { error: "Metodo nao permitido" });
}
