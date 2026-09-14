import { isSupabaseConfigured } from "./supabase/config";
import { createPublicClient } from "./supabase/public";

/** Claves de contenido editable del sitio. */
export type SiteContentKey =
  | "home_video"
  | "about_video"
  | "aba_video"
  | "team_photo"
  | "join_photo";

export type GalleryItem = { id: string; url: string; caption: string };

export type TeamMember = { id: string; url: string; name: string; role: string };

/** Devuelve un mapa { clave: url } con el contenido editable del sitio. */
export async function getSiteContent(): Promise<Partial<Record<SiteContentKey, string>>> {
  if (!isSupabaseConfigured) return {};
  const sb = createPublicClient();
  const { data } = await sb.from("site_content").select("key,url");
  const map: Partial<Record<SiteContentKey, string>> = {};
  (data ?? []).forEach((r: { key: string; url: string | null }) => {
    if (r.url) map[r.key as SiteContentKey] = r.url;
  });
  return map;
}

/** Fotos de una galería por sección: 'home' | 'testimonios' | 'social'. */
export async function getGallery(section = "home"): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured) return [];
  const sb = createPublicClient();
  const { data } = await sb
    .from("site_gallery")
    .select("id,url,caption")
    .eq("section", section)
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []).map((r: { id: string; url: string; caption: string | null }) => ({
    id: r.id,
    url: r.url,
    caption: r.caption ?? "",
  }));
}

/** Miembros del equipo ("Nuestros profesionales"), ordenados. */
export async function getTeam(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured) return [];
  const sb = createPublicClient();
  const { data } = await sb
    .from("site_team")
    .select("id,url,name,role")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []).map((r: { id: string; url: string; name: string | null; role: string | null }) => ({
    id: r.id,
    url: r.url,
    name: r.name ?? "",
    role: r.role ?? "",
  }));
}
