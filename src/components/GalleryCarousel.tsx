"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Item = { id: string; url: string; caption: string };

/**
 * Galería horizontal: corre sola (se pausa al interactuar), se puede arrastrar
 * con el dedo o mover con flechas, y al hacer clic la foto se expande (lightbox).
 * `fit="contain"` muestra la imagen completa (ideal para certificados/retratos).
 */
export function GalleryCarousel({
  items,
  fit = "cover",
  size = "md",
  bordered = true,
  interval = 3200,
}: {
  items: Item[];
  fit?: "cover" | "contain";
  size?: "md" | "lg";
  /** Muestra borde y sombra alrededor de cada foto (marco). */
  bordered?: boolean;
  /** Milisegundos entre cada avance automático. */
  interval?: number;
}) {
  const sizeCls = size === "lg" ? "w-[22rem] sm:w-[30rem]" : "w-64 sm:w-72";
  const imgHCls = size === "lg" ? "h-80 sm:h-[30rem]" : "h-48 sm:h-52";
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const rafRef = useRef<number | null>(null);

  // Animación de desplazamiento manual (funciona en todos los móviles, incl. iOS).
  const smoothScrollTo = useCallback((target: number) => {
    const el = ref.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = el.scrollLeft;
    const dist = target - start;
    const dur = 450;
    let t0: number | null = null;
    const stepFn = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.scrollLeft = start + dist * ease;
      if (p < 1) rafRef.current = requestAnimationFrame(stepFn);
    };
    rafRef.current = requestAnimationFrame(stepFn);
  }, []);

  const scroll = useCallback(
    (dir: number) => {
      const el = ref.current;
      if (!el) return;
      const card = el.querySelector("figure");
      const step = card ? (card as HTMLElement).offsetWidth + 16 : el.clientWidth * 0.85;
      smoothScrollTo(el.scrollLeft + dir * step);
    },
    [smoothScrollTo],
  );

  // ── Auto-desplazamiento ──
  useEffect(() => {
    if (paused || open !== null || items.length <= 1) return;
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const card = el.querySelector("figure");
      const step = card ? (card as HTMLElement).offsetWidth + 16 : 300;
      const target = el.scrollLeft >= max - 4 ? 0 : Math.min(el.scrollLeft + step, max);
      smoothScrollTo(target);
    }, interval);
    return () => {
      clearInterval(id);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, open, items.length, interval, smoothScrollTo]);

  // ── Lightbox: teclado + bloqueo de scroll ──
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      else if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, items.length]);

  return (
    <>
      <div
        className="relative w-full min-w-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 1200)}
        onTouchCancel={() => setTimeout(() => setPaused(false), 1200)}
      >
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Fotos anteriores"
          className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-line bg-white p-2.5 text-ink shadow-card transition-colors hover:bg-pink hover:text-white sm:grid"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={ref}
          className="no-scrollbar flex snap-x snap-proximity gap-4 overflow-x-auto pb-1"
        >
          {items.map((it, i) => (
            <figure
              key={it.id}
              onClick={() => setOpen(i)}
              className={`group relative ${sizeCls} shrink-0 cursor-pointer snap-start overflow-hidden rounded-none ${
                bordered ? "border border-line shadow-soft" : ""
              } ${fit === "contain" ? "bg-white" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.url}
                alt={it.caption || "Foto de SANTI"}
                className={`${imgHCls} w-full transition-transform duration-500 group-hover:scale-105 ${
                  fit === "contain" ? "object-contain p-2" : "object-cover"
                }`}
              />
              {it.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {it.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Más fotos"
          className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-line bg-white p-2.5 text-ink shadow-card transition-colors hover:bg-pink hover:text-white sm:grid"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Lightbox ── */}
      {open !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
          >
            <X size={22} />
          </button>

          {items.length > 1 && (
            <button
              type="button"
              aria-label="Anterior"
              onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length)); }}
              className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 sm:left-6"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={items[open].url}
              alt={items[open].caption || "Foto de SANTI"}
              className="mx-auto max-h-[80vh] w-auto rounded-none object-contain shadow-card"
            />
            {items[open].caption && (
              <figcaption className="mt-4 text-center text-sm font-semibold text-white/90">
                {items[open].caption}
              </figcaption>
            )}
          </figure>

          {items.length > 1 && (
            <button
              type="button"
              aria-label="Siguiente"
              onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i + 1) % items.length)); }}
              className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30 sm:right-6"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
