import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { segments } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const now = new Date();

  const paths = [
    "",
    "/acerca",
    "/servicios",
    "/metodo-aba",
    "/blog",
    "/contacto",
    "/historia",
    "/libro-de-reclamaciones",
    "/terminos",
    "/privacidad",
  ];

  const entries: MetadataRoute.Sitemap = paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  for (const s of segments) {
    entries.push({
      url: `${base}/servicios/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  try {
    const posts = await getBlogPosts();
    for (const post of posts) {
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Sin base de datos: solo rutas estáticas.
  }

  return entries;
}
