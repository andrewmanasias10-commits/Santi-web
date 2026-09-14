import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Section";
import { nav, legalNav, site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="rainbow-bar h-2 w-full" />
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Marca */}
          <div>
            <Logo height={104} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
              {site.description}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de SANTI"
                className="grid h-10 w-10 place-items-center rounded-full bg-pink-tint text-pink transition-colors hover:bg-pink hover:text-white"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href={site.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok de SANTI"
                className="grid h-10 w-10 place-items-center rounded-full bg-sky-tint text-sky transition-colors hover:bg-ink hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 3a5.6 5.6 0 0 0 4.5 4.5v3a8.6 8.6 0 0 1-4.5-1.3v6.05A6.25 6.25 0 1 1 10.25 9c.26 0 .51.02.75.05v3.1a3.2 3.2 0 1 0 2.25 3.05V3h3.25z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Enlaces del sitio">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
              Explora
            </h3>
            <ul className="mt-4 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-ink-soft transition-colors hover:text-pink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-muted">
              Contáctanos
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-soft">
              <li>
                <a href={site.contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink">
                  {site.contact.address}
                  <br />
                  {site.contact.city}
                </a>
              </li>
              <li>
                <a href={`tel:${site.contact.phoneRaw}`} className="font-semibold hover:text-pink">
                  {site.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.contact.email}`} className="hover:text-pink">
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={site.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-green px-4 py-2 font-display text-xs font-bold text-white"
                >
                  Escríbenos por WhatsApp
                </a>
              </li>
            </ul>

          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-8 border-t border-line pt-6 sm:flex-row sm:items-center sm:gap-8">
          {/* Libro de Reclamaciones (INDECOPI · Ley N° 29571) */}
          <Link
            href="/libro-de-reclamaciones"
            aria-label="Libro de Reclamaciones"
            title="Libro de Reclamaciones"
            className="order-1 shrink-0 rounded-xl border border-line bg-white p-2 shadow-soft transition-transform hover:scale-[1.03]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/libro-reclamaciones.png" alt="Libro de Reclamaciones" className="h-auto w-24" />
          </Link>

          <div className="order-2 text-center text-xs text-ink-muted sm:text-left">
            <p>© {year} {site.fullName}. Todos los derechos reservados.</p>
            <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-semibold hover:text-pink">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
