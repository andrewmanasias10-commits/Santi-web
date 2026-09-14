import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { getSiteContent } from "@/lib/media";
import { colorMap } from "@/lib/colors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/metodo-aba" },
  title: "Qué es ABA",
  description:
    "El Análisis Conductual Aplicado (ABA) en SANTI: un enfoque basado en evidencia, humano y ético, para desarrollar habilidades funcionales.",
};

const pillars = [
  {
    title: "Enseñanza paso a paso",
    text: "Dividimos las habilidades funcionales en pasos alcanzables para construir aprendizajes sólidos y duraderos.",
    icon: "puzzle" as const,
    color: "pink" as const,
  },
  {
    title: "Reforzadores positivos",
    text: "Motivamos el aprendizaje reconociendo los logros, generando experiencias positivas alrededor del desarrollo.",
    icon: "star" as const,
    color: "orange" as const,
  },
  {
    title: "Medición constante",
    text: "Registramos datos en cada sesión para entender qué funciona y ajustar el plan de forma oportuna.",
    icon: "chart" as const,
    color: "green" as const,
  },
  {
    title: "Decisiones basadas en datos",
    text: "Las intervenciones se guían por evidencia y resultados medibles, no por suposiciones.",
    icon: "shield" as const,
    color: "sky" as const,
  },
];

const flow = [
  {
    title: "Entrevista inicial",
    text: "Recogemos la historia clínica y las necesidades de la persona, y explicamos cómo trabajamos en SANTI.",
  },
  {
    title: "Evaluación",
    text: "Cuando aplica, usamos pruebas estandarizadas (ABLLS-R, VB-MAPP, escalas Wechsler, funciones ejecutivas).",
  },
  {
    title: "Plan individualizado",
    text: "Definimos objetivos claros y medibles, adaptados al ritmo, características y contexto de cada persona.",
  },
  {
    title: "Intervención y familia",
    text: "Aplicamos el programa con participación activa de la familia, que aprende a continuarlo en casa.",
  },
  {
    title: "Seguimiento continuo",
    text: "Medimos el progreso semana a semana y ajustamos el plan con base en los datos recogidos.",
  },
];

export default async function MetodoAbaPage() {
  const media = await getSiteContent();
  return (
    <>
      <PageHero
        color="sky"
        title="¿Qué es ABA?"
        subtitle="El Análisis Conductual Aplicado (ABA) es un enfoque terapéutico basado en evidencia científica que desarrolla habilidades funcionales y adaptativas, reduciendo las conductas que interfieren en el aprendizaje y la vida diaria."
      />

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-ink-soft">
              En SANTI utilizamos ABA para comprender cómo aprende cada
              persona y qué estrategias facilitan mejor su desarrollo. La intervención
              es <strong className="text-ink">individualizada, estructurada y progresiva</strong>,
              respetando el ritmo y el contexto de cada niño, adolescente o adulto.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {pillars.map((p) => {
              const c = colorMap[p.color];
              return (
                <div key={p.title} className="flex gap-5 rounded-[1.75rem] border border-line bg-white p-6 shadow-soft">
                  <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${c.soft} ${c.text}`}>
                    <Icon name={p.icon} className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg text-ink">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Video explicativo */}
      <Section className="bg-sky-tint">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl text-ink sm:text-4xl">
                <span className="text-sky">ABA</span> en video
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                Mira cómo aplicamos el Análisis Conductual Aplicado en sesión, con la
                participación activa de la familia y el registro de avances.
              </p>
              <ButtonLink href="/contacto" variant="sky" className="mt-7">
                Reserva una evaluación
                <Icon name="arrow" className="h-5 w-5" />
              </ButtonLink>
            </div>
            <div className="order-1 lg:order-2">
              <VideoEmbed url={media.aba_video} color="sky" label="Video de ABA" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Flujo de intervención */}
      <Section className="bg-white">
        <Container>
          <SectionHeading
            title="El proceso terapéutico en SANTI"
            subtitle="Un camino claro y transparente, del primer contacto al seguimiento continuo."
          />
          <ol className="mx-auto mt-14 max-w-3xl space-y-4">
            {flow.map((step, i) => (
              <li key={step.title} className="flex gap-5 rounded-2xl border border-line bg-white p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] bg-sky-tint p-8 text-center">
            <p className="text-lg font-semibold text-ink">
              Adaptado al contexto latinoamericano: los padres aprenden a aplicar los
              programas en sesión y luego los practican en casa.
            </p>
            <ButtonLink href="/contacto" variant="sky" className="mt-6">
              Reserva una evaluación
              <Icon name="arrow" className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
