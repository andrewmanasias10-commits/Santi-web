import type { PostMedia } from "@/lib/posts";
import { toEmbedUrl } from "@/lib/video";

export function MediaBlock({ media }: { media: PostMedia }) {
  if (media.type === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={media.url}
        alt={media.alt ?? ""}
        className="my-6 w-full rounded-2xl border border-line"
      />
    );
  }
  if (media.type === "video-file") {
    return (
      <video
        controls
        src={media.url}
        className="my-6 w-full rounded-2xl border border-line"
      />
    );
  }
  return (
    <div className="my-6 aspect-video overflow-hidden rounded-2xl border border-line">
      <iframe
        src={toEmbedUrl(media.url, media.provider)}
        title="Video"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

/**
 * Renderiza markdown simple: "## " subtítulos, "- " listas y párrafos.
 * (En la Fase 3 se puede reemplazar por un editor/markdown más completo.)
 */
export function PostBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n{2,}/);

  return (
    <div className="legal">
      {blocks.map((block, i) => {
        if (block.startsWith("## ")) {
          return <h2 key={i}>{block.slice(3)}</h2>;
        }
        if (block.startsWith("- ")) {
          const items = block.split("\n").map((l) => l.replace(/^- /, ""));
          return (
            <ul key={i}>
              {items.map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}
