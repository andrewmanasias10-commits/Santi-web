"use client";

import { useEffect, useRef, useState } from "react";

type Slide = { id: string; url: string; caption: string };

/**
 * Slider de portada: muestra los banners completos (sin recortar), avanza solo
 * cada 4s y se puede navegar arrastrando con el mouse o deslizando con el dedo.
 * Sin flechas. Las imágenes están protegidas contra arrastre/descarga fácil.
 */
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (paused || n <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % n), 4000);
    return () => clearInterval(id);
  }, [paused, n]);

  if (n === 0) return null;

  const go = (d: number) => setI((p) => (p + d + n) % n);

  const onDown = (x: number) => {
    startX.current = x;
    dragging.current = true;
    setPaused(true);
  };
  const onUp = (x: number) => {
    if (startX.current !== null && dragging.current) {
      const dx = x - startX.current;
      if (dx <= -45) go(1);
      else if (dx >= 45) go(-1);
    }
    startX.current = null;
    dragging.current = false;
    setPaused(false);
  };

  return (
    <section
      className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden bg-white active:cursor-grabbing"
      aria-label="Portada"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        onUp(startX.current ?? 0);
        setPaused(false);
      }}
      onPointerDown={(e) => onDown(e.clientX)}
      onPointerUp={(e) => onUp(e.clientX)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Track deslizante: cada slide ocupa el 100% del ancho y su alto natural */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${i * 100}%)` }}
      >
        {slides.map((s) => (
          <div key={s.id} className="w-full shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.url}
              alt={s.caption || "SANTI"}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              className="pointer-events-none block h-auto w-full select-none"
            />
          </div>
        ))}
      </div>

      {n > 1 && (
        <div className="flex items-center justify-center gap-2.5 bg-white pb-2 pt-4">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Ir a la imagen ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                idx === i ? "w-6 bg-pink" : "w-2.5 bg-line hover:bg-ink-muted"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
