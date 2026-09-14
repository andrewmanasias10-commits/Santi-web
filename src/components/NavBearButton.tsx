"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Botón del osito en la barra de navegación. Muestra una imagen estática y,
 * al pasar el puntero (o tocar), reproduce la animación (GIF) con el mismo encuadre.
 */
export function NavBearButton({ className = "h-11" }: { className?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <Link
      href="/historia"
      aria-label="Nuestra historia SANTI"
      className="flex items-center px-2 transition-transform hover:scale-110"
      onMouseEnter={() => setPlaying(true)}
      onMouseLeave={() => setPlaying(false)}
      onTouchStart={() => setPlaying(true)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={playing ? "/nav-boton.gif" : "/nav-boton.png"}
        alt=""
        draggable={false}
        className={`${className} w-auto rounded-md`}
      />
    </Link>
  );
}
