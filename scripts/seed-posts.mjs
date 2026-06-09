/**
 * Seed completo: blog, faq, cases, metrics → Turso
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

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function insert(section, title, slug, category, status, order, data, date) {
  const id  = uid(section);
  const now = date ? new Date(date).toISOString() : new Date().toISOString();
  await db.execute({
    sql: `INSERT OR IGNORE INTO cms_entries
      (id,section,title,slug,category,status,is_featured,display_order,data,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, section, title, slug || slugify(title), category, status, order===0?1:0, order,
           JSON.stringify(data), now, now],
  });
  console.log(`✓ [${section}] ${title.slice(0,60)}`);
}

async function run() {
  /* Schema */
  await db.batch([
    `CREATE TABLE IF NOT EXISTS cms_entries (
      id TEXT PRIMARY KEY, section TEXT NOT NULL, title TEXT NOT NULL,
      slug TEXT, category TEXT, status TEXT NOT NULL DEFAULT 'draft',
      is_featured INTEGER NOT NULL DEFAULT 0, display_order INTEGER NOT NULL DEFAULT 0,
      data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS cms_entries_section_idx ON cms_entries(section, display_order, created_at)`,
    `CREATE INDEX IF NOT EXISTS cms_entries_public_idx  ON cms_entries(section, status, display_order, created_at)`,
    `CREATE TABLE IF NOT EXISTS cms_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS cms_leads (
      id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT,
      subject TEXT, message TEXT, status TEXT NOT NULL DEFAULT 'new',
      data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS cms_leads_created_idx ON cms_leads(created_at DESC)`,
  ]);
  console.log("Schema OK\n");

  /* ── BLOG ── */
  console.log("── BLOG ──");
  for (const [i, post] of postsJson.posts.entries()) {
    const data = {
      author: post.author || "BST Marketing",
      reading_time: post.readTime || "5 min",
      excerpt: post.excerpt || "",
      content: JSON.stringify(post.content || []),
    };
    await insert("blog", post.title, post.slug, post.category, "published", i, data, post.date);
  }

  /* ── FAQ ── */
  console.log("\n── FAQ ──");
  const faqs = [
    { q: "Quanto tempo leva para ver resultado com tráfego pago?",
      a: "Os primeiros dados aparecem em 7 a 14 dias de campanha ativa. Resultados consistentes — com volume e qualidade de lead — costumam se estabelecer entre 30 e 60 dias. Tráfego pago não é magia: é método, teste e otimização contínua." },
    { q: "A BST atende empresas de fora de São José do Rio Preto?",
      a: "Sim. Temos clientes em todo o Brasil. O atendimento é 100% remoto — reuniões, relatórios e comunicação por videochamada e WhatsApp. A localização não é uma barreira." },
    { q: "Qual é o investimento mínimo em mídia para começar?",
      a: "Recomendamos um mínimo de R$ 1.500/mês em mídia para que as plataformas tenham volume suficiente para aprender e otimizar. A gestão BST é separada da verba. No diagnóstico, definimos o valor ideal para o seu objetivo e mercado." },
    { q: "Vou ter acesso às minhas próprias contas de anúncio?",
      a: "Sim, sempre. O gerenciador de anúncios, o Business Manager, o Analytics e o Google Ads pertencem a você. A BST trabalha dentro das suas contas com acesso de gestor. Você pode visualizar tudo a qualquer momento." },
    { q: "Como funciona a comunicação no dia a dia?",
      a: "Canal direto via WhatsApp. Relatório semanal toda segunda-feira. Reunião mensal com o seu estrategista dedicado para revisar resultados e planejar o próximo ciclo." },
    { q: "A BST cria os criativos para os anúncios?",
      a: "Sim. Roteiro, design e copy fazem parte do nosso processo. Para Gestão de Conteúdo: Reels, artes para feed e stories inclusos no plano." },
  ];
  for (const [i, faq] of faqs.entries()) {
    await insert("faq", faq.q, null, "Geral", "published", i, { question: faq.q, answer: faq.a });
  }

  /* ── CASES ── */
  console.log("\n── CASES ──");
  const cases = [
    {
      title: "Yamaha Tag",
      category: "Automotivo",
      client: "Yamaha Tag",
      result: "62 motos vendidas em 48 horas",
      scenario: "Base grande de contatos antigos e frios, dependendo de novos interessados para vender.",
      strategy: "Campanha de 10 dias reativando a base com ofertas especiais e agendamento junto ao comercial.",
      bullets: "62 motos em apenas 48 horas\nReengajamento da base antiga\nAumento de fluxo na loja física",
    },
    {
      title: "Ipê Center Hotel",
      category: "Hotelaria",
      client: "Ipê Center Hotel",
      result: "80% de ocupação o ano todo",
      scenario: "Hotel dependendo de plataformas como Booking e sem receita alternativa consolidada.",
      strategy: "Domínio das buscas locais, reservas diretas com cashback e ativação do público local.",
      bullets: "~80% de ocupação constante\nCrescimento nas reservas diretas\nNova receita: eventos e restaurante",
    },
    {
      title: "Frigo Norte",
      category: "Alimentação",
      client: "Frigo Norte",
      result: "18x o valor investido em retorno",
      scenario: "Açougue 100% dependente do fluxo físico, sem previsibilidade e sem presença digital.",
      strategy: "Kits de carne, WhatsApp como canal de vendas, cardápio digital e campanhas locais.",
      bullets: "Início das vendas no digital\nVolume alto de contatos no WhatsApp\n18x o retorno sobre o investimento",
    },
    {
      title: "AcquaRio",
      category: "Alimentação",
      client: "AcquaRio",
      result: "De 0 a 400+ seguidores em 30 dias",
      scenario: "Negócio novo sem presença digital, sem audiência e sem estratégia de conteúdo.",
      strategy: "Conteúdo diário no Instagram, reels com produto em uso e campanhas de lançamento.",
      bullets: "0 a 400+ seguidores em 30 dias\nPrimeiros pedidos pelo Instagram\nPresença digital estabelecida",
    },
  ];
  for (const [i, c] of cases.entries()) {
    await insert("cases", c.title, null, c.category, "published", i,
      { client: c.client, result: c.result, scenario: c.scenario, strategy: c.strategy, bullets: c.bullets });
  }

  /* ── METRICS ── */
  console.log("\n── METRICS ──");
  const metrics = [
    { title: "Clientes ativos",           target: "13",  suffix: "+",     label: "Clientes ativos em carteira" },
    { title: "Retorno máximo",            target: "18",  suffix: "x",     label: "Retorno máximo sobre investimento" },
    { title: "Anos de experiência",       target: "3",   suffix: "+ anos", label: "De experiência no mercado" },
    { title: "Transparência",             target: "100", suffix: "%",     label: "Transparência com dashboard ao vivo" },
  ];
  for (const [i, m] of metrics.entries()) {
    await insert("metrics", m.title, null, "Destaque", "published", i,
      { target: m.target, suffix: m.suffix, label: m.label });
  }

  console.log("\n✅ Seed concluído!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
