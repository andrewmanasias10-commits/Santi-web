"use client";

import { useEffect, useState } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { colorMap } from "@/lib/colors";
import type { BrandColor } from "@/lib/site";

type Testimonio = {
  id?: string;
  name: string;
  role?: string | null;
  rating: number;
  quote: string;
};

const CYCLE: BrandColor[] = ["pink", "orange", "sky", "green"];

/** Estrellas de solo lectura. */
function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`${className} ${i <= value ? "text-orange" : "text-line"}`}
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 2.2l2.85 6.06 6.65.6-5 4.4 1.5 6.54L12 16.9l-5.99 3.9 1.5-6.54-5-4.4 6.65-.6z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimoniosSection({
  segment,
  samples,
}: {
  segment: string;
  samples: { name: string; role: string; quote: string }[];
}) {
  const seed: Testimonio[] = samples.map((s) => ({ ...s, rating: 5 }));
  const [items, setItems] = useState<Testimonio[]>(seed);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [quote, setQuote] = useState("");
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [error, setError] = useState("");

  // Carga los testimonios publicados por otras personas.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = createPublicClient();
    sb.from("testimonios_publicos")
      .select("id,name,role,rating,quote")
      .eq("segment", segment)
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length) setItems([...(data as Testimonio[]), ...seed]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  // Abre el formulario automáticamente si la URL trae ?comentar=1 (o #comentar).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("comentar") === "1" || window.location.hash === "#comentar") {
      setOpen(true);
    }
  }, []);

  // Bloquea el scroll del fondo mientras el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !quote.trim() || rating < 1) {
      setError("Escribe tu nombre, tu comentario y elige una calificación.");
      return;
    }
    setSending(true);
    const nuevo: Testimonio = {
      name: name.trim(),
      role: role.trim() || null,
      rating,
      quote: quote.trim(),
    };

    if (isSupabaseConfigured) {
      const sb = createPublicClient();
      const { error: err } = await sb
        .from("testimonios_publicos")
        .insert({ segment, ...nuevo });
      if (err) {
        setError("No se pudo enviar. Intenta de nuevo en un momento.");
        setSending(false);
        return;
      }
    } else {
      // Sin base de datos: se muestra localmente solo en esta sesión.
      setItems((prev) => [nuevo, ...prev]);
    }

    setName("");
    setRole("");
    setRating(0);
    setQuote("");
    setSending(false);
    setOpen(false);
    setThanks(true);
    setTimeout(() => setThanks(false), 6000);
  }

  return (
    <div>
      {/* Carrusel de tarjetas (se mueve solo, se pausa al pasar el mouse) */}
      <div className="marquee-mask mt-12">
        <div
          className="marquee-track"
          style={{ gap: "1.5rem", alignItems: "stretch", animationDuration: "50s" }}
        >
          {(items.length > 0 ? [...items, ...items] : []).map((t, i) => {
            const tc = colorMap[CYCLE[i % CYCLE.length]];
            return (
              <figure
                key={`${t.id ?? t.name}-${i}`}
                aria-hidden={i >= items.length}
                className="flex w-[20rem] shrink-0 flex-col rounded-none border border-line bg-white p-6 shadow-soft"
              >
              <div className="flex items-center justify-between">
                <span className={`font-display text-5xl leading-none ${tc.text}`} aria-hidden>
                  &ldquo;
                </span>
                <Stars value={t.rating} />
              </div>
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tc.bg} font-display text-sm font-bold text-white`}
                >
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span>
                  <span className="block font-bold text-ink">{t.name}</span>
                  {t.role && <span className="block text-xs text-ink-muted">{t.role}</span>}
                </span>
              </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      {/* CTA + formulario */}
      <div className="mt-10 text-center">
        {thanks && (
          <p className="mb-4 font-display font-bold text-green">
            ¡Gracias por tu comentario! 💚 Lo revisaremos y se publicará pronto.
          </p>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-7 py-3.5 font-display font-bold text-white shadow-soft transition-transform hover:scale-105"
        >
          Deja tu comentario
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-white p-6 text-left shadow-card sm:p-8"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-lg text-ink-muted transition-colors hover:bg-line/50"
            >
              ✕
            </button>
            <h3 className="text-center text-xl font-bold text-ink">Cuéntanos tu experiencia</h3>

            {/* Estrellas */}
            <div className="mt-5 flex flex-col items-center">
              <span className="text-sm font-semibold text-ink-soft">Tu calificación</span>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-9 w-9 ${
                        i <= (hover || rating) ? "text-orange" : "text-line"
                      }`}
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M12 2.2l2.85 6.06 6.65.6-5 4.4 1.5 6.54L12 16.9l-5.99 3.9 1.5-6.54-5-4.4 6.65-.6z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-pink"
              />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                maxLength={60}
                placeholder="Ej.: Mamá de Mateo · 28 años (opcional)"
                className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-pink"
              />
            </div>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Comparte tu experiencia en SANTI…"
              className="mt-4 w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-pink"
            />

            {error && <p className="mt-3 text-sm font-semibold text-pink">{error}</p>}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-full bg-pink px-7 py-3 font-display font-bold text-white shadow-soft transition-transform hover:scale-105 disabled:opacity-60"
              >
                {sending ? "Enviando…" : "Publicar comentario"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-line px-7 py-3 font-display font-bold text-ink-soft transition-colors hover:bg-line/40"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
