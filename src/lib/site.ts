/**
 * Configuración central del sitio SANTI.
 * Una sola fuente de verdad para datos de contacto, navegación y servicios.
 */

export const site = {
  name: "SANTI",
  fullName: "Neuropsicología y Terapias — SANTI",
  slogan: "Personas ayudando personas",
  description:
    "Terapias personalizadas y basadas en evidencia para niños, adolescentes y adultos, con énfasis en neurodivergencia. Neuropsicología y Terapias - SANTI.",
  url: "https://www.terapiassanti.com",
  ruc: "20612402044",
  founded: 2022,
  payments: ["Transferencia bancaria", "Yape", "Plin", "Efectivo"],
  contact: {
    phone: "+51 982 423 620",
    phoneRaw: "51982423620",
    whatsapp: "https://wa.me/51982423620",
    email: "aprendizaje.santi@gmail.com",
    address: "Av. Brasil 2730, Consultorio 1515",
    city: "Pueblo Libre, Lima, Perú",
    mapsUrl: "https://maps.google.com/?q=Av.+Brasil+2730+Pueblo+Libre+Lima",
  },
  social: {
    instagram: "https://www.instagram.com/terapias.santi/",
    tiktok: "https://www.tiktok.com/@terapias.santi",
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
};

export const nav: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Quiénes somos", href: "/acerca" },
  {
    label: "Servicios",
    href: "/servicios",
    children: [
      {
        label: "SANTI para niños y neurodiversos",
        href: "/servicios/ninos",
        description: "Consulta, evaluaciones y terapias ABA para los más pequeños.",
      },
      {
        label: "SANTI para jóvenes y adultos",
        href: "/servicios/jovenes-adultos",
        description: "Un espacio para acompañarte, escucharte y guiarte.",
      },
    ],
  },
  { label: "Blog", href: "/blog" },
];

export const legalNav = [
  { label: "Términos y Condiciones", href: "/terminos" },
  { label: "Política de Privacidad", href: "/privacidad" },
];

/** Colores de marca disponibles como acento por sección/tarjeta. */
export const brandColors = ["pink", "sky", "green", "orange"] as const;
export type BrandColor = (typeof brandColors)[number];
