import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json } from "./http.js";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.TURSO_AUTH_TOKEN || "dev-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createToken(email: string) {
  const payload = Buffer.from(JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  })).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !equal(signature, sign(payload))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      exp?: number;
    };
    if (!data.email || !data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const session = token ? verifyToken(token) : null;
  if (!session) {
    json(res, 401, { error: "Sessao invalida ou expirada" });
    return null;
  }
  return session;
}

export function validCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Configure ADMIN_EMAIL e ADMIN_PASSWORD no ambiente");
  }
  return email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword;
}
