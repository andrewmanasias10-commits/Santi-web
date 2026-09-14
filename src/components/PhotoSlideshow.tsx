"use client";

import { useEffect, useState } from "react";

/** Muestra una foto y va cambiando sola cada 4 segundos (fundido). */
export function PhotoSlideshow({ images, alt = "" }: { images: string[]; alt?: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % images.length), 4000);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative h-full min-h-[340px] w-full">
      {images.map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            idx === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
