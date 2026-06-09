import type { VercelRequest, VercelResponse } from "@vercel/node";

export function cors(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

export function json(res: VercelResponse, status: number, body: unknown) {
  return res.status(status).json(body);
}

export function body<T>(req: VercelRequest): T {
  if (typeof req.body === "string") return JSON.parse(req.body) as T;
  return (req.body ?? {}) as T;
}

export function now() {
  return new Date().toISOString();
}
