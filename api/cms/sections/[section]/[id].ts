import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../../_lib/auth.js";
import { itemArgs, normalizeItem } from "../../_lib/cms.js";
import { db, ensureSchema } from "../../_lib/db.js";
import { body, cors, json } from "../../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  const section = String(req.query.section || "");
  const id = String(req.query.id || "");
  if (!section || !id) return json(res, 400, { error: "Section e ID obrigatorios" });

  await ensureSchema();

  if (req.method === "PUT") {
    const current = await db.execute({
      sql: "SELECT data, created_at FROM cms_entries WHERE section = ? AND id = ?",
      args: [section, id],
    });
    const previous = current.rows[0]
      ? JSON.parse(String(current.rows[0].data || "{}"))
      : {};
    const item = normalizeItem({ ...previous, ...body(req), created_at: current.rows[0]?.created_at }, section, id);

    await db.execute({
      sql: `INSERT INTO cms_entries
        (id, section, title, slug, category, status, is_featured, display_order, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          slug = excluded.slug,
          category = excluded.category,
          status = excluded.status,
          is_featured = excluded.is_featured,
          display_order = excluded.display_order,
          data = excluded.data,
          updated_at = excluded.updated_at`,
      args: itemArgs(section, item),
    });
    return json(res, 200, { data: item });
  }

  if (req.method === "DELETE") {
    await db.execute({ sql: "DELETE FROM cms_entries WHERE section = ? AND id = ?", args: [section, id] });
    return json(res, 200, { success: true });
  }

  return json(res, 405, { error: "Metodo nao permitido" });
}
