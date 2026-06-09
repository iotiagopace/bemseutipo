import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createToken, validCredentials } from "../_lib/auth.js";
import { body, cors, json } from "../_lib/http.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (cors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "Metodo nao permitido" });

  try {
    const input = body<{ email?: string; password?: string }>(req);
    if (!input.email || !input.password) {
      return json(res, 400, { error: "Email e senha sao obrigatorios" });
    }
    if (!validCredentials(input.email, input.password)) {
      return json(res, 401, { error: "Email ou senha incorretos" });
    }
    return json(res, 200, { access_token: createToken(input.email), user: { email: input.email } });
  } catch (err) {
    return json(res, 500, { error: err instanceof Error ? err.message : "Erro ao fazer login" });
  }
}
