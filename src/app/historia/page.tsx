import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  alternates: { canonical: "/historia" },
  title: "Nuestra historia",
  description:
    "SANTI nació inspirado en Santiago: un recordatorio de que las terapias se ajustan a cada persona, no al revés. Somos personas ayudando personas.",
};

/** Corazón decorativo. */
function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 21s-7.5-4.9-10-9.2C.4 8.7 2 5 5.4 5c2 0 3.4 1.2 4.1 2.4C10.2 6.2 11.6 5 13.6 5 17 5 18.6 8.7 17 11.8 15.5 16.1 12 21 12 21z" />
    </svg>
  );
}

// Fotos de responsabilidad social — estilo álbum con cinta de color.
const fotos = [
  { src: "/social-1.jpg", tape: "bg-pink-soft", rot: "-rotate-2" },
  { src: "/social-2.jpg", tape: "bg-orange-soft", rot: "rotate-2" },
  { src: "/social-3.jpg", tape: "bg-green-soft", rot: "rotate-1" },
  { src: "/social-4.jpg", tape: "bg-sky-soft", rot: "-rotate-1" },
  { src: "/social-5.jpg", tape: "bg-sky-soft", rot: "rotate-2" },
  { src: "/social-6.jpg", tape: "bg-green-soft", rot: "-rotate-2" },
  { src: "/social-7.jpg", tape: "bg-pink-soft", rot: "rotate-1" },
  { src: "/social-8.jpg", tape: "bg-orange-soft", rot: "-rotate-1" },
];

export default function HistoriaPage() {
  return (
    <>
      {/* ===== La inspiración: Santiago ===== */}
      <Section className="relative overflow-hidden bg-hero">
        <Container className="max-w-4xl text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rainbow-historia.png"
            alt="Arcoíris SANTI"
            draggable={false}
            className="mx-auto w-56 sm:w-72"
          />
          <h1 className="mt-6 font-display text-2xl font-extrabold leading-snug text-ink sm:text-4xl sm:leading-[1.3]">
            <span className="text-sky">SANTI</span> surgió como{" "}
            <span className="mark mark-orange">inspiración</span> de un niño,{" "}
            <span className="text-sky">Santiago (TEA+)</span>, que nos enseñó que{" "}
            <span className="text-green">las terapias deben ajustarse a la persona</span>
            {" "}y <span className="mark mark-pink font-extrabold">no al revés</span>.
          </h1>

          <div className="mt-4 flex items-center justify-center gap-2 text-pink">
            <Heart className="h-5 w-5 text-pink" />
            <Heart className="h-6 w-6 text-orange" />
            <Heart className="h-5 w-5 text-sky" />
          </div>

          {/* Dos fotos reales (como las viñetas del boceto) */}
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-6">
            {[
              { src: "/historia-1.jpg", rot: "-rotate-2" },
              { src: "/historia-2.jpg", rot: "rotate-2" },
            ].map((f, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-[2rem] border-4 border-white shadow-card ${f.rot}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.src}
                  alt="Momento en SANTI"
                  draggable={false}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===== Somos más que terapias ===== */}
      <Section className="bg-white">
        <Container className="max-w-4xl text-center">
          <h2 className="font-display text-xl font-extrabold leading-snug text-ink sm:text-2xl">
            <span className="text-sky">SANTI</span> es más que terapias: somos una{" "}
            <span className="text-pink">comunidad</span> de familias, profesionales y aliados que
            crecemos juntos.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Parte de <span className="mark mark-green font-bold">nuestras ganancias</span> se destina
            a actividades de <span className="mark mark-orange font-bold">responsabilidad social</span>,
            porque queremos contribuir al mundo.
          </p>

          {/* Galería de fotos (8 espacios, estilo álbum con cinta) */}
          <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
            {fotos.map((f, i) => (
              <div key={i} className={`relative ${f.rot}`}>
                {/* Cinta */}
                <span
                  className={`absolute -top-2.5 left-1/2 z-10 h-5 w-14 -translate-x-1/2 rotate-3 rounded-sm ${f.tape} opacity-70`}
                />
                <div className="overflow-hidden rounded-2xl border-4 border-white bg-white shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.src}
                    alt="Actividad de responsabilidad social de SANTI"
                    draggable={false}
                    className="aspect-square w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Cierre */}
          <div className="mt-14">
            <div className="mx-auto flex items-center justify-center gap-3 text-pink">
              <Heart className="h-6 w-6 text-pink" />
              <Heart className="h-7 w-7 text-green" />
              <Heart className="h-6 w-6 text-orange" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-ink sm:text-4xl">
              Somos
              <br />
              <span className="text-gradient">personas ayudando personas</span>.
            </h2>
            <ButtonLink href="/contacto" variant="pink" className="mt-8">
              Súmate a SANTI
              <Icon name="arrow" className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
