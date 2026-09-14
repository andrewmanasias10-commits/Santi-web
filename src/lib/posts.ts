import type { BrandColor } from "./site";
import type { Block } from "./blocks";
import { isSupabaseConfigured } from "./supabase/config";
import { createPublicClient } from "./supabase/public";

/**
 * Capa de datos del blog.
 *
 * FASE 2: datos de ejemplo en memoria (semilla).
 * FASE 3: estas funciones se reemplazarán por consultas a Supabase
 * (tabla `posts` + almacenamiento de imágenes/videos), manteniendo la
 * misma interfaz para no tocar la UI.
 */

export type PostMedia =
  | { type: "image"; url: string; alt?: string }
  | { type: "video-embed"; url: string; provider: "youtube" | "vimeo" }
  | { type: "video-file"; url: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  color: BrandColor;
  author: string;
  date: string; // ISO
  readingMinutes: number;
  cover?: string; // url de portada (opcional)
  /** Cuerpo en markdown simple (posts antiguos / semilla). */
  body: string;
  /** Contenido por bloques (editor nuevo). Si existe, tiene prioridad sobre `body`. */
  content?: Block[];
  media?: PostMedia[];
  published: boolean;
};

const seed: Post[] = [
  {
    slug: "que-es-la-neurodivergencia",
    title: "¿Qué es la neurodivergencia? Una guía para padres",
    excerpt:
      "Entender la neurodivergencia es el primer paso para acompañar mejor. Te explicamos qué significa y por qué importa la mirada respetuosa.",
    category: "Neurodivergencia",
    color: "sky",
    author: "Equipo SANTI",
    date: "2025-09-15",
    readingMinutes: 5,
    published: true,
    body: `La neurodivergencia describe las variaciones naturales en la forma en que funcionan nuestros cerebros. No se trata de algo que haya que "arreglar", sino de reconocer que existen distintas maneras de pensar, aprender y relacionarse con el mundo.

## Cada persona es diferente
En SANTI creemos que todos somos diferentes, y esa diversidad es valiosa. Un niño neurodivergente puede tener fortalezas notables junto a desafíos en ciertas áreas. Nuestro trabajo es partir de sus fortalezas.

## ¿Por qué importa la mirada?
La sociedad a menudo espera que las personas neurodivergentes se adapten a las normas neurotípicas. Cambiar esa mirada —de "corregir" a "comprender y apoyar"— transforma la experiencia de toda la familia.

- Observa y celebra las fortalezas de tu hijo o hija.
- Busca apoyo temprano y basado en evidencia.
- Recuerda que el desarrollo ocurre también fuera de la sesión, en casa.

Si tienes dudas sobre el desarrollo de tu hijo, escríbenos. Estamos para acompañarte.`,
  },
  {
    slug: "rutinas-en-casa-que-ayudan",
    title: "5 rutinas en casa que apoyan el desarrollo",
    excerpt:
      "Pequeños cambios en la rutina diaria pueden marcar una gran diferencia. Aquí cinco ideas prácticas para aplicar desde hoy.",
    category: "Desarrollo infantil",
    color: "orange",
    author: "Equipo SANTI",
    date: "2025-10-02",
    readingMinutes: 4,
    published: true,
    body: `Las habilidades que más importan son las que se usan en la vida real. Por eso, la rutina en casa es una gran aliada del proceso terapéutico.

## 1. Anticipa el día
Cuéntale a tu hijo qué va a pasar. Una agenda visual sencilla reduce la incertidumbre y la ansiedad.

## 2. Refuerza lo positivo
Reconoce los logros, por pequeños que sean. El reforzamiento positivo motiva a repetir las conductas deseadas.

## 3. Divide las tareas en pasos
Enseñar paso a paso hace que las tareas grandes se vuelvan alcanzables.

## 4. Cuida los tiempos de descanso
El equilibrio entre estímulo y descanso favorece la regulación.

## 5. Practica lo aprendido en sesión
Continuar en casa los programas trabajados en el consultorio multiplica los resultados.`,
  },
  {
    slug: "aba-en-casa-participacion-de-los-padres",
    title: "ABA en casa: por qué tu participación es clave",
    excerpt:
      "En SANTI los padres participan activamente en la sesión. Te contamos cómo esto acelera el progreso de tu hijo.",
    category: "ABA",
    color: "pink",
    author: "Equipo SANTI",
    date: "2025-10-20",
    readingMinutes: 6,
    published: true,
    body: `Nuestro modelo está adaptado al contexto latinoamericano: los padres aprenden a aplicar los programas en sesión y luego los practican en casa.

## El aprendizaje se generaliza
Cuando una habilidad se practica solo en el consultorio, corre el riesgo de quedarse allí. Al llevarla a casa, el aprendizaje se generaliza a la vida real.

## Padres como aliados terapéuticos
No se trata de convertir a los padres en terapeutas, sino de darles herramientas concretas y confianza para acompañar el día a día.

- Participas en la sesión de 45 minutos.
- Recibes entrenamiento directo para continuar en casa.
- Ves el progreso medido semana a semana.

La coherencia entre el hogar, la terapia y otros entornos es lo que genera cambios sostenibles.`,
  },
];

// Ordenados por fecha descendente.
const byDateDesc = (a: Post, b: Post) => b.date.localeCompare(a.date);

/** Fila de la tabla `posts` en Supabase (snake_case). */
type PostRow = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  color: string;
  author: string;
  date: string;
  reading_minutes: number;
  cover: string | null;
  body: string;
  content: Block[] | null;
  media: PostMedia[] | null;
  published: boolean;
};

/** Mapea una fila de Supabase al tipo Post. */
export function rowToPost(row: PostRow): Post {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    color: (row.color as BrandColor) ?? "pink",
    author: row.author,
    date: row.date,
    readingMinutes: row.reading_minutes,
    cover: row.cover ?? undefined,
    body: row.body,
    content: row.content ?? [],
    media: row.media ?? [],
    published: row.published,
  };
}

const SELECT =
  "slug,title,excerpt,category,color,author,date,reading_minutes,cover,body,content,media,published";

export async function getPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured) {
    return seed.filter((p) => p.published).sort(byDateDesc);
  }
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("published", true)
    .order("date", { ascending: false });
  return (data ?? []).map((r) => rowToPost(r as PostRow));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  if (!isSupabaseConfigured) {
    return seed.find((p) => p.slug === slug && p.published);
  }
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data ? rowToPost(data as PostRow) : undefined;
}

export async function getAllSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return seed.filter((p) => p.published).map((p) => p.slug);
  }
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
