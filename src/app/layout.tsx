import type { Metadata } from "next";
import { Nunito, Quicksand, Lato } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { HideOnAdmin } from "@/components/layout/HideOnAdmin";
import { ImageProtection } from "@/components/ImageProtection";
import { site } from "@/lib/site";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.fullName} · Lima, Perú`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "neuropsicología",
    "terapia ABA",
    "neurodivergencia",
    "terapia infantil",
    "Análisis Conductual Aplicado",
    "Lima",
    "Perú",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png", sizes: "480x480", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icon.png", sizes: "480x480", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: `${site.fullName}`,
    description: site.description,
    url: site.url,
    type: "website",
    locale: "es_PE",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.fullName}`,
    description: site.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${quicksand.variable} ${lato.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <ImageProtection />
        <Navbar />
        <main className="flex-1">{children}</main>
        <HideOnAdmin>
          <Footer />
          <WhatsAppFab />
        </HideOnAdmin>
      </body>
    </html>
  );
}