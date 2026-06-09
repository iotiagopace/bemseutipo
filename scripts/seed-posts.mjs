/**
 * Seed inicial: migra os posts de data/posts.json para o Turso
 * Uso: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/seed-posts.mjs
 */
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const postsJson = JSON.parse(readFileSync(join(__dir, "../data/posts.json"), "utf8"));

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:turso-cms.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function slugify(v) {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "item";
}

async function run() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS cms_entries (
      id TEXT PRIMARY KEY, section TEXT NOT NULL, title TEXT NOT NULL,
      slug TEXT, category TEXT, status TEXT NOT NULL DEFAULT 'draft',
      is_featured INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS cms_entries_section_idx ON cms_entries(section, display_order, created_at)`,
    `CREATE INDEX IF NOT EXISTS cms_entries_public_idx ON cms_entries(section, status, display_order, created_at)`,
    `CREATE TABLE IF NOT EXISTS cms_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS cms_leads (
      id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT,
      subject TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'new',
      data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS cms_leads_created_idx ON cms_leads(created_at DESC)`,
  ]);

  console.log("Schema OK. Seeding posts...");

  for (const [i, post] of postsJson.posts.entries()) {
    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date(post.date).toISOString();
    const item = {
      ...post,
      id,
      author: "BST Marketing",
      reading_time: post.readTime,
      excerpt: post.excerpt,
      content: JSON.stringify(post.content),
    };

    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO cms_entries
          (id, section, title, slug, category, status, is_featured, display_order, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, "blog", post.title,
          post.slug || slugify(post.title),
          post.category, "published",
          i === 0 ? 1 : 0, i,
          JSON.stringify(item), now, now,
        ],
      });
      console.log(`✓ ${post.title}`);
    } catch (e) {
      console.error(`✗ ${post.title}: ${e.message}`);
    }
  }

  // Seed FAQ entries from the hardcoded list
  const faqs = [
    { q: "Quanto tempo leva para ver resultado com tráfego pago?", a: "Os primeiros dados aparecem em 7 a 14 dias de campanha ativa. Resultados consistentes costumam se estabelecer entre 30 e 60 dias." },
    { q: "A BST atende empresas de fora de São José do Rio Preto?", a: "Sim. Temos clientes em todo o Brasil. O atendimento é 100% remoto — reuniões, relatórios e comunicação por videochamada e WhatsApp." },
    { q: "Qual é o investimento mínimo em mídia para começar?", a: "Recomendamos um mínimo de R$ 1.500/mês em mídia. A gestão BST é separada da verba. No diagnóstico, definimos o valor ideal." },
    { q: "Vou ter acesso às minhas próprias contas de anúncio?", a: "Sim, sempre. O gerenciador de anúncios, Business Manager, Analytics e Google Ads pertencem a você. A BST trabalha dentro das suas contas com acesso de gestor." },
    { q: "Como funciona a comunicação no dia a dia?", a: "Canal direto via WhatsApp. Relatório semanal toda segunda-feira. Reunião mensal com seu estrategista dedicado." },
    { q: "A BST cria os criativos para os anúncios?", a: "Sim. Roteiro, design e copy fazem parte da gestão de tráfego. Para Gestão de Conteúdo: Reels, artes para feed e stories inclusos." },
  ];

  for (const [i, faq] of faqs.entries()) {
    const id = `faq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const item = { id, title: faq.q, question: faq.q, answer: faq.a };
    await db.execute({
      sql: `INSERT OR IGNORE INTO cms_entries
        (id, section, title, slug, category, status, is_featured, display_order, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, "faq", faq.q, slugify(faq.q), "Geral", "published", 0, i, JSON.stringify(item), now, now],
    });
    console.log(`✓ FAQ: ${faq.q.slice(0, 50)}…`);
  }

  console.log("\nSeed concluído!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
