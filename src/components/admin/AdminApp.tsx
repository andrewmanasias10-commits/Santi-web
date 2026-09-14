"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BLOG_BUCKET } from "@/lib/supabase/config";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { type Block, estimateReadMinutes } from "@/lib/blocks";

type PostForm = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  color: string;
  author: string;
  date: string;
  reading_minutes: number;
  cover: string;
  body: string;
  content: Block[];
  published: boolean;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyPost = (): PostForm => ({
  slug: "",
  title: "",
  excerpt: "",
  category: "",
  color: "pink",
  author: "Equipo SANTI",
  date: today(),
  reading_minutes: 3,
  cover: "",
  body: "",
  content: [],
  published: false,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-ink placeholder:text-ink-muted focus:border-pink focus-visible:outline-none";
const label = "mb-1 block text-sm font-bold text-ink";

export function AdminApp() {
  const router = useRouter();
  const supabase = createClient();
  const [posts, setPosts] = useState<PostForm[]>([]);
  const [editing, setEditing] = useState<PostForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("date", { ascending: false });
    setPosts((data as PostForm[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  async function uploadFile(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BLOG_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      setMsg(`Error al subir: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function save() {
    if (!editing) return;
    if (!editing.title.trim()) return setMsg("El título es obligatorio.");
    setSaving(true);
    setMsg(null);
    const payload = {
      ...editing,
      slug: editing.slug.trim() || slugify(editing.title),
      reading_minutes: editing.content.length
        ? estimateReadMinutes(editing.content)
        : Number(editing.reading_minutes) || 3,
    };
    const { error } = editing.id
      ? await supabase.from("posts").update(payload).eq("id", editing.id)
      : await supabase.from("posts").insert(payload);
    setSaving(false);
    if (error) return setMsg(`Error al guardar: ${error.message}`);
    setEditing(null);
    await load();
  }

  async function remove(id?: string) {
    if (!id || !confirm("¿Eliminar este post? Esta acción no se puede deshacer.")) return;
    await supabase.from("posts").delete().eq("id", id);
    await load();
  }

  // ---------------- Vista editor ----------------
  if (editing) {
    const e = editing;
    const set = (patch: Partial<PostForm>) => setEditing({ ...e, ...patch });
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl text-ink">{e.id ? "Editar post" : "Nuevo post"}</h1>
          <button onClick={() => setEditing(null)} className="text-sm font-semibold text-ink-soft hover:text-pink">
            ← Volver
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div>
            <label className={label}>Título</label>
            <input
              className={input}
              value={e.title}
              onChange={(ev) => set({ title: ev.target.value, slug: e.slug || slugify(ev.target.value) })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Slug (URL)</label>
              <input className={input} value={e.slug} onChange={(ev) => set({ slug: ev.target.value })} />
            </div>
            <div>
              <label className={label}>Categoría</label>
              <input className={input} value={e.category} onChange={(ev) => set({ category: ev.target.value })} placeholder="Neurodivergencia" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Color</label>
              <select className={input} value={e.color} onChange={(ev) => set({ color: ev.target.value })}>
                <option value="pink">Rosa</option>
                <option value="orange">Naranja</option>
                <option value="sky">Celeste</option>
                <option value="green">Verde</option>
              </select>
            </div>
            <div>
              <label className={label}>Fecha</label>
              <input type="date" className={input} value={e.date} onChange={(ev) => set({ date: ev.target.value })} />
            </div>
            <div>
              <label className={label}>Min. lectura</label>
              <input type="number" min={1} className={input} value={e.reading_minutes} onChange={(ev) => set({ reading_minutes: Number(ev.target.value) })} />
            </div>
          </div>
          <div>
            <label className={label}>Autor</label>
            <input className={input} value={e.author} onChange={(ev) => set({ author: ev.target.value })} />
          </div>
          <div>
            <label className={label}>Extracto (resumen corto)</label>
            <textarea className={`${input} resize-none`} rows={2} value={e.excerpt} onChange={(ev) => set({ excerpt: ev.target.value })} />
          </div>

          {/* Portada */}
          <div>
            <label className={label}>Imagen de portada</label>
            {e.cover && <img src={e.cover} alt="" className="mb-2 h-32 w-full rounded-xl object-cover" />}
            <input
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={async (ev) => {
                const f = ev.target.files?.[0];
                if (f) {
                  const url = await uploadFile(f);
                  if (url) set({ cover: url });
                }
              }}
            />
          </div>

          {/* Contenido por bloques */}
          <div>
            <label className={label}>Contenido</label>
            <BlockEditor value={e.content} onChange={(content) => set({ content })} upload={uploadFile} />
          </div>

          <label className="flex items-center gap-2 pt-2">
            <input type="checkbox" checked={e.published} onChange={(ev) => set({ published: ev.target.checked })} />
            <span className="font-semibold text-ink">Publicado (visible en la web)</span>
          </label>

          {msg && <p className="rounded-xl bg-pink-tint px-4 py-2.5 text-sm font-semibold text-pink">{msg}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="rounded-full bg-pink px-6 py-3 font-display font-bold text-white disabled:opacity-60">
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-full border-2 border-line px-6 py-3 font-display font-bold text-ink">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- Vista lista ----------------
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">Blog · Administración</h1>
        <div className="flex items-center gap-2">
          <Link href="/blog" target="_blank" className="rounded-full border-2 border-line px-4 py-2 text-sm font-bold text-ink">
            Ver blog
          </Link>
          <button onClick={() => setEditing(emptyPost())} className="rounded-full bg-pink px-5 py-2 text-sm font-bold text-white">
            + Nuevo post
          </button>
          <button onClick={logout} className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft hover:text-pink">
            Salir
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
        {loading ? (
          <p className="p-6 text-ink-soft">Cargando…</p>
        ) : posts.length === 0 ? (
          <p className="p-6 text-ink-soft">Aún no hay posts. Crea el primero con “Nuevo post”.</p>
        ) : (
          <ul className="divide-y divide-line">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{p.title || "(sin título)"}</p>
                  <p className="text-xs text-ink-muted">
                    {p.date} · {p.category || "sin categoría"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.published ? "bg-green-soft text-green" : "bg-line text-ink-muted"}`}>
                    {p.published ? "Publicado" : "Borrador"}
                  </span>
                  <button onClick={() => setEditing(p)} className="rounded-full border-2 border-line px-4 py-1.5 text-sm font-bold text-ink">
                    Editar
                  </button>
                  <button onClick={() => remove(p.id)} className="rounded-full px-3 py-1.5 text-sm font-bold text-pink">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

