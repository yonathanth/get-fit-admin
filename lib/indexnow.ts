import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";

/** Public website address. Override with WEBSITE_URL if the domain changes. */
export const WEBSITE_URL = (process.env.WEBSITE_URL || "https://getfitgymandspa.com").replace(/\/$/, "");

const KEY_SETTING = "indexnow_key";

async function getKey(): Promise<string> {
  const existing = await prisma.gymSetting.findUnique({ where: { key: KEY_SETTING } });
  if (existing?.value) return existing.value;
  const key = randomBytes(16).toString("hex");
  await prisma.gymSetting.upsert({
    where: { key: KEY_SETTING },
    update: { value: key },
    create: { key: KEY_SETTING, value: key, description: "IndexNow key (served by the website at /indexnow-key.txt)" },
  });
  return key;
}

/**
 * Tell search engines that use IndexNow (Bing, Yandex, Seznam, Naver; Bing also
 * feeds DuckDuckGo and ChatGPT search) that these website pages are new,
 * changed or deleted, so they re-crawl them within minutes instead of days.
 * Google doesn't use IndexNow; it finds new pages through the sitemap.
 *
 * Never throws and never blocks the admin action: call it without awaiting.
 * Skipped outside production so local testing doesn't ping real search engines.
 */
export function notifySearchEngines(paths: string[]): void {
  if (process.env.NODE_ENV !== "production" || paths.length === 0) return;
  (async () => {
    try {
      const key = await getKey();
      const host = new URL(WEBSITE_URL).host;
      const urlList = [...new Set([...paths, "/sitemap.xml"])].map((p) => `${WEBSITE_URL}${p}`);
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host, key, keyLocation: `${WEBSITE_URL}/indexnow-key.txt`, urlList }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok && res.status !== 202) console.warn("IndexNow ping returned", res.status);
    } catch (err) {
      console.warn("IndexNow ping failed:", err instanceof Error ? err.message : err);
    }
  })();
}

/** URL slug from a title. Keeps Amharic letters, so Amharic titles don't produce an empty slug. */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9ሀ-፿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || `post-${Date.now().toString(36)}`;
}
