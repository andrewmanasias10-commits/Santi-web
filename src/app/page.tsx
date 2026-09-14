import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { ServiceCard } from "@/components/ServiceCard";
import { PostCard } from "@/components/PostCard";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PhotoSlideshow } from "@/components/PhotoSlideshow";
import { segments, valueProps, heroCards } from "@/lib/content";
import { getBlogPosts } from "@/lib/blog";
import { getSiteContent, getGallery } from "@/lib/media";
import { colorMap } from "@/lib/colors";
import { site } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Fotos del apartado Misión y visión (rotan solas). */
const misionFotos = [
  "/mision/foto1.jpg",
  "/mision/foto2.jpg",
  "/mision/foto3.jpg",
  "/mision/foto4.jpg",
  "/mision/foto5.jpg",
];

/** Universidades e instituciones con convenio. */
const convenios = [
  { name: "U. Nacional Mayor de San Marcos", logo: "/convenios/sanmarcos.png" },
  { name: "Pontificia U. Católica del Perú", logo: "/convenios/pucp.png" },
  { name: "Universidad de Lima", logo: "/convenios/ulima.png" },
  { name: "U. Antonio Ruiz de Montoya", logo: "/convenios/uarm.png" },
  { name: "Universidad Ricardo Palma", logo: "/convenios/ricardopalma.png" },
  { name: "UNIFÉ · U. Femenina del Sagrado Corazón", logo: "/convenios/unife.png" },
  { name: "Universidad Privada del Norte", logo: "/convenios/upn.png" },
];

export default async function HomePage() {
  const [posts, media, gallery, heroSlides] = await Promise.all([
    getBlogPosts().then((p) => p.slice(0, 3)),
    getSiteContent(),
    getGallery(),
    getGallery("hero"),
  ]);
  const hasSlides = heroSlides.length > 0;
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative">
        <h1 className="sr-only">
          Neuropsicología y Terapias SANTI para niños, adolescentes y adultos en Lima.
        </h1>
        {hasSlides ? (
          <HeroCarousel slides={heroSlides} />
        ) : (
          // Respaldo: imagen grande (public/hero.jpg) con degradado de marca
          <div className="hero-photo relative min-h-[360px] sm:min-h-[460px] lg:min-h-[560px]">
            <div className="hero-overlay absolute inset-0" />
          </div>
        )}
      </section>

      {/* ===================== VIDEO DE PRESENTACIÓN ===================== */}
      <Section className="bg-white !pt-10 !pb-14 sm:!pt-16 sm:!pb-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
            <Reveal>
              <VideoEmbed url={media.home_video} color="sky" label="Video de presentación" className="!rounded-none" />
            </Reveal>
            <Reveal delay={120}>
              <h2 className="text-3xl text-ink sm:text-4xl">
                Conoce SANTI <span className="text-orange">en un minuto</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                Te mostramos cómo acompañamos a cada familia: nuestro espacio, nuestro
                equipo y la forma en que trabajamos el desarrollo día a día.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                ¿Tienes preguntas? Escríbenos y con gusto te contamos más.
              </p>
              <ButtonLink href="/contacto" variant="orange" className="mt-7">
                Reserva tu cita
                <Icon name="arrow" className="h-5 w-5" />
              </ButtonLink>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== MISIÓN Y VISIÓN ===================== */}
      <Section className="relative overflow-hidden bg-orange-tint !pb-10 sm:!pb-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:gap-8">
            {/* Fotos reales (rotan solas cada 4s) */}
            <Reveal className="overflow-hidden rounded-none border border-line shadow-card lg:order-2">
              <PhotoSlideshow images={misionFotos} alt="Momentos de SANTI" />
            </Reveal>

            {/* Misión + Visión */}
            <div className="grid gap-6 lg:order-1">
            {/* Misión */}
            <Reveal className="group relative overflow-hidden rounded-none border border-line bg-white p-8 text-center shadow-card transition-transform duration-300 hover:-translate-y-1.5 sm:p-10">
              <span className="absolute inset-x-0 top-0 h-2 bg-pink" />
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-soft opacity-50" />
              <span className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-pink-soft opacity-40" />
              <div className="relative">
                <h3 className="font-alt text-2xl font-extrabold uppercase tracking-[0.12em] text-pink sm:text-3xl">
                  Nuestro propósito
                </h3>
                <p className="mt-5 leading-relaxed text-ink-soft">
                  Nuestra misión es{" "}
                  <strong className="text-ink">ayudar a cada niño en el mundo</strong>. Lo lograremos
                  al proveer intervenciones efectivas y accesibles a niños regulares, neurodiversos o
                  con dificultades de aprendizaje, conducta y lenguaje, mediante el Análisis
                  Conductual Aplicado (ABA), mejorando su adaptación dentro de la familia, el colegio
                  y su círculo social.
                </p>
              </div>
            </Reveal>

            {/* Visión */}
            <Reveal delay={120} className="group relative overflow-hidden rounded-none border border-line bg-white p-8 text-center shadow-card transition-transform duration-300 hover:-translate-y-1.5 sm:p-11">
              <span className="absolute inset-x-0 top-0 h-2 bg-orange" />
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-soft opacity-50" />
              <span className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-orange-soft opacity-40" />
              <div className="relative">
                <h3 className="font-alt text-2xl font-extrabold uppercase tracking-[0.12em] text-orange sm:text-3xl">
                  Hacia dónde vamos
                </h3>
                <p className="mt-5 leading-relaxed text-ink-soft">
                  Nuestra visión es aumentar el alcance de una intervención efectiva basada en
                  Análisis Conductual Aplicado (ABA) a la mayor cantidad posible de familias en el
                  Perú, y promover su uso por las mismas familias y profesionales afines. Seremos el{" "}
                  <strong className="text-ink">centro terapéutico líder</strong> en el manejo de
                  estas terapias para niños y adolescentes.
                </p>
              </div>
            </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== NUESTROS VALORES ===================== */}
      <Section className="bg-white !pt-8 sm:!pt-10">
        <Container>
          <Reveal>
            <SectionHeading
              title="Nuestros valores"
              subtitle="Los principios que sostienen cada acompañamiento en SANTI."
            />
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {heroCards.map((card, i) => {
              const c = colorMap[card.color];
              return (
                <Reveal
                  key={card.title}
                  delay={i * 120}
                  className={`group ${c.bg} p-7 text-white shadow-card transition-transform duration-300 hover:-translate-y-1.5 ${i === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
                >
                  <h3 className="text-xl text-white">{card.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{card.text}</p>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ===================== POR QUÉ SANTI (iconos circulares) ===================== */}
      <Section>
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold leading-tight text-ink sm:text-5xl">
              Una terapia que se vive{" "}
              <span className="text-gradient">dentro y fuera de la sesión</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Creemos que las habilidades importantes son las que se usan en la vida real.
              Por eso trabajamos en la persona, su familia y su contexto.
            </p>
          </Reveal>
          <div className="mt-14 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map((v, i) => {
              const c = colorMap[v.color];
              return (
                <Reveal key={v.title} delay={i * 100} className="h-full">
                  <div className="group flex h-full flex-col overflow-hidden rounded-none border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card">
                    <span className={`block h-1.5 ${c.bg}`} />
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-lg font-bold text-ink">{v.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{v.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ===================== MÉTODO ABA ===================== */}
      <Section className="bg-white">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <Reveal className="order-2">
              <div className="rounded-none bg-orange-tint p-7 sm:p-10">
                <ul className="space-y-4">
                  {[
                    "Enseñanza paso a paso de habilidades funcionales",
                    "Uso de reforzadores positivos",
                    "Medición constante de los avances",
                    "Decisiones basadas en datos",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange text-white">
                        <Icon name="check" className="h-4 w-4" />
                      </span>
                      <span className="font-semibold text-ink">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal className="order-1" delay={120}>
              <h2 className="text-3xl text-ink sm:text-4xl">
                ¿Qué es <span className="text-orange">ABA</span>?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                El <strong className="text-ink">Análisis Conductual Aplicado (ABA)</strong> es
                un enfoque basado en evidencia científica que desarrolla habilidades
                funcionales y adaptativas, reduciendo las conductas que interfieren en
                el aprendizaje y la vida diaria.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Lo aplicamos desde una mirada humana, ética y empática, priorizando el
                vínculo terapéutico y el trabajo conjunto con la familia.
              </p>
              <ButtonLink href="/metodo-aba" variant="orange" className="mt-7">
                Conoce cómo trabajamos
                <Icon name="arrow" className="h-5 w-5" />
              </ButtonLink>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== SERVICIOS ===================== */}
      <Section className="bg-orange-tint bg-[url('/servicios-bg.jpg')] bg-cover bg-center !py-8 sm:!py-10">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl text-ink sm:text-4xl">Nuestros servicios</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              El desarrollo no tiene edad. Tenemos un espacio para los más pequeños y otro
              para jóvenes y adultos.
            </p>
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-3xl items-stretch gap-6 sm:grid-cols-2">
            {segments.map((segment, i) => (
              <Reveal key={segment.slug} delay={i * 120} className="h-full">
                <ServiceCard
                  service={segment.slug === "ninos" ? { ...segment, color: "orange" } : segment}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== GALERÍA / NUESTRO ESPACIO ===================== */}
      {gallery.length > 0 && (
        <Section className="bg-white">
          <Container>
            <Reveal>
              <SectionHeading
                title="Nuestro espacio, nuestro día a día"
                subtitle="Un vistazo a lo que vivimos en SANTI acompañando a cada niño y su familia."
              />
            </Reveal>
            <Reveal delay={120} className="mt-12">
              <GalleryCarousel items={gallery} size="md" />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* ===================== BLOG PARA PADRES ===================== */}
      {posts.length > 0 && (
        <Section className="bg-white !py-8 sm:!py-10">
          <Container>
            <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                align="left"
                title="Blog para padres"
                subtitle="Recursos y guías para acompañar el desarrollo en casa."
              />
              <Link
                href="/blog"
                className="inline-flex shrink-0 items-center gap-2 font-display font-bold text-orange"
              >
                Ver todos
                <Icon name="arrow" className="h-5 w-5" />
              </Link>
            </Reveal>
            <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.slug} delay={i * 120} className="h-full">
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ===================== ALIANZAS Y CONVENIOS ===================== */}
      <Section className="bg-white">
        <Container>
          <Reveal>
            <SectionHeading title="Alianzas y convenios" />
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-3xl text-left text-base leading-relaxed text-ink-soft sm:text-lg">
              Hemos colaborado con universidades e instituciones a través de{" "}
              <strong className="text-ink">prácticas pre profesionales</strong>, brindando espacios
              de formación y aprendizaje a estudiantes en el área del{" "}
              <strong className="text-ink">neurodesarrollo y la neurodivergencia</strong>. Estos
              convenios reflejan nuestro compromiso con la formación de nuevos profesionales y con
              una atención de calidad para cada familia.
            </p>
          </Reveal>
        </Container>

        {/* Fila de logos que se desplaza sola */}
        <div className="marquee-mask mt-14">
          <div className="marquee-track">
            {[...convenios, ...convenios].map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${u.name}-${i}`}
                src={u.logo}
                alt={u.name}
                aria-hidden={i >= convenios.length}
                className="h-16 w-auto shrink-0 object-contain sm:h-24"
              />
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== BANDA CTA FINAL (cierre, pegada al footer) ===================== */}
      <section className="relative overflow-hidden bg-orange">
        <div className="rainbow-bar absolute inset-x-0 top-0 h-2" />
        <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-20 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="text-2xl text-white sm:text-3xl lg:text-4xl">
              Agenda tu primera cita en SANTI
            </h2>
            <p className="mt-3 max-w-xl text-white/90">
              Cuéntanos sobre tu caso y te acompañamos desde la primera conversación.
              Estamos en {site.contact.city.split(",")[0]}.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-display text-lg font-bold text-orange shadow-soft transition-transform hover:scale-105"
            >
              Reserva una cita
            </Link>
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 font-display text-lg font-bold text-white transition-transform hover:scale-105"
            >
              WhatsApp
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
