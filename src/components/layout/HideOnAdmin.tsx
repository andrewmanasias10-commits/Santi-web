"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Oculta su contenido en las rutas del panel de administración (/admin). */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
