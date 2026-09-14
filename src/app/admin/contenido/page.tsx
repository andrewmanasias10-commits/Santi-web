import Link from "next/link";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";
import { TestimoniosAdmin } from "@/components/admin/TestimoniosAdmin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contenido del sitio · Administración",
  robots: { index: false, follow: false },
};

export default async function AdminContentPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="text-2xl text-ink">Panel aún no configurado</h1>
        <p className="mt-3 text-ink-soft">
          Falta conectar Supabase y correr{" "}
          <code className="rounded bg-line px-1.5 py-0.5">supabase/site.sql</code>.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: content }, { data: gallery }, { data: team }] = await Promise.all([
    supabase.from("site_content").select("key,url"),
    supabase.from("site_gallery").select("id,url,caption,section").order("sort", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("site_team").select("id,url,name,role").order("sort", { ascending: true }).order("created_at", { ascending: true }),
  ]);

  const contentMap: Record<string, string> = {};
  (content ?? []).forEach((r: { key: string; url: string | null }) => {
    if (r.url) contentMap[r.key] = r.url;
  });
  type GRow = { id: string; url: string; caption: string | null; section: string | null };
  const bySection = (s: string) =>
    (gallery ?? [])
      .filter((r: GRow) => (r.section ?? "home") === s)
      .map((r: GRow) => ({ id: r.id, url: r.url, caption: r.caption ?? "" }));
  const heroList = bySection("hero");
  const galleryList = bySection("home");
  const socialList = bySection("social");
  const teamList = (team ?? []).map((r: { id: string; url: string; name: string | null; role: string | null }) => ({
    id: r.id,
    url: r.url,
    name: r.name ?? "",
    role: r.role ?? "",
  }));

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl text-ink">Contenido del sitio</h1>
          <p className="mt-1 text-sm text-ink-muted">Videos, fotos y galería del inicio.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink"
          >
            <FileText size={15} /> Blog
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8">
        <SiteContentEditor
          initialContent={contentMap}
          initialHero={heroList}
          initialGallery={galleryList}
          initialTeam={teamList}
          initialSocial={socialList}
        />
      </div>

      <div className="mt-10">
        <TestimoniosAdmin />
      </div>
    </div>
  );
}
