import type { BrandColor } from "./site";
import type { IconName } from "@/components/ui/Icon";

/** Tarjetas destacadas del hero (estilo línea gráfica SANTI). */
export const heroCards: {
  title: string;
  text: string;
  color: BrandColor;
  icon: IconName;
}[] = [
  {
    title: "Confianza y transparencia",
    text: "Relaciones honestas y cercanas con cada familia, con comunicación clara en todo momento.",
    color: "pink",
    icon: "handHeart",
  },
  {
    title: "Intervención basada en evidencia",
    text: "Aplicamos la ciencia ABA para tomar decisiones basadas en datos, con avances medibles.",
    color: "orange",
    icon: "target",
  },
  {
    title: "Atención personalizada",
    text: "Adaptamos cada plan a las necesidades únicas de cada persona, potenciando su desarrollo.",
    color: "sky",
    icon: "sprout",
  },
];

/** Propuesta de valor (MKT Guidelines de SANTI). */
export const valueProps: {
  title: string;
  text: string;
  color: BrandColor;
  icon: IconName;
}[] = [
  {
    title: "Desarrollo de habilidades",
    text: "Potenciamos el desarrollo de cada persona con un servicio que se adapta a sus necesidades particulares, practicando habilidades para la vida real.",
    color: "pink",
    icon: "sprout",
  },
  {
    title: "Acompañamiento a la familia",
    text: "Damos herramientas y estrategias a las familias para continuar el desarrollo fuera de sesión, porque los mejores resultados nacen en casa.",
    color: "orange",
    icon: "handHeart",
  },
  {
    title: "Progreso medible y transparente",
    text: "Medimos el avance con una metodología orientada a datos que registra el progreso de forma continua y transparente, semana a semana.",
    color: "sky",
    icon: "chart",
  },
  {
    title: "Atención humana y ética",
    text: "Combinamos rigor científico con una atención cercana, respetuosa y profesional, priorizando siempre el bienestar y la dignidad de cada persona.",
    color: "green",
    icon: "brain",
  },
];

/** Filosofía SANTI: el desarrollo impacta tres niveles. */
export const impactLevels: { title: string; text: string; color: BrandColor }[] = [
  {
    title: "La Persona",
    text: "Desarrollando habilidades que favorezcan su autonomía, bienestar y participación en diferentes entornos.",
    color: "pink",
  },
  {
    title: "La Familia",
    text: "Brindando herramientas, orientación y estrategias que permitan continuar el desarrollo fuera de sesión.",
    color: "orange",
  },
  {
    title: "El Contexto",
    text: "Generando entornos más inclusivos en el colegio y la comunidad, donde cada persona pueda desenvolverse.",
    color: "sky",
  },
];

/** Valores de marca. */
export const values: { title: string; text: string; color: BrandColor }[] = [
  {
    title: "Transparencia",
    text: "Construimos relaciones de confianza a través de una comunicación clara y basada en evidencia.",
    color: "pink",
  },
  {
    title: "Excelencia",
    text: "Cada actividad se brinda con dedicación y detalle, para una experiencia que genera valor real.",
    color: "orange",
  },
  {
    title: "Personalizado",
    text: "Cada plan de trabajo es único y basado en las necesidades de la persona, hacia su máximo potencial.",
    color: "sky",
  },
];

export type ServiceItem = { name: string; text: string; note?: string; icon: IconName; image?: string };
export type ServiceGroup = { title: string; note?: string; items: ServiceItem[] };

export type Segment = {
  slug: string;
  title: string;
  age: string;
  color: BrandColor;
  image: string;
  summary: string; // texto corto para tarjetas
  intro: string; // presentación / historia (hero de la página)
  groups: ServiceGroup[];
};

export const segments: Segment[] = [
  {
    slug: "ninos",
    title: "SANTI para niños y neurodiversos",
    age: "Niños y neurodiversidad",
    color: "pink",
    image: "/segmento-ninos.jpg",
    summary:
      "Una amplia variedad de servicios y terapias respetuosas para que cada niño desarrolle su máximo potencial.",
    intro:
      "En SANTI creemos firmemente que los niños merecen servicios de calidad y terapias respetuosas, es por ello que proveemos de una amplia variedad de servicios para ayudar a nuestros pequeños a desarrollar su máximo potencial.",
    groups: [
      {
        title: "Consulta inicial",
        items: [
          {
            name: "Consulta inicial",
            icon: "chat",
            image: "/serv-consulta.jpg",
            text: "Primera cita de 45 minutos indispensable para ingresar a cualquier tipo de evaluación o terapia. En esta cita se concretan las necesidades del menor y las inquietudes de la familia, aclarando dudas y brindando soluciones a los problemas comentados. De ser necesario, después de la consulta inicial se deriva al menor a un servicio SANTI para niños.",
          },
        ],
      },
      {
        title: "Evaluaciones",
        note: "Son 6 sesiones de 45 min c/u: la sesión 1 es la entrevista a padres según el objetivo de evaluación, las sesiones 2 a 5 son la observación y evaluación del menor, y la sesión 6 es la entrega del informe a la familia.",
        items: [
          {
            name: "Evaluación neuropsicológica",
            icon: "brain",
            image: "/serv-eval-neuro.jpg",
            text: "Se aplica cuando existen sospechas de indicadores de neurodiversidad, dificultades cognitivas o de aprendizaje, como problemas de atención, memoria, lenguaje o rendimiento escolar. Nos permite comprender cómo aprende el niño/a y diseñar un plan a la medida de sus fortalezas y necesidades.",
          },
          {
            name: "Evaluación psicológica (emocional)",
            icon: "heart",
            image: "/serv-eval-emocional.jpg",
            text: "Se aplica para comprender el área emocional, conductual o social del niño. Su objetivo es orientar estrategias de acompañamiento y fortalecer el bienestar emocional, tanto del menor como de su familia.",
          },
          {
            name: "Evaluación mixta",
            icon: "puzzle",
            image: "/serv-eval-mixta.jpg",
            text: "Paquete de evaluación de 8 sesiones realizado por psicólogos, orientado a evaluar indicadores de dinámica familiar y del área afectivo-emocional del niño(a), así como indicadores de neurodiversidad y de inteligencia o habilidades básicas. Ideal cuando se necesita una mirada integral del caso.",
          },
        ],
      },
      {
        title: "Terapias",
        note: "Intervenciones basadas en Análisis Conductual Aplicado (ABA), supervisadas por una International Behavior Analyst (IBA, Francesca Ramírez Bontá), para que cada niño reciba la atención personalizada que merece.",
        items: [
          {
            name: "Terapias en consultorio o a domicilio",
            icon: "sprout",
            image: "/serv-terapias.jpg",
            text: "Sesiones individualizadas según los objetivos de cada niño/a, en el consultorio o en la comodidad de tu hogar. Trabajamos áreas como: conducta, regulación emocional, habilidades básicas, lenguaje, aprendizaje, atención y concentración, habilidades sociales, motricidad, y más.",
          },
        ],
      },
      {
        title: "Otros servicios de tu interés",
        items: [
          {
            name: "Acompañamiento escolar (Shadowing · Maestra sombra)",
            icon: "users",
            image: "/serv-shadowing.jpg",
            text: "Acompañamiento individual dentro del aula para que el niño/a aplique en la escuela las habilidades aprendidas en terapia, favoreciendo la adaptación y la autonomía en su entorno educativo.",
          },
          {
            name: "Reforzamiento en casa",
            icon: "home",
            image: "/serv-reforzamiento.jpg",
            text: "Acompañamiento individual en casa para fomentar la autonomía y el cumplimiento de metas diarias: organización de deberes escolares, transiciones de actividades y preparación para el día siguiente, facilitando la rutina familiar y la independencia del menor.",
          },
          {
            name: "Aprestamiento escolar",
            icon: "star",
            image: "/serv-aprestamiento.jpg",
            text: "Intervención individualizada y estructurada para preparar a niños y niñas neurodivergentes para el ingreso al colegio, fortaleciendo las habilidades que necesitarán en su nueva etapa.",
          },
          {
            name: "Psicoeducación para padres",
            icon: "handHeart",
            image: "/serv-psicoeducacion.jpg",
            text: "Orientación personalizada a las familias según el caso específico de su hijo/a y los objetivos de su plan terapéutico actual. Proporciona estrategias prácticas para aplicar en casa, asegurando la continuidad del progreso y el bienestar familiar.",
          },
        ],
      },
    ],
  },
  {
    slug: "jovenes-adultos",
    title: "SANTI para jóvenes y adultos",
    age: "Jóvenes y adultos",
    color: "sky",
    image: "/segmento-jovenes.jpg",
    summary:
      "Un espacio para jóvenes y adultos que necesitan a alguien que los acompañe, escuche y guíe.",
    intro:
      "SANTI respondió a la necesidad de familias que buscaban no solo apoyo para sus niños, sino también para ellos mismos. Así aperturamos un espacio dedicado a los jóvenes y adultos que necesitan a alguien que los acompañe, escuche y guíe.",
    groups: [
      {
        title: "Servicios",
        items: [
          {
            name: "Consulta inicial",
            icon: "chat",
            image: "/serv-jov-consulta.jpg",
            text: "Sesión de 45 minutos donde se recogen tus datos y el motivo de consulta para recomendarte el apoyo necesario. Es el primer paso para conocernos y definir juntos el mejor camino para ti, en un espacio cálido y sin juicios.",
          },
          {
            name: "Evaluación psicológica (emocional)",
            icon: "heart",
            image: "/serv-jov-emocional.jpg",
            text: "Orientada a comprender tu bienestar emocional, cognitivo y conductual. Consta de varias sesiones de 45 minutos: la primera estudia tu historia, la última es la entrega del informe, y las demás son la observación y aplicación de pruebas/entrevistas estandarizadas.",
          },
          {
            name: "Evaluación neuropsicológica",
            icon: "brain",
            image: "/serv-jov-neuro.jpg",
            text: "Se aplica cuando existen sospechas de indicadores de neurodiversidad, dificultades cognitivas o de aprendizaje, como problemas de atención, memoria, lenguaje o rendimiento académico-laboral. A través de pruebas estandarizadas y entrevistas, nos permite comprender tu perfil cognitivo, identificar tus fortalezas y áreas de apoyo, y diseñar un plan de intervención personalizado que potencie tu autonomía y bienestar en el estudio, el trabajo y la vida diaria.",
          },
          {
            name: "Terapia emocional",
            icon: "sprout",
            image: "/serv-jov-terapia.jpg",
            text: "Nos adaptamos a tus necesidades y trabajamos con el enfoque que más pueda ayudarte. Las terapias están enfocadas en acompañarte en el proceso que estás viviendo, ayudarte a entenderte a ti mismo, regular mejor tus emociones y manejar tus pensamientos.",
            note: "Si eres un joven-adulto con problemas de aprendizaje, lectura, entre otros, tu caso será evaluado por Dirección Terapéutica para asignarte al mejor profesional acorde a tus necesidades.",
          },
        ],
      },
    ],
  },
];

export function getSegment(slug: string): Segment | undefined {
  return segments.find((s) => s.slug === slug);
}

/**
 * Testimonios de MUESTRA (temporales). Se muestran mientras no haya fotos/testimonios
 * reales cargados en el panel. Reemplazar cuando lleguen los reales.
 */
export type Testimonial = { quote: string; name: string; role: string; color: BrandColor };

export const sampleTestimonials: Record<string, Testimonial[]> = {
  ninos: [
    {
      quote:
        "Desde que llegamos a SANTI, nuestro hijo ganó muchísima autonomía. El equipo es cálido y siempre nos explican cada avance con claridad.",
      name: "María P.",
      role: "Mamá de Mateo",
      color: "pink",
    },
    {
      quote:
        "Nos sentimos acompañados en todo momento. Ver a nuestra hija feliz y motivada en cada sesión no tiene precio.",
      name: "Jorge y Lucía",
      role: "Papás de Valentina",
      color: "orange",
    },
    {
      quote:
        "Las terapias marcaron un antes y un después. Profesionales humanos, comprometidos y muy respetuosos. Recomiendo SANTI con los ojos cerrados.",
      name: "Carla R.",
      role: "Mamá de Thiago",
      color: "green",
    },
  ],
  "jovenes-adultos": [
    {
      quote:
        "Encontré un espacio seguro para entenderme y trabajar mis emociones. Mi terapeuta me hizo sentir escuchado desde el primer día.",
      name: "Andrés M.",
      role: "24 años",
      color: "sky",
    },
    {
      quote:
        "El acompañamiento fue clave en un momento difícil. Hoy me siento con más herramientas para mi día a día.",
      name: "Daniela S.",
      role: "31 años",
      color: "pink",
    },
    {
      quote:
        "Profesionales cercanos y humanos. Salí de cada sesión sintiéndome mejor y más en calma.",
      name: "Paolo G.",
      role: "28 años",
      color: "orange",
    },
  ],
};
