import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/terminos" },
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso del sitio web de SANTI.",
};

export default function TerminosPage() {
  return (
    <>
      <PageHero color="sky" title="Términos y Condiciones" />
      <Section>
        <Container className="max-w-3xl">
          <div className="mb-8 rounded-2xl bg-sky-tint px-5 py-4 text-sm text-ink-soft">
            <strong className="text-ink">Nota:</strong> este documento es un borrador de
            referencia y debe ser revisado y aprobado por un asesor legal antes de su
            publicación oficial.
          </div>

          <div className="legal">
            <p>
              <strong>Última actualización:</strong> {new Date().getFullYear()}
            </p>
            <p>
              Bienvenido al sitio web de <strong>{site.fullName}</strong> (en adelante,
              «SANTI», «nosotros» o «el Centro»). Al acceder y utilizar este sitio web,
              aceptas los presentes Términos y Condiciones. Si no estás de acuerdo con
              ellos, te pedimos no utilizar el sitio.
            </p>

            <h2>1. Objeto</h2>
            <p>
              Este sitio web tiene como finalidad brindar información sobre los servicios
              terapéuticos y neuropsicológicos de SANTI, así como facilitar el contacto y
              la reserva de citas. La información publicada tiene carácter informativo y no
              sustituye una evaluación, diagnóstico o tratamiento profesional
              individualizado.
            </p>

            <h2>2. Naturaleza de la información</h2>
            <p>
              El contenido del blog y de las secciones informativas es de carácter
              educativo y general. No constituye asesoría clínica ni establece una relación
              terapeuta–paciente. Cualquier decisión sobre la salud o el desarrollo de una
              persona debe consultarse directamente con nuestros profesionales o con un
              especialista de confianza.
            </p>

            <h2>3. Reserva de citas y contacto</h2>
            <p>
              Los formularios y canales de contacto (incluido WhatsApp) permiten solicitar
              información o una cita. El envío de una solicitud no garantiza la
              disponibilidad de un horario; la reserva quedará confirmada únicamente cuando
              el Centro lo comunique de forma expresa.
            </p>

            <h2>4. Propiedad intelectual</h2>
            <p>
              Todos los contenidos de este sitio (textos, logotipos, marca SANTI, gráficos,
              imágenes y materiales) son propiedad de SANTI o se utilizan con la debida
              autorización, y están protegidos por la legislación aplicable. Queda prohibida
              su reproducción total o parcial sin autorización previa y por escrito.
            </p>

            <h2>5. Uso adecuado del sitio</h2>
            <ul>
              <li>No utilizar el sitio con fines ilícitos o no autorizados.</li>
              <li>No intentar dañar, sobrecargar o vulnerar la seguridad del sitio.</li>
              <li>No publicar ni transmitir contenidos ofensivos o que infrinjan derechos de terceros.</li>
            </ul>

            <h2>6. Enlaces a terceros</h2>
            <p>
              Este sitio puede incluir enlaces o contenidos embebidos de terceros (por
              ejemplo, mapas o videos). SANTI no se responsabiliza por las prácticas o
              contenidos de dichos sitios externos.
            </p>

            <h2>7. Limitación de responsabilidad</h2>
            <p>
              SANTI procura mantener la información actualizada y libre de errores, pero no
              garantiza la ausencia total de estos ni la disponibilidad ininterrumpida del
              sitio. En la máxima medida permitida por la ley, SANTI no será responsable por
              daños derivados del uso o la imposibilidad de uso del sitio.
            </p>

            <h2>8. Modificaciones</h2>
            <p>
              SANTI podrá modificar estos Términos y Condiciones en cualquier momento. Los
              cambios entrarán en vigor desde su publicación en esta página.
            </p>

            <h2>9. Legislación aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República del Perú. Cualquier
              controversia se someterá a la jurisdicción de los tribunales competentes de
              Lima.
            </p>

            <h2>10. Contacto</h2>
            <p>
              Para consultas sobre estos términos, escríbenos a{" "}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> o llámanos
              al {site.contact.phone}.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
