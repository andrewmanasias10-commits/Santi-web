import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Contenedor de ancho máximo consistente. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/** Sección vertical con espaciado generoso. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-11 sm:py-16", className)}>
      {children}
    </section>
  );
}

/** Encabezado de sección con título y bajada. */
export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <h2 className="text-3xl text-ink sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{subtitle}</p>
      )}
    </div>
  );
}
