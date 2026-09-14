import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { GalleryCarousel } from "@/components/GalleryCarousel";
import { getSiteContent, getTeam, getGallery } from "@/lib/media";
import { colorMap } from "@/lib/colors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/acerca" },
  title: "Acerca de SANTI",
  description:
    "Somos un centro neuropsicológico y terapéutico especializado en neurodivergencia. Conoce nuestra esencia, el enfoque ABA y nuestra responsabilidad social.",
};

const abaPillars = [
  { title: "Enseñanza paso a paso", text: "Dividimos las habilidades funcionales en pasos alcanzables para construir aprendizajes sólidos.", color: "pink" as const },
  { title: "Reforzadores positivos", text: "Motivamos el aprendizaje reconociendo los logros y generando experiencias positivas.", color: "orange" as const },
  { title: "Medición constante", text: "Registramos datos en cada sesión para entender qué funciona y ajustar el plan.", color: "sky" as const },
  { title: "Decisiones basadas en datos", text: "Tomamos decisiones con evidencia, siempre desde una mirada humana y ética.", color: "green" as const },
];

const socialActions = [
  { text: "Tamizajes gratuitos en alianza con municipalidades.", color: "pink", icon: "shield" },
  { text: "Capacitaciones a maestros en colegios.", color: "orange", icon: "chat" },
  { text: "Talleres de orientación a padres de familia.", color: "sky", icon: "handHeart" },
  { text: "Charlas y eventos comunitarios para familias y niños.", color: "green", icon: "users" },
] as const;

const fundadores = [
  {
    name: "Francesca Cecilia Ramírez Bontá",
    role: "Fundadora y Directora Clínica",
    photo: "/fundador-francesca.png",
    color: "pink" as const,
    imgClass: "",
    bio: "Psicóloga certificada internacionalmente como International Behavior Analyst (IBA) e IBT por la IBAO, especializada en Rehabilitación Neuropsicológica y acreditada en ADOS-2. Fundadora de capyABA y de Neuropsicología y Terapias SANTI. Cuenta con experiencia en dirección clínica, formación de profesionales (CEUs) e innovación con proyectos como VANTY (IA + ABA). Especialista en terapias infantiles, entrenamiento a padres y neuropsicología infantil.",
    email: "capyaba@gmail.com",
    phone: "+51 940 428 169",
    linkedin: "https://www.linkedin.com/in/francesca-ramírez-bontá-00a5b8163",
  },
  {
    name: "Sebastián Olivares",
    role: "Director Ejecutivo y Co-fundador",
    photo: "/fundador-sebastian.png",
    color: "orange" as const,
    imgClass: "-translate-y-8 -mb-8 sm:-translate-y-16 sm:-mb-16",
    bio: "Psicólogo por la UNMSM, orientado al desarrollo organizacional y la gestión del desempeño, con especialización en Organizational Behavior Management (OBM) y formación en Project Management (PMI). Ha ocupado cargos de liderazgo nacional e internacional en AIESEC y colaborado en proyectos de impacto social. Especialista en gestión estratégica de recursos humanos, desarrollo organizacional, liderazgo y gestión de proyectos.",
    email: "sebastian.oliv4967@gmail.com",
    phone: "+51 954 121 968",
    linkedin: "https://www.linkedin.com/in/sebastian-v-olivares-668002176/",
  },
];

export default async function AcercaPage() {
  const [media, team, social] = await Promise.all([
    getSiteContent(),
    getTeam(),
    getGallery("social"),
  ]);
  return (
    <>
      <PageHero
        color="pink"
        visual={false}
        bgImage="/banner-acerca.jpg"
        title="Impulsamos el desarrollo, transformamos vidas"
        subtitle="SANTI es un centro neuropsicológico y terapéutico especializado en neurodivergencia y desarrollo a lo largo del ciclo vital. Combinamos rigor científico con una atención humana, cercana y profesional."
      />

      {/* ¿Quiénes somos? */}
      <Section className="bg-white !pb-6 sm:!pb-8">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Texto */}
            <div>
              <SectionHeading align="left" title="¿Quiénes somos?" />
              <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                <p>
                  SANTI nació en <strong className="text-ink">2022</strong>, inspirado en la
                  experiencia de <strong className="text-ink">Santiago</strong>, un niño peruano
                  cuyo proceso nos mostró el poder del vínculo y del acompañamiento cercano a
                  cada familia.
                </p>
                <p className="font-semibold text-ink">
                  Te contamos nuestra historia en el video 👉
                </p>
              </div>
            </div>

            {/* Video al costado del texto */}
            <VideoEmbed
              url={media.about_video}
              color="pink"
              label="Video de SANTI"
              className="!rounded-none"
            />
          </div>
        </Container>
      </Section>

      {/* Fundadores */}
      <Section className="bg-white !pt-6 !pb-8 sm:!pt-8 sm:!pb-10">
        <Container>
          <SectionHeading
            title="Fundadores"
            subtitle="Las personas que dieron vida a SANTI y guían su propósito día a día: acompañar a más familias con terapias de calidad, calidez humana y respaldo científico."
          />
          <div className="mt-8 space-y-6">
            {fundadores.map((f, i) => {
              const fc = colorMap[f.color];
              const flip = i % 2 === 1; // alterna el lado de la foto
              return (
                <div
                  key={f.name}
                  className={`grid items-start gap-4 lg:gap-8 ${
                    flip ? "lg:grid-cols-[1.28fr_0.72fr]" : "lg:grid-cols-[0.72fr_1.28fr]"
                  }`}
                >
                  {/* Foto */}
                  <div className={flip ? "lg:order-2" : ""}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.photo}
                      alt={f.name}
                      draggable={false}
                      className={`mx-auto w-full max-w-xs sm:max-w-sm ${f.imgClass}`}
                    />
                  </div>

                  {/* Texto */}
                  <div className={flip ? "lg:order-1" : ""}>
                    <span className={`font-alt text-sm font-extrabold uppercase tracking-[0.12em] ${fc.text}`}>
                      {f.role}
                    </span>
                    <h3 className="mt-1 text-2xl text-ink sm:text-3xl">{f.name}</h3>
                    <p className="mt-4 text-base leading-relaxed text-ink-soft">{f.bio}</p>
                    <div className="mt-5 text-sm text-ink-soft">
                      <a
                        href={f.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-block font-semibold ${fc.text} hover:underline`}
                      >
                        Ver perfil de LinkedIn →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Nuestro espacio (imagen) */}
      <Section className="bg-white !pt-6 sm:!pt-8">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <MediaFrame src="/consultorio.jpg" color="pink" ratio="16 / 9" alt="Consultorio de SANTI" className="!rounded-none" />
            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">Un espacio pensado para el desarrollo</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                Contamos con un entorno cálido, seguro y preparado para el trabajo
                terapéutico, donde cada niño, adolescente o adulto puede desenvolverse y
                donde la familia participa de forma activa.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Estamos en Av. Brasil 2730, Pueblo Libre, Lima.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ¿Qué es ABA? (integrado en Quiénes somos) */}
      <Section className="bg-pink-tint">
        <Container>
          {/* Texto + video alineados */}
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <span className="font-alt text-lg font-extrabold uppercase tracking-[0.1em] text-pink">
                Nuestro enfoque
              </span>
              <h2 className="mt-2 text-2xl text-ink sm:text-3xl">
                ¿Qué es <span className="text-pink">ABA</span>?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                El <strong className="text-ink">Análisis Conductual Aplicado (ABA)</strong> es un
                enfoque basado en evidencia científica que desarrolla habilidades funcionales y
                adaptativas, reduciendo las conductas que interfieren en el aprendizaje y la vida
                diaria. Va con la esencia de SANTI: lo aplicamos desde una mirada humana, ética y
                empática, priorizando el vínculo y el trabajo con la familia.
              </p>
            </div>
            <div>
              <VideoEmbed url={media.aba_video} color="pink" label="Video de ABA" className="!rounded-none" />
            </div>
          </div>

          {/* Pilares abajo, en fila */}
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {abaPillars.map((p) => {
              const pc = colorMap[p.color];
              return (
                <li key={p.title} className="rounded-none border border-line bg-white p-5 shadow-soft">
                  <span className={`inline-block h-1.5 w-8 rounded-full ${pc.bg}`} />
                  <h3 className="mt-3 text-base font-bold text-ink">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Nuestros profesionales */}
      <Section>
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Fotos al lado: carrusel con auto-play y clic para ampliar */}
            {team.length > 0 ? (
              <GalleryCarousel
                fit="cover"
                size="lg"
                bordered={false}
                interval={3000}
                items={team.map((member) => ({
                  id: member.id,
                  url: member.url,
                  caption: [member.name, member.role].filter(Boolean).join(" · "),
                }))}
              />
            ) : (
              <MediaFrame src={media.team_photo} color="sky" ratio="4 / 3" label="Foto del equipo" />
            )}

            {/* Texto */}
            <div>
              <h2 className="text-2xl text-ink sm:text-3xl">Nuestros profesionales</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                Nuestro equipo está conformado por profesionales especializados en el área
                de la salud y el desarrollo humano, capacitados en intervención conductual y
                enfoques basados en evidencia.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Los terapeutas de SANTI trabajan de manera coordinada, siguiendo protocolos
                de intervención claros y evaluaciones constantes, garantizando la calidad,
                coherencia y efectividad de cada proceso terapéutico.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Responsabilidad social */}
      <Section className="bg-pink-tint">
        <Container>
          {/* Texto + imagen al costado */}
          <div
            className={`grid items-center gap-10 lg:gap-16 ${
              social.length > 0 ? "lg:grid-cols-2" : ""
            }`}
          >
            {/* Texto */}
            <div>
              <span className="font-alt text-lg font-extrabold uppercase tracking-[0.1em] text-pink">
                Comunidad
              </span>
              <h2 className="mt-2 text-2xl text-ink sm:text-3xl">Responsabilidad social</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                Creemos que nuestro impacto debe ir más allá de los servicios terapéuticos. Parte
                de nuestras ganancias se destina a actividades solidarias gratuitas.
              </p>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Nos encanta ayudar y queremos que el mensaje SANTI llegue a todos 🌈: ser más que
                un centro, una comunidad que comparte conocimiento, apoyo y esperanza con quienes
                más lo necesitan.
              </p>
            </div>

            {/* Imagen al costado del texto */}
            {social.length > 0 && <GalleryCarousel items={social} size="lg" />}
          </div>

          {/* Actividades solidarias en fila, debajo */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {socialActions.map((a) => {
              const ac = colorMap[a.color];
              return (
                <div key={a.text} className="rounded-2xl bg-white p-5 shadow-soft">
                  <span className={`block h-1.5 w-9 rounded-full ${ac.bg}`} />
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-ink">{a.text}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Sé parte de nosotros */}
      <Section className="bg-white">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <MediaFrame src={media.join_photo} color="pink" ratio="4 / 3" label="Foto del equipo" className="!rounded-none" />
              <div>
                <div className="rainbow-bar mb-6 h-1.5 w-24 rounded-full" />
                <h2 className="text-2xl text-ink sm:text-3xl">Sé parte de nosotros</h2>
                <p className="mt-4 leading-relaxed text-ink-soft">
                  En SANTI creemos en el trabajo en equipo, la formación continua y el
                  compromiso con una atención ética y de calidad. Invitamos a profesionales
                  interesados en la intervención en población neurodivergente a formar parte de
                  nuestro equipo y crecer junto a nosotros.
                </p>
                <ButtonLink href="/contacto" variant="pink" className="mt-6">
                  Postula con nosotros
                  <Icon name="arrow" className="h-5 w-5" />
                </ButtonLink>
              </div>
            </div>
        </Container>
      </Section>

      {/* Marco ético */}
      <Section className="pt-0">
        <Container>
          <div className="rounded-[2rem] bg-ink px-8 py-12 sm:px-12">
            <div className="rainbow-bar mb-6 h-1.5 w-24 rounded-full" />
            <h2 className="max-w-2xl text-2xl text-white sm:text-3xl">
              Una práctica ética, basada en evidencia
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-white/70">
              Nuestro trabajo se basa en el Código de Ética de la IBAO, que exige respeto,
              dignidad, evidencia científica y bienestar de cada persona y su familia.
              Aplicamos ABA desde una mirada humana, ética y empática.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
