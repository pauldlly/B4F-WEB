import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";


async function loadLocalEnv() {
  try {
    const raw = await readFile(resolve(".env"), "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separator = trimmed.indexOf("=");

      if (separator < 1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Le build peut aussi recevoir les variables depuis l'hébergeur.
  }
}

await loadLocalEnv();

const siteUrl = (
  process.env.VITE_PUBLIC_SITE_URL ||
  "https://tickets.b4fevents.com"
).replace(/\/$/, "");

const supabaseUrl =
  process.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const key =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const staticRoutes = [
  "/",
  "/events",
  "/packs",
  "/experience",
  "/barcelona",
  "/barcelona/adresses",
  "/barcelona/tips",
  "/barcelona/transport",
  "/barcelona/securite",
  "/aide",
  "/rejoindre",
  "/about",
  "/cgv",
  "/confidentialite",
  "/mentions-legales",
  "/cookies",
  "/remboursements"
];

async function fetchRows(table, columns) {
  if (!supabaseUrl || !key) return [];

  const url = new URL(
    `${supabaseUrl}/rest/v1/${table}`
  );

  url.searchParams.set("select", columns);
  url.searchParams.set("status", "eq.active");

  try {
    const response = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const [events, packs] = await Promise.all([
  fetchRows(
    "Event",
    "id,event_date"
  ),
  fetchRows(
    "Pack",
    "id"
  )
]);

const today = new Date().toISOString().slice(0, 10);

const dynamicRoutes = [
  ...events
    .filter(
      (event) =>
        !event.event_date ||
        event.event_date >= today
    )
    .map((event) => ({
      path: `/event/${event.id}`,
      lastmod: event.event_date || undefined
    })),
  ...packs.map((pack) => ({
    path: `/pack/${pack.id}`
  }))
];

const urls = [
  ...staticRoutes.map((path) => ({ path })),
  ...dynamicRoutes
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ path, lastmod }) => `  <url>
    <loc>${siteUrl}${path}</loc>${
      lastmod
        ? `\n    <lastmod>${String(lastmod).slice(
            0,
            10
          )}</lastmod>`
        : ""
    }
    <changefreq>${
      path.startsWith("/event/") ||
      path.startsWith("/pack/")
        ? "daily"
        : "weekly"
    }</changefreq>
    <priority>${
      path === "/"
        ? "1.0"
        : path.startsWith("/event/") ||
            path.startsWith("/pack/")
          ? "0.9"
          : "0.7"
    }</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(
  resolve("public/sitemap.xml"),
  xml,
  "utf8"
);

console.log(
  `Sitemap généré : ${urls.length} URL(s).`
);
