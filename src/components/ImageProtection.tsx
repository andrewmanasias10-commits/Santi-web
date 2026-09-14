"use client";

import { useEffect } from "react";

/**
 * Dificulta guardar/arrastrar imágenes en todo el sitio: bloquea el clic derecho
 * sobre imágenes y el arrastre. (No es infalible —nada lo es en la web— pero
 * evita el guardado casual con clic derecho o arrastrar-soltar.)
 */
export function ImageProtection() {
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "IMG" || t.closest("picture"))) e.preventDefault();
    };
    const onDrag = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === "IMG") e.preventDefault();
    };
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
    };
  }, []);

  return null;
}
