import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { TestimoniosSection } from "@/components/TestimoniosSection";
import { segments, getSegment, sampleTestimonials } from "@/lib/content";
import { getGallery } from "@/lib/media";
import { colorMap } from "@/lib/colors";

export const dynamic = "force-dynamic";

// Rutas antiguas → nuevos segmentos
const REDIRECTS: Record<string, string> = {
  adolescentes: "jovenes-adultos",
  adultos: "jovenes-adultos",
};

// Colores de las tarjetas en orden arcoíris (para dar vida y variedad, con orden).
const CARD_COLORS = ["pink", "orange", "sky", "green"] as const;

export function generateStaticParams() {
  return segments.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  props: PageProps<"/servicios/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const segment = getSegment(slug);
  if (!segment) return { title: "Servicio no encontrado" };
  return {
    title: segment.title,
    description: segment.summary,
    alternates: { canonical: `/servicios/${segment.slug}` },
  };
}

export default async function SegmentPage(props: PageProps<"/servicios/[slug]">) {
  const { slug } = await props.params;
  if (REDIRECTS[slug]) redirect(`/servicios/${REDIRECTS[slug]}`);

  const segment = getSegment(slug);
  if (!segment) notFound();

  const c = colorMap[segment.color];
  const other = segments.find((s) => s.slug !== segment.slug);
  const testimonios = await getGallery(`testimonios-${segment.slug}`);
  // Fondo ilustrado del hero según el segmento (celeste para jóvenes, crema para niños).
  const heroBg =
    segment.slug === "jovenes-adultos" ? "/servicios-jovenes-bg.jpg" : "/servicios-ninos-bg.jpg";

  return (
    <>
      <PageHero
        color={segment.color}
        visual={false}
        bgImage={heroBg}
        title={segment.title}
        subtitle={segment.intro}
      >
        <ButtonLink href="/contacto" variant={segment.color} className="mt-8">
          Reserva una consulta inicial
          <Icon name="arrow" className="h-5 w-5" />
        </ButtonLink>
      </PageHero>

      {/* Servicios agrupados (rejilla adaptable, sin espacios vacíos) */}
      <Section>
        <Container className="max-w-5xl">
          <div className="space-y-14">
            {segment.groups.map((group, gi) => {
              const n = group.items.length;
              // Rejilla con tarjetas de la misma altura.
              const cols = n === 1 ? "grid-cols-1" : n === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
              return (
                <div key={group.title}>
                  {/* Encabezado del grupo */}
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${c.bg} font-display text-base font-extrabold text-white`}>
                      {gi + 1}
                    </span>
                    <h2 className="text-2xl text-ink sm:text-3xl">{group.title}</h2>
                  </div>
                  {group.note && (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">{group.note}</p>
                  )}

                  {/* Tarjetas de los servicios (misma altura, color en orden arcoíris) */}
                  <div className={`mt-6 grid items-stretch gap-5 ${cols}`}>
                    {group.items.map((item, i) => {
                      const start = segment.groups
                        .slice(0, gi)
                        .reduce((a, g) => a + g.items.length, 0);
                      const cc = colorMap[CARD_COLORS[(start + i) % CARD_COLORS.length]];
                      const isWide = n === 1; // tarjeta a ancho completo → imagen al costado
                      const singleBefore = segment.groups
                        .slice(0, gi)
                        .filter((g) => g.items.length === 1).length;
                      const flip = isWide && singleBefore % 2 === 1; // alterna el lado
                      return (
                        <div
                          key={item.name}
                          className={`h-full overflow-hidden rounded-none border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${isWide ? "sm:flex sm:items-stretch" : "flex flex-col"}`}
                        >
                          {/* Cabecera ilustrada de color (arriba en tarjetas angostas, al costado en las anchas) */}
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className={
                                isWide
                                  ? `h-48 w-full object-cover sm:h-auto sm:w-72 sm:shrink-0 ${flip ? "sm:order-2" : ""}`
                                  : "aspect-[16/9] w-full object-cover"
                              }
                            />
                          ) : (
                            <div
                              className={`relative flex items-center justify-center overflow-hidden ${cc.tint} ${
                                isWide
                                  ? `h-40 sm:h-auto sm:w-72 sm:shrink-0 ${flip ? "sm:order-2" : ""}`
                                  : "h-28"
                              }`}
                            >
                              <span className={`absolute -right-5 -top-6 h-24 w-24 rounded-full ${cc.soft}`} />
                              <span className={`absolute -bottom-8 -left-4 h-20 w-20 rounded-full ${cc.soft}`} />
                              <span className={`relative grid place-items-center rounded-2xl ${cc.bg} text-white shadow-soft ${isWide ? "h-20 w-20" : "h-14 w-14"}`}>
                                <Icon name={item.icon} className={isWide ? "h-10 w-10" : "h-7 w-7"} />
                              </span>
                            </div>
                          )}

                          <div className={`p-6 ${isWide ? "sm:flex-1" : "flex-1"}`}>
                            <h3 className="text-lg font-bold leading-tight text-ink">{item.name}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
                            {item.note && (
                              <p className={`mt-3 border-l-2 pl-3 text-sm italic leading-relaxed ${cc.border} text-ink-soft`}>
                                {item.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Testimonios del segmento (siempre visible) */}
      <Section className={c.tint}>
        <Container>
          <SectionHeading
            title="Testimonios"
            subtitle="Momentos reales de las familias que acompañamos."
          />
          {testimonios.length > 0 && (
            <div className="mt-12">
              <GalleryCarousel items={testimonios} />
            </div>
          )}
          <TestimoniosSection
            segment={segment.slug}
            samples={sampleTestimonials[segment.slug] ?? []}
          />
        </Container>
      </Section>

      {/* CTA + otro segmento */}
      <Section className="bg-white">
        <Container className="max-w-4xl text-center">
          <h2 className="text-2xl text-ink sm:text-3xl">¿Damos el primer paso juntos?</h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-soft">
            Empieza con una consulta inicial y te orientamos sobre el mejor camino para ti o tu familia.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/contacto" variant={segment.color}>
              Reserva tu cita
              <Icon name="arrow" className="h-5 w-5" />
            </ButtonLink>
            {other && (
              <ButtonLink href={`/servicios/${other.slug}`} variant="outline">
                {other.title}
                <Icon name="arrow" className="h-5 w-5" />
              </ButtonLink>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
