import type { InArgs } from "@libsql/client";
import { now } from "./http.js";

export type CmsItem = Record<string, unknown> & {
  id?: string;
  title?: string;
  slug?: string;
  category?: string;
  status?: string;
  is_featured?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
};

export function createId(prefix = "item") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeItem(input: CmsItem, section: string, id = input.id) {
  const stamp = now();
  const item = {
    ...input,
    id: String(id || createId(section)),
    title: String(input.title || ""),
    slug: input.slug ? String(input.slug) : slugify(String(input.title || "")),
    category: input.category ? String(input.category) : "",
    status: input.status ? String(input.status) : "draft",
    is_featured: Boolean(input.is_featured),
    display_order: Number(input.display_order || 0),
    updated_at: stamp,
  };

  if (!item.created_at) item.created_at = stamp;
  return item;
}

export function itemArgs(section: string, item: ReturnType<typeof normalizeItem>): InArgs {
  return [
    item.id,
    section,
    item.title,
    item.slug || "",
    item.category || "",
    item.status,
    item.is_featured ? 1 : 0,
    item.display_order,
    JSON.stringify(item),
    item.created_at || "",
    item.updated_at || "",
  ];
}

export function rowToItem(row: Record<string, unknown>) {
  const data = JSON.parse(String(row.data || "{}")) as CmsItem;
  return {
    ...data,
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    status: row.status,
    is_featured: Boolean(row.is_featured),
    display_order: Number(row.display_order || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "item";
}

export function normalizeLead(input: Record<string, unknown>) {
  const stamp = now();
  const name = String(input.name || input.nome || "");
  const message = String(input.message || input.mensagem || input.desafio || "");
  const lead = {
    ...input,
    id: String(input.id || createId("lead")),
    name,
    email: String(input.email || ""),
    phone: String(input.phone || input.telefone || ""),
    subject: String(input.subject || input.assunto || input.servico || "Contato"),
    message,
    status: String(input.status || "new"),
    created_at: String(input.created_at || input.submitted_at || stamp),
    updated_at: stamp,
  };
  return lead;
}
