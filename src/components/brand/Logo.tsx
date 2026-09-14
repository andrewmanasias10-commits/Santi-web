"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Logo oficial de SANTI (arcoíris pintado a mano + wordmark + slogan).
 * Coloca el archivo oficial en: public/logo-santi.png
 * Si el archivo no existe, se muestra un stand-in con la fuente y el arcoíris de marca.
 */
export function Logo({
  className,
  height = 48,
  horizontal = false,
}: {
  className?: string;
  height?: number;
  /** Usa el lockup horizontal (arcoíris + SANTI al lado). Ideal para la barra. */
  horizontal?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href="/"
      aria-label="SANTI — inicio"
      className={cn("inline-flex items-center", className)}
    >
      {failed ? (
        <span className="inline-flex items-center gap-2.5">
          <RainbowMark style={{ height: height * 0.72 }} className="w-auto" />
          <span className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tight text-ink">SANTI</span>
            <span className="font-alt text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Personas ayudando personas
            </span>
          </span>
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={horizontal ? "/logo-horizontal.png" : "/logo-santi.png"}
          alt="SANTI — Personas ayudando personas"
          style={{ height, width: "auto" }}
          className="select-none"
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}

/**
 * Arcoíris pintado a mano (motivo decorativo de marca).
 * Orden de colores del exterior al interior: rosa · naranja · celeste · verde.
 */
export function RainbowMark({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 64 44"
      className={className}
      style={style}
      role="img"
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
    >
      <path d="M6 40C6 21 18 8 32 8s26 13 26 32" stroke="#FF82AE" strokeWidth="6.5" />
      <path d="M14 40c0-13 8-23 18-23s18 10 18 23" stroke="#FFA600" strokeWidth="6" />
      <path d="M21.5 40c0-8 4.7-15 10.5-15s10.5 7 10.5 15" stroke="#3DC5FF" strokeWidth="5.5" />
      <path d="M28 40c0-3.5 1.8-7 4-7s4 3.5 4 7" stroke="#A4C21F" strokeWidth="5" />
    </svg>
  );
}
