"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, Fragment } from "react";
import { Logo } from "@/components/brand/Logo";
import { NavBearButton } from "@/components/NavBearButton";
import { ButtonLink } from "@/components/ui/Button";
import { nav } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Cierra el menú móvil al navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // El panel de administración tiene su propia interfaz.
  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-white/90 backdrop-blur-md"
          : "border-b border-transparent bg-white/70 backdrop-blur-sm",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Logo horizontal height={72} />

        {/* Desktop */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) =>
            item.children ? (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 font-alt text-[17px] font-semibold transition-colors",
                    isActive(item.href)
                      ? "text-pink"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {item.label}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:rotate-180">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <div className="invisible absolute left-0 top-full w-72 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-card">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-2xl px-4 py-3 transition-colors hover:bg-pink-tint"
                      >
                        <span className="block font-display text-sm font-bold text-ink">
                          {child.label}
                        </span>
                        {child.description && (
                          <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                            {child.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ) : (
              <Fragment key={item.href}>
                {item.href === "/blog" && (
                  <li>
                    <NavBearButton className="h-11" />
                  </li>
                )}
                <li>
                  <Link
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3.5 py-2 font-alt text-[17px] font-semibold transition-colors",
                      isActive(item.href)
                        ? "text-pink"
                        : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              </Fragment>
            ),
          )}
        </ul>

        <div className="hidden lg:block">
          <ButtonLink href="/contacto" variant="pink" size="sm">
            Contáctanos
          </ButtonLink>
        </div>

        {/* Botón móvil */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink lg:hidden"
        >
          <span className="relative block h-4 w-5">
            <span className={cn("absolute left-0 h-0.5 w-5 rounded bg-current transition-all", open ? "top-1.5 rotate-45" : "top-0")} />
            <span className={cn("absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-all", open && "opacity-0")} />
            <span className={cn("absolute left-0 h-0.5 w-5 rounded bg-current transition-all", open ? "top-1.5 -rotate-45" : "top-3")} />
          </span>
        </button>
      </nav>

      {/* Menú móvil */}
      <div
        className={cn(
          "overflow-hidden border-t border-line bg-white transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-[80vh]" : "max-h-0 border-t-0",
        )}
      >
        <ul className="space-y-1 px-5 py-4">
          {nav.map((item) => (
            <Fragment key={item.href}>
              {item.href === "/blog" && (
                <li className="px-2">
                  <NavBearButton className="h-12" />
                </li>
              )}
              <li>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-2xl px-4 py-3 font-display font-bold",
                    isActive(item.href) ? "bg-pink-tint text-pink" : "text-ink",
                  )}
                >
                  {item.label}
                </Link>
              {item.children && (
                <ul className="mb-1 ml-3 space-y-1 border-l-2 border-line pl-3">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink-soft"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              </li>
            </Fragment>
          ))}
          <li className="pt-2">
            <ButtonLink href="/contacto" variant="pink" className="w-full">
              Contáctanos
            </ButtonLink>
          </li>
        </ul>
      </div>
    </header>
  );
}
