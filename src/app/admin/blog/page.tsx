import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Eye, Pencil, Globe, FileEdit, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/posts";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog · Administración",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="text-2xl text-ink">Panel aún no configurado</h1>
        <p className="mt-3 text-ink-soft">
          Falta conectar Supabase y correr <code className="rounded bg-line px-1.5 py-0.5">supabase/blog.sql</code>.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, category, is_published, read_time, created_at, updated_at")
    .order("created_at", { ascending: false });

  const list = data ?? [];
  const published = list.filter((p) => p.is_published).length;
  const drafts = list.length - published;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl text-ink">Blog · Administración</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {published} publicados · {drafts} borradores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/contenido" className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink">
            <ImageIcon size={15} /> Contenido del sitio
          </Link>
          <Link href="/admin/blog/new" className="inline-flex items-center gap-1.5 rounded-full bg-pink px-5 py-2 text-sm font-bold text-white">
            <Plus size={15} strokeWidth={2.5} /> Nuevo post
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
        {list.length === 0 ? (
          <p className="p-8 text-center text-ink-soft">
            Aún no hay posts. Crea el primero con “Nuevo post”.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((post) => (
              <li key={post.id} className="flex items-center gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-tint text-sky">
                  {post.is_published ? <Globe size={16} /> : <FileEdit size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-bold text-ink">{post.title || "(sin título)"}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${post.is_published ? "bg-green-soft text-green" : "bg-line text-ink-muted"}`}>
                      {post.is_published ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {post.category} · {post.read_time} min · {formatDate(post.updated_at || post.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {post.is_published && (
                    <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-bold text-ink">
                      <Eye size={13} /> Ver
                    </Link>
                  )}
                  <Link href={`/admin/blog/${post.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-pink px-3 py-1.5 text-sm font-bold text-white">
                    <Pencil size={13} /> Editar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
