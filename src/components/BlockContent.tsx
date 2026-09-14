/**
 * Render público de los bloques del editor (formato capyABA), estilo SANTI,
 * con tamaños contenidos y editoriales (no gigante).
 */

type Meta = {
  src?: string;
  alt?: string;
  caption?: string;
  align?: "full" | "center" | "left" | "right";
  emoji?: string;
  sideText?: string;
};
type Block = { id: string; type: string; content: string; meta?: Meta };
type Page = { id: string; blocks: Block[] };

const INK = "#1a1a1a";
const INK_SOFT = "#4d4d4d";
const MUTED = "#8c8c8c";
const PINK = "#ff82ae";

export function flattenBlocks(content: unknown): Block[] {
  let raw: unknown = content;
  if (typeof content === "string") {
    try {
      raw = JSON.parse(content);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  if (raw.length > 0 && (raw[0] as Page)?.blocks) {
    return (raw as Page[]).flatMap((p) => (Array.isArray(p.blocks) ? p.blocks : []));
  }
  return raw as Block[];
}

/** Bloques que se consideran "encabezado" para el índice (TOC). */
export function tocHeadings(content: unknown): { text: string; level: 1 | 2 }[] {
  return flattenBlocks(content)
    .filter((b) => b.type === "heading1" || b.type === "heading2")
    .map((b) => ({
      text: (typeof b.content === "string" ? b.content : "").replace(/<[^>]+>/g, "").trim(),
      level: b.type === "heading1" ? 1 : (2 as 1 | 2),
    }))
    .filter((h) => h.text);
}

function BlockView({ block, index, headingId }: { block: Block; index: number; headingId?: string }) {
  const { type, meta } = block;
  const content = typeof block.content === "string" ? block.content : "";
  const sh = { dangerouslySetInnerHTML: { __html: content || "" } };

  if (type === "divider")
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "44px 0" }}>
        <span style={{ flex: 1, height: 1, background: "#ececec" }} />
        <span style={{ color: PINK }}>✦</span>
        <span style={{ flex: 1, height: 1, background: "#ececec" }} />
      </div>
    );

  if (type === "image") {
    if (!meta?.src) return null;
    const align = meta.align || "full";
    const isFloat = align === "left" || align === "right";
    const widths: Record<string, string> = { full: "100%", center: "68%", left: "40%", right: "40%" };
    const W = widths[align] || "100%";

    if (isFloat && meta.sideText) {
      return (
        <div style={{ overflow: "hidden", margin: "28px 0" }}>
          <figure
            style={{
              float: align === "left" ? "left" : "right",
              width: W,
              maxWidth: 320,
              margin: align === "left" ? "0 26px 12px 0" : "0 0 12px 26px",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meta.src} alt={meta.alt || ""} style={{ display: "block", width: "100%", maxHeight: 360, objectFit: "cover" }} />
            {meta.caption && (
              <figcaption style={{ textAlign: "center", fontSize: 13, color: MUTED, padding: "8px 10px", fontStyle: "italic" }}>
                {meta.caption}
              </figcaption>
            )}
          </figure>
          <div className="block-prose" style={{ fontSize: 17, lineHeight: 1.75, color: INK_SOFT }} dangerouslySetInnerHTML={{ __html: meta.sideText }} />
          <div style={{ clear: "both" }} />
        </div>
      );
    }

    return (
      <figure style={{ margin: "32px auto", width: W }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.src}
          alt={meta.alt || ""}
          style={{ display: "block", width: "100%", maxHeight: 460, objectFit: "cover", borderRadius: 16, border: "1px solid #ececec" }}
        />
        {meta.caption && (
          <figcaption style={{ textAlign: "center", fontSize: 13, color: MUTED, marginTop: 10, fontStyle: "italic" }}>
            {meta.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (!content) return null;

  if (type === "heading1")
    return <h2 id={headingId} style={{ fontSize: 26, fontWeight: 800, color: INK, lineHeight: 1.25, margin: "42px 0 12px", scrollMarginTop: 96 }} {...sh} />;
  if (type === "heading2")
    return <h3 id={headingId} style={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1.3, margin: "34px 0 10px", scrollMarginTop: 96 }} {...sh} />;
  if (type === "heading3")
    return <h4 style={{ fontSize: 18, fontWeight: 800, color: INK, lineHeight: 1.4, margin: "26px 0 8px" }} {...sh} />;

  if (type === "quote")
    return (
      <blockquote style={{ margin: "28px 0", padding: "16px 22px", borderLeft: `4px solid ${PINK}`, background: "#fff2f6", borderRadius: "0 12px 12px 0" }}>
        <p style={{ fontSize: 18, fontStyle: "italic", color: INK_SOFT, lineHeight: 1.7, margin: 0 }} {...sh} />
      </blockquote>
    );

  if (type === "callout")
    return (
      <div style={{ display: "flex", gap: 12, background: "#fff", border: "1.5px solid #ececec", borderRadius: 14, padding: "16px 20px", margin: "24px 0", alignItems: "flex-start" }}>
        <span style={{ fontSize: "1.35rem", flexShrink: 0 }}>{meta?.emoji || "💡"}</span>
        <p style={{ fontSize: 15.5, color: INK_SOFT, lineHeight: 1.7, margin: 0 }} {...sh} />
      </div>
    );

  if (type === "bullet")
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start", paddingLeft: 2 }}>
        <span style={{ color: PINK, fontSize: 18, lineHeight: 1.7, flexShrink: 0 }}>•</span>
        <p style={{ fontSize: 17, color: INK_SOFT, lineHeight: 1.75, margin: 0 }} {...sh} />
      </div>
    );

  if (type === "numbered")
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start", paddingLeft: 2 }}>
        <span style={{ color: PINK, fontSize: 14, fontWeight: 800, flexShrink: 0, marginTop: 2, minWidth: 20 }}>{index + 1}.</span>
        <p style={{ fontSize: 17, color: INK_SOFT, lineHeight: 1.75, margin: 0 }} {...sh} />
      </div>
    );

  if (type === "code")
    return (
      <pre style={{ background: "#1c1c1a", borderRadius: 12, padding: "16px 20px", overflow: "auto", margin: "24px 0" }}>
        <code style={{ fontFamily: "Consolas, monospace", fontSize: 13.5, color: "#e6e6e6", lineHeight: 1.6 }} {...sh} />
      </pre>
    );

  return <div className="block-prose" style={{ fontSize: 17, color: INK_SOFT, lineHeight: 1.8, margin: "0 0 20px" }} {...sh} />;
}

export function BlockContent({ content }: { content: unknown }) {
  const blocks = flattenBlocks(content);
  let hIdx = 0;
  return (
    <div className="block-prose">
      {blocks.map((b, i) => {
        const isHeading = b.type === "heading1" || b.type === "heading2";
        const headingId = isHeading ? `h-${hIdx++}` : undefined;
        return <BlockView key={b.id || i} block={b} index={i} headingId={headingId} />;
      })}
    </div>
  );
}
