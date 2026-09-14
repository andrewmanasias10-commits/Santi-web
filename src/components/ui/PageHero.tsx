import type { ReactNode } from "react";
import { Container } from "@/components/ui/Section";
import { colorMap } from "@/lib/colors";
import type { BrandColor } from "@/lib/site";

/**
 * Encabezado de páginas internas. Cada página lleva UN color de tema (`color`)
 * aplicado al acento y a las cápsulas, para separar por tema/color.
 */
export function PageHero({
  title,
  subtitle,
  color = "pink",
  image,
  imageAlt = "",
  visual = true,
  flip = false,
  tinted = false,
  bgImage,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  color?: BrandColor;
  image?: string;
  imageAlt?: string;
  /** Muestra la columna visual (cápsulas o foto). Si es false, encabezado centrado. */
  visual?: boolean;
  /** Coloca la columna visual a la IZQUIERDA (para alternar entre páginas). */
  flip?: boolean;
  /** Fondo con el tinte de color de la página (en vez de blanco). */
  tinted?: boolean;
  /** Imagen de fondo (banner). Se muestra a lo ancho y respeta su proporción. */
  bgImage?: string;
  children?: ReactNode;
}) {
  const c = colorMap[color];
  const bg = tinted ? c.tint : "bg-white";

  // Hero con banner de fondo (respeta la proporción del banner en escritorio).
  if (bgImage) {
    return (
      <section
        className={`relative border-b border-line ${c.tint} bg-cover bg-bottom`}
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <Container className="py-12 text-center sm:py-16 lg:py-20">
          <h1 className="mx-auto max-w-3xl text-4xl text-ink sm:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {subtitle}
            </p>
          )}
          {children}
        </Container>
      </section>
    );
  }

  if (!visual) {
    return (
      <section className={`border-b border-line ${bg}`}>
        <Container className="py-12 text-center sm:py-16">
          <span className={`mx-auto block h-1.5 w-14 rounded-full ${c.bg}`} />
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl text-ink sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {subtitle}
            </p>
          )}
          {children}
        </Container>
      </section>
    );
  }

  return (
    <section className={`border-b border-line ${bg}`}>
      <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14">
        <div className={flip ? "lg:order-2" : undefined}>
          <span className={`block h-1.5 w-14 rounded-full ${c.bg}`} />
          <h1 className="mt-5 max-w-xl text-4xl text-ink sm:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              {subtitle}
            </p>
          )}
          {children}
        </div>

        {/* Columna visual (solo escritorio) */}
        <div className={flip ? "hidden lg:order-1 lg:block" : "hidden lg:block"}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={imageAlt}
              className="aspect-[4/3] w-full rounded-[2.5rem] border border-line object-cover shadow-soft"
            />
          ) : (
            <div className={`flex aspect-[4/3] w-full items-end justify-center gap-4 rounded-[2.5rem] p-10 ${c.tint}`}>
              {["h-40", "h-52", "h-32", "h-44"].map((h, i) => (
                <span key={i} className={`w-12 rounded-t-full ${c.bg} ${h}`} aria-hidden />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
