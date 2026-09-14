import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/contacto" },
  title: "Reserva tu cita",
  description:
    "Agenda una cita en SANTI. Estamos en Av. Brasil 2730, Pueblo Libre, Lima. Escríbenos por WhatsApp.",
};

const contactItems = [
  { icon: "pin" as const, label: "Dirección", value: `${site.contact.address}, ${site.contact.city}`, href: site.contact.mapsUrl },
  { icon: "phone" as const, label: "Teléfono / WhatsApp", value: site.contact.phone, href: site.contact.whatsapp },
  { icon: "clock" as const, label: "Horario", value: "Lunes a viernes · Modalidad presencial y virtual", href: undefined },
];

export default function ContactoPage() {
  return (
    <>
      <PageHero
        visual={false}
        title="Demos juntos el primer paso"
        subtitle="Cuéntanos sobre tu caso y te acompañamos desde la primera conversación. Responderemos lo antes posible."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            {/* Info de contacto */}
            <div>
              <h2 className="text-2xl text-ink">Información de contacto</h2>
              <ul className="mt-6 space-y-4">
                {contactItems.map((item) => {
                  const content = (
                    <div className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft transition-colors hover:border-pink">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-soft text-pink">
                        <Icon name={item.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                          {item.label}
                        </span>
                        <p className="font-semibold text-ink">{item.value}</p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={item.label}>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 overflow-hidden rounded-2xl border border-line">
                <iframe
                  title="Ubicación de SANTI"
                  src="https://www.google.com/maps?q=Av.%20Brasil%202730%20Pueblo%20Libre%20Lima&output=embed"
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Formulario */}
            <div className="rounded-[2rem] border border-line bg-sky-tint p-7 shadow-soft sm:p-9">
              <h2 className="text-2xl text-ink">Escríbenos</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Completa el formulario y te contactamos por WhatsApp.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
