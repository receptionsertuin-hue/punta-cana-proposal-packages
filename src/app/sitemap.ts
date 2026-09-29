import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/constants";
import { STATIC_SITEMAP_PATHS, absoluteBlogUrl, getSitemapBlogEntries, getSitemapDynamicPaths } from "@/sanity/queries/SEO/sitemapUrls";
export const revalidate = 3600;
function normalizePath(path: string): string { if (path === "" || path === "/") return ""; return path.startsWith("/") ? path : `/${path}`; }
function absoluteEn(path: string): string { const p = normalizePath(path); return p === "" ? SITE_URL : `${SITE_URL}${p}`; }
function absoluteEs(path: string): string { const p = normalizePath(path); return p === "" ? `${SITE_URL}/es` : `${SITE_URL}/es${p}`; }
function changeFrequency(path: string): NonNullable<MetadataRoute.Sitemap[0]["changeFrequency"]> { return path.includes("/blog/") || path.includes("/stories/") ? "weekly" : "monthly"; }
function priority(path: string): number { const p = normalizePath(path); if (p === "") return 1; return p.split("/").filter(Boolean).length <= 1 ? 0.9 : 0.7; }
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dynamicPaths, blogEntries] = await Promise.all([getSitemapDynamicPaths(), getSitemapBlogEntries()]);
  const pathSet = new Set<string>([...STATIC_SITEMAP_PATHS, ...dynamicPaths]);
  const entries: MetadataRoute.Sitemap = []; const urlSeen = new Set<string>(); const now = new Date();
  for (const raw of pathSet) {
    const path = normalizePath(raw);
    // These legacy routes now permanently redirect to the consolidated catalog.
    if (/^\/(classic|modern|dining|adventure)-proposals(?:\/|$)/.test(path)) continue;
    for (const url of [absoluteEn(path), absoluteEs(path)]) {
      if (urlSeen.has(url)) continue; urlSeen.add(url);
      entries.push({ url, lastModified: now, changeFrequency: changeFrequency(path), priority: priority(path) });
    }
  }
  for (const row of blogEntries) {
    if (!row.slug || !row.language) continue;
    const url = absoluteBlogUrl(row.language, row.slug); if (urlSeen.has(url)) continue; urlSeen.add(url);
    const path = normalizePath(`/blog/${row.slug}`);
    entries.push({ url, lastModified: now, changeFrequency: changeFrequency(path), priority: priority(path) });
  }
  return entries;
}
