import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/privacidad" },
  title: "Política de Privacidad",
  description:
    "Política de privacidad y tratamiento de datos personales de SANTI, conforme a la Ley N° 29733 del Perú.",
};

export default function PrivacidadPage() {
  return (
    <>
      <PageHero color="pink" title="Política de Privacidad" />
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
              En <strong>{site.fullName}</strong> valoramos y protegemos tu privacidad.
              Esta política explica cómo recopilamos, usamos y protegemos tus datos
              personales, en cumplimiento de la <strong>Ley N° 29733</strong>, Ley de
              Protección de Datos Personales del Perú, y su reglamento.
            </p>

            <h2>1. Responsable del tratamiento</h2>
            <p>
              El responsable del tratamiento de tus datos es {site.fullName}, con domicilio
              en {site.contact.address}, {site.contact.city}. Puedes contactarnos en{" "}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            </p>

            <h2>2. Datos que recopilamos</h2>
            <p>Podemos recopilar los siguientes datos cuando te contactas con nosotros:</p>
            <ul>
              <li>Datos de identificación y contacto (nombre, teléfono, correo electrónico).</li>
              <li>Información que compartas voluntariamente sobre tu caso o el de un familiar.</li>
              <li>Datos de navegación básicos con fines estadísticos y de mejora del sitio.</li>
            </ul>
            <p>
              Cuando la información se refiera a menores de edad, esta será proporcionada por
              los padres o tutores legales, quienes autorizan su tratamiento.
            </p>

            <h2>3. Finalidad del tratamiento</h2>
            <ul>
              <li>Atender tus consultas y solicitudes de cita.</li>
              <li>Brindar y coordinar nuestros servicios terapéuticos.</li>
              <li>Enviarte información relevante sobre el proceso, cuando corresponda.</li>
              <li>Mejorar la experiencia y el contenido de nuestro sitio web.</li>
            </ul>

            <h2>4. Base legal y consentimiento</h2>
            <p>
              El tratamiento de tus datos se realiza con tu consentimiento libre, previo,
              expreso e informado, que otorgas al enviarnos tu información a través de
              nuestros canales de contacto.
            </p>

            <h2>5. Confidencialidad de datos sensibles</h2>
            <p>
              La información clínica y de salud tiene la condición de dato sensible y recibe
              un tratamiento especialmente reservado, accesible únicamente por el personal
              autorizado y bajo estrictos deberes de confidencialidad profesional.
            </p>

            <h2>6. Conservación</h2>
            <p>
              Conservamos tus datos durante el tiempo necesario para cumplir las finalidades
              descritas y las obligaciones legales aplicables. Luego serán eliminados o
              anonimizados de forma segura.
            </p>

            <h2>7. Compartir datos con terceros</h2>
            <p>
              No vendemos ni cedemos tus datos a terceros con fines comerciales. Solo
              podríamos compartirlos cuando sea necesario para prestar el servicio o por
              mandato legal.
            </p>

            <h2>8. Tus derechos (ARCO)</h2>
            <p>
              Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición,
              así como revocar tu consentimiento, escribiéndonos a{" "}
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>. Atenderemos
              tu solicitud en los plazos que establece la ley.
            </p>

            <h2>9. Cookies</h2>
            <p>
              Este sitio puede utilizar cookies técnicas necesarias para su funcionamiento y,
              en su caso, cookies analíticas para entender su uso. Puedes configurar tu
              navegador para gestionarlas o bloquearlas.
            </p>

            <h2>10. Cambios en esta política</h2>
            <p>
              Podremos actualizar esta política para reflejar cambios normativos o de
              nuestros servicios. Publicaremos cualquier cambio en esta misma página.
            </p>

            <h2>11. Contacto</h2>
            <p>
              Si tienes dudas sobre esta política o sobre el tratamiento de tus datos,
              escríbenos a <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>{" "}
              o llámanos al {site.contact.phone}.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
