"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_BUCKET } from "@/lib/supabase/config";
import { toEmbedUrl } from "@/lib/video";
import { Trash2, Upload, Loader2, Check, Video, ImageIcon, Plus } from "lucide-react";

type Gallery = { id: string; url: string; caption: string };
type Member = { id: string; url: string; name: string; role: string };
type SB = ReturnType<typeof createClient>;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

async function uploadTo(sb: SB, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const name = `site-${uid()}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from(SITE_BUCKET).upload(name, file, {
    contentType: file.type,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) throw error;
  return sb.storage.from(SITE_BUCKET).getPublicUrl(name).data.publicUrl;
}

// ── Campo de video (link de YouTube) ──────────────────────────────────────────
function VideoField({
  sb,
  title,
  hint,
  keyName,
  initial,
}: {
  sb: SB;
  title: string;
  hint: string;
  keyName: string;
  initial: string;
}) {
  const [url, setUrl] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true);
    setErr("");
    const { error } = await sb
      .from("site_content")
      .upsert({ key: keyName, kind: "video", url: url.trim() || null, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) setErr(error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <Video size={18} className="text-pink" />
        <h3 className="font-bold text-ink">{title}</h3>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-pink"
        />
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-pink">{err}</p>}
      {url.trim() && (
        <div className="mt-4 aspect-video w-full max-w-md overflow-hidden rounded-xl border border-line">
          <iframe src={toEmbedUrl(url, "youtube")} title={title} className="h-full w-full" allowFullScreen />
        </div>
      )}
    </div>
  );
}

// ── Campo de foto simple (subir o link) ───────────────────────────────────────
function PhotoField({
  sb,
  title,
  hint,
  keyName,
  initial,
}: {
  sb: SB;
  title: string;
  hint: string;
  keyName: string;
  initial: string;
}) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function persist(next: string) {
    setBusy(true);
    setErr("");
    const { error } = await sb
      .from("site_content")
      .upsert({ key: keyName, kind: "image", url: next.trim() || null, updated_at: new Date().toISOString() });
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  }

  async function onFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setErr("Usa JPG, PNG, WebP o GIF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErr("Máx. 10 MB");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const link = await uploadTo(sb, file);
      setUrl(link);
      await persist(link);
    } catch (e) {
      setErr((e as Error).message || "Error al subir");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <ImageIcon size={18} className="text-pink" />
        <h3 className="font-bold text-ink">{title}</h3>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line bg-pink-tint">
          {url.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-pink">
              <ImageIcon size={28} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-60"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Subir foto
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="…o pega un link de imagen"
              className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-pink"
            />
            <button
              onClick={() => persist(url)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saved ? <Check size={15} /> : null}
              {saved ? "Guardado" : "Guardar"}
            </button>
          </div>
          {url.trim() && (
            <button onClick={() => { setUrl(""); persist(""); }} className="self-start text-sm font-semibold text-ink-muted hover:text-pink">
              Quitar foto
            </button>
          )}
          {err && <p className="text-sm text-pink">{err}</p>}
        </div>
      </div>
    </div>
  );
}

// ── Equipo · Nuestros profesionales ───────────────────────────────────────────
function TeamManager({ sb, initial }: { sb: SB; initial: Member[] }) {
  const [items, setItems] = useState<Member[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function addUrl(url: string) {
    const clean = url.trim();
    if (!clean) return;
    setErr("");
    const { data, error } = await sb
      .from("site_team")
      .insert({ url: clean, name: "", role: "", sort: items.length })
      .select("id,url,name,role")
      .single();
    if (error) { setErr(error.message); return; }
    if (data) setItems((p) => [...p, data as Member]);
  }

  async function onFiles(files: FileList) {
    setBusy(true);
    setErr("");
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) { setErr("Cada foto máx. 10 MB"); continue; }
        const link = await uploadTo(sb, file);
        await addUrl(link);
      }
    } catch (e) {
      setErr((e as Error).message || "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
    await sb.from("site_team").delete().eq("id", id);
  }

  async function saveField(id: string, field: "name" | "role", value: string) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
    await sb.from("site_team").update({ [field]: value }).eq("id", id);
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <ImageIcon size={18} className="text-sky" />
        <h3 className="font-bold text-ink">Nuestros profesionales (Quiénes somos)</h3>
      </div>
      <p className="mt-1 text-sm text-ink-muted">
        Sube la foto de cada profesional y escribe su nombre y cargo. Se muestran en la página “Quiénes somos”.
      </p>

      <div className="mt-4">
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Subir fotos del equipo
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-pink">{err}</p>}

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl bg-line/40 p-6 text-center text-sm text-ink-muted">
          Aún no hay profesionales cargados.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.id} className="flex gap-3 rounded-xl border border-line p-3">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={it.name} className="h-full w-full object-cover" />
                <button
                  onClick={() => remove(it.id)}
                  className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-pink shadow-soft hover:bg-white"
                  title="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-2">
                <input
                  defaultValue={it.name}
                  onBlur={(e) => saveField(it.id, "name", e.target.value)}
                  placeholder="Nombre"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm font-bold text-ink outline-none focus:border-sky"
                />
                <input
                  defaultValue={it.role}
                  onBlur={(e) => saveField(it.id, "role", e.target.value)}
                  placeholder="Cargo o especialidad (opcional)"
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink-soft outline-none focus:border-sky"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Galería del inicio ────────────────────────────────────────────────────────
function GalleryManager({
  sb,
  initial,
  section = "home",
  title = "Galería del inicio",
  hint = "Fotos de “nuestro espacio y lo que hacemos por los niños”. Se muestran en la página de inicio.",
}: {
  sb: SB;
  initial: Gallery[];
  section?: string;
  title?: string;
  hint?: string;
}) {
  const [items, setItems] = useState<Gallery[]>(initial);
  const [busy, setBusy] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function addUrl(url: string) {
    const clean = url.trim();
    if (!clean) return;
    setErr("");
    const sort = items.length;
    const { data, error } = await sb
      .from("site_gallery")
      .insert({ url: clean, caption: "", sort, section })
      .select("id,url,caption")
      .single();
    if (error) { setErr(error.message); return; }
    if (data) setItems((p) => [...p, data as Gallery]);
  }

  async function onFiles(files: FileList) {
    setBusy(true);
    setErr("");
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) { setErr("Cada foto máx. 10 MB"); continue; }
        const link = await uploadTo(sb, file);
        await addUrl(link);
      }
    } catch (e) {
      setErr((e as Error).message || "Error al subir");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id));
    await sb.from("site_gallery").delete().eq("id", id);
  }

  async function saveCaption(id: string, caption: string) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, caption } : x)));
    await sb.from("site_gallery").update({ caption }).eq("id", id);
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <ImageIcon size={18} className="text-green" />
        <h3 className="font-bold text-ink">{title}</h3>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{hint}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Subir fotos
        </button>
        <div className="flex flex-1 gap-2">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="…o pega un link de imagen"
            className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-green"
          />
          <button
            onClick={() => { addUrl(linkUrl); setLinkUrl(""); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-ink"
          >
            <Plus size={15} /> Agregar
          </button>
        </div>
      </div>
      {err && <p className="mt-2 text-sm text-pink">{err}</p>}

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl bg-line/40 p-6 text-center text-sm text-ink-muted">
          Aún no hay fotos en la galería.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((it) => (
            <div key={it.id} className="overflow-hidden rounded-xl border border-line">
              <div className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => remove(it.id)}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-pink shadow-soft hover:bg-white"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <input
                defaultValue={it.caption}
                onBlur={(e) => saveCaption(it.id, e.target.value)}
                placeholder="Descripción (opcional)"
                className="w-full border-t border-line px-3 py-2 text-xs outline-none focus:bg-green-tint"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteContentEditor({
  initialContent,
  initialHero,
  initialGallery,
  initialTeam,
  initialSocial,
}: {
  initialContent: Record<string, string>;
  initialHero: Gallery[];
  initialGallery: Gallery[];
  initialTeam: Member[];
  initialSocial: Gallery[];
}) {
  const sb = useMemo(() => createClient(), []);
  return (
    <div className="flex flex-col gap-6">
      <GalleryManager
        sb={sb}
        section="hero"
        initial={initialHero}
        title="Portada del inicio (slider)"
        hint="Banners que rotan en la parte superior del inicio. Se muestran COMPLETOS (sin recortar). Usa buena resolución (ancho ~1920 px) y la MISMA proporción en todos (p. ej. 1920×760) para que no salten de tamaño."
      />
      <VideoField
        sb={sb}
        title="Video de presentación (inicio)"
        hint="Sección “Conoce SANTI en un minuto”. Pega el link del video de YouTube."
        keyName="home_video"
        initial={initialContent.home_video || ""}
      />
      <VideoField
        sb={sb}
        title="Video “¿Quiénes somos?” (Quiénes somos)"
        hint="Video al costado del texto “¿Quiénes somos?”. Pega el link del video de YouTube."
        keyName="about_video"
        initial={initialContent.about_video || ""}
      />
      <VideoField
        sb={sb}
        title="Video de ABA (Quiénes somos)"
        hint="Sección “ABA en video”. Pega el link del video de YouTube."
        keyName="aba_video"
        initial={initialContent.aba_video || ""}
      />
      <TeamManager sb={sb} initial={initialTeam} />
      <PhotoField
        sb={sb}
        title="Foto “Sé parte de nosotros” (Quiénes somos)"
        hint="Foto de la sección de reclutamiento. Sube una imagen o pega un link."
        keyName="join_photo"
        initial={initialContent.join_photo || ""}
      />
      <GalleryManager sb={sb} initial={initialGallery} />
      <GalleryManager
        sb={sb}
        section="social"
        initial={initialSocial}
        title="Responsabilidad social (Quiénes somos)"
        hint="Fotos de tamizajes, capacitaciones, talleres y eventos comunitarios."
      />
    </div>
  );
}
