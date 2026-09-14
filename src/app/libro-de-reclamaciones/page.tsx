import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { ReclamacionesForm } from "@/components/ReclamacionesForm";

export const metadata: Metadata = {
  alternates: { canonical: "/libro-de-reclamaciones" },
  title: "Libro de Reclamaciones",
  description:
    "Libro de Reclamaciones virtual de SANTI, conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571 · INDECOPI).",
};

export default function LibroReclamacionesPage() {
  return (
    <>
      <PageHero
        color="sky"
        visual={false}
        title="Libro de Reclamaciones"
        subtitle="Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571 · INDECOPI). Registra aquí tu reclamo o queja y te responderemos a la brevedad."
      />
      <Section>
        <Container>
          <ReclamacionesForm />
        </Container>
      </Section>
    </>
  );
}
