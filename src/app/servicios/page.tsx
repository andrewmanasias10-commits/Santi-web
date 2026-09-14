import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { segments } from "@/lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/servicios" },
  title: "Nuestros servicios",
  description:
    "SANTI para niños y neurodiversos, y SANTI para jóvenes y adultos. Terapias personalizadas basadas en evidencia.",
};

export default function ServiciosPage() {
  return (
    <>
      <PageHero
        color="orange"
        visual={false}
        bgImage="/servicios-bg.jpg"
        title="Acompañamiento en cada etapa de la vida"
        subtitle="Adaptamos nuestras terapias basadas en evidencia a las necesidades particulares de cada persona y su familia. Elige el espacio que necesitas."
      />
      <Section>
        <Container className="max-w-4xl">
          <SectionHeading
            title="Nuestros servicios"
            subtitle="Dos programas SANTI para acompañar cada etapa del desarrollo."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {segments.map((segment) => (
              <ServiceCard key={segment.slug} service={segment} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
