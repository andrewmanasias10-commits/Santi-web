/**
 * Modelo de bloques del blog (inspirado en el editor de capyABA).
 * El contenido de cada post es un array de bloques que se guarda como JSON
 * en la columna `content` (jsonb) de la tabla `posts`.
 */

export type BlockType =
  | "paragraph"
  | "heading2"
  | "heading3"
  | "quote"
  | "callout"
  | "image"
  | "video"
  | "divider";

export interface Block {
  id: string;
  type: BlockType;
  /** HTML enriquecido (para bloques de texto). */
  content: string;
  meta?: {
    src?: string; // imagen o video subido
    url?: string; // link de video (YouTube/Vimeo)
    provider?: "youtube" | "vimeo";
    alt?: string;
    caption?: string;
  };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function emptyBlock(type: BlockType = "paragraph"): Block {
  return { id: uid(), type, content: "", meta: {} };
}

/** Catálogo de bloques para el menú "+". */
export const BLOCK_CATALOG: {
  type: BlockType;
  icon: string;
  label: string;
}[] = [
  { type: "paragraph", icon: "¶", label: "Párrafo" },
  { type: "heading2", icon: "H2", label: "Título" },
  { type: "heading3", icon: "H3", label: "Subtítulo" },
  { type: "image", icon: "🖼️", label: "Imagen" },
  { type: "video", icon: "🎬", label: "Video" },
  { type: "quote", icon: "❝", label: "Cita" },
  { type: "callout", icon: "💡", label: "Cuadro de aviso" },
  { type: "divider", icon: "—", label: "Separador" },
];

/** Interpreta el contenido guardado (array de bloques o texto plano). */
export function parseBlocks(raw: unknown): Block[] {
  if (Array.isArray(raw)) return raw as Block[];
  if (typeof raw === "string" && raw.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Block[];
    } catch {
      /* ignore */
    }
  }
  return [];
}

/** Texto plano (para excerpt / conteo de palabras). */
export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((b) => b.content.replace(/<[^>]+>/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadMinutes(blocks: Block[]): number {
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
