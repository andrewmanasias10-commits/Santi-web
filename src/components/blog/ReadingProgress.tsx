"use client";

import { useEffect } from "react";

/** Barra de progreso de lectura en el borde superior. */
export function ReadingProgress() {
  useEffect(() => {
    const bar = document.getElementById("bp-progress");
    const content = document.getElementById("post-content");
    if (!bar || !content) return;

    const onScroll = () => {
      const rect = content.getBoundingClientRect();
      const total = content.offsetHeight || 1;
      const scrolled = -rect.top + window.innerHeight;
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
      bar.style.width = pct + "%";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
