import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { body, cors, json } from "./_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Metodo nao permitido" });

  const input = body<{ dataUrl?: string }>(req);
  if (!input.dataUrl?.startsWith("data:")) {
    return json(res, 400, { error: "Envie uma imagem em dataUrl" });
  }

  // Turso guarda dados relacionais. Para manter o template autonomo,
  // a versao inicial preserva imagens como data URLs no proprio registro.
  return json(res, 200, { url: input.dataUrl });
}
