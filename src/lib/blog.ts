import { isSupabaseConfigured } from "./supabase/config";
import { createPublicClient } from "./supabase/public";
import { brandColors, type BrandColor } from "./site";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover?: string;
  coverEmoji: string;
  coverBg: string;
  author: string;
  authorInitials: string;
  readingMinutes: number;
  date: string;
  color: BrandColor;
  content: unknown;
};

/** Color de marca estable por post (para la portada de la tarjeta). */
function colorFor(slug: string): BrandColor {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i)) % 997;
  return brandColors[h % brandColors.length];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPost(r: any): BlogPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    category: r.category ?? "",
    cover: r.cover_url ?? undefined,
    coverEmoji: r.cover_emoji ?? "📝",
    coverBg: r.cover_bg ?? "#FFE4B3",
    author: r.author_name ?? "Equipo SANTI",
    authorInitials: r.author_initials ?? "ES",
    readingMinutes: r.read_time ?? 5,
    date: r.published_at ?? r.created_at,
    color: (r.color as BrandColor) || colorFor(r.slug ?? ""),
    content: r.content ?? [],
  };
}

const SELECT =
  "id,slug,title,excerpt,category,color,cover_url,cover_emoji,cover_bg,author_name,author_initials,read_time,created_at,published_at,content";

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  return (data ?? []).map(rowToPost);
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  if (!isSupabaseConfigured) return undefined;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ? rowToPost(data) : undefined;
}

export async function getBlogSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
