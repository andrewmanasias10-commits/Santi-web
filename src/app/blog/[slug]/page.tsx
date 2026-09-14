import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockContent, flattenBlocks } from "@/components/BlockContent";
import { CopyLinkButton } from "@/components/blog/CopyLinkButton";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { getBlogPost, getBlogPosts, formatDate } from "@/lib/blog";
import { site } from "@/lib/site";
import type { BrandColor } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Hex de marca por color de tema del post. */
const THEME: Record<BrandColor, { main: string; soft: string; tint: string; deep: string }> = {
  pink: { main: "#ff82ae", soft: "#ffd9e6", tint: "#fff2f6", deep: "#c74b78" },
  orange: { main: "#ffa600", soft: "#ffe4b3", tint: "#fff6e6", deep: "#b87700" },
  sky: { main: "#3dc5ff", soft: "#c9edff", tint: "#eef9ff", deep: "#1892cc" },
  green: { main: "#a4c21f", soft: "#e4f0b8", tint: "#f6fbe6", deep: "#728a10" },
};

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Artículo no encontrado" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const t = THEME[post.color] ?? THEME.pink;
  const blocks = flattenBlocks(post.content);
  const hasContent = blocks.some(
    (b) =>
      b.type === "divider" ||
      (b.type === "image" && b.meta?.src) ||
      (b.type !== "image" && typeof b.content === "string" && b.content.trim()),
  );

  const initials =
    post.authorInitials ||
    post.author
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const shareUrl = encodeURIComponent(`${site.url}/blog/${post.slug}`);
  const shareTitle = encodeURIComponent(post.title);
  const plainShareUrl = `${site.url}/blog/${post.slug}`;

  const allPosts = await getBlogPosts();
  const idx = allPosts.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? allPosts[idx - 1] : null; // más reciente → Siguiente
  const older = idx >= 0 && idx < allPosts.length - 1 ? allPosts[idx + 1] : null; // Anterior
  const related = allPosts.filter((r) => r.slug !== post.slug).slice(0, 3);

  return (
    <>
      <style>{`
        .bp {
          --theme: ${t.main};
          --theme-soft: ${t.soft};
          --theme-tint: ${t.tint};
          --theme-deep: ${t.deep};
          background: #fff;
        }
        .bp-progress { position: fixed; top: 0; left: 0; height: 4px; width: 0; background: var(--theme); z-index: 60; transition: width .1s linear; }
        .bp-accent { height: 6px; background: var(--theme); }

        .bp-wrap { max-width: 900px; margin: 0 auto; padding: 0 32px; }
        .bp-cover-wrap { max-width: 900px; margin: 32px auto 0; padding: 0 32px; }

        .bp-crumb { padding: 30px 0 0; font-size: 14px; font-weight: 600; color: var(--color-ink-muted); }
        .bp-crumb a { color: var(--theme-deep); text-decoration: none; }
        .bp-crumb a:hover { text-decoration: underline; }

        .bp-cat {
          display: inline-block; margin-top: 26px;
          font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
          color: var(--theme-deep);
        }
        .bp-title {
          font-family: var(--font-display), var(--font-sans);
          font-size: 44px; line-height: 1.12; font-weight: 800; letter-spacing: -.02em;
          color: var(--color-ink); margin: 10px 0 0;
        }
        .bp-meta {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0 0; padding-bottom: 28px;
          border-bottom: 1px solid var(--color-line);
        }
        .bp-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--theme); color: #fff; display: grid; place-items: center;
          font-size: 14px; font-weight: 800; flex-shrink: 0;
        }
        .bp-author { font-size: 15px; font-weight: 800; color: var(--color-ink); }
        .bp-date { font-size: 13.5px; color: var(--color-ink-muted); margin-top: 1px; }

        .bp-cover { margin: 0; border-radius: 0; overflow: hidden; border: 1px solid var(--color-line); box-shadow: 0 20px 50px -30px rgba(0,0,0,.3); }
        .bp-cover img { display: block; width: 100%; height: auto; }

        .bp-lead { margin: 30px 0 0; font-size: 20px; line-height: 1.6; color: var(--color-ink-soft); font-weight: 500; }

        .bp-body { margin: 28px 0 0; }
        .bp-body img, .bp-body figure { border-radius: 0 !important; }
        .bp-empty { color: var(--color-ink-muted); font-style: italic; font-size: 17px; }

        /* Compartir (fila simple) */
        .bp-share { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 48px 0 0; padding-top: 26px; border-top: 1px solid var(--color-line); }
        .bp-share-label { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--color-ink-muted); margin-right: 4px; }
        .bp-sbtn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 15px; border-radius: 100px; font-size: 13px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; font-family: inherit; }
        .bp-sbtn:hover { opacity: .88; }
        .bp-x { background: #000; color: #fff; }
        .bp-wa { background: #25d366; color: #fff; }
        .bp-link { background: #fff; color: var(--color-ink-soft); border: 1.5px solid var(--color-line) !important; }

        /* Autor (nota breve al final) */
        .bp-author-note { display: flex; gap: 14px; align-items: flex-start; margin: 40px 0 0; padding: 22px; border-radius: 18px; background: var(--theme-tint); }
        .bp-author-note .bp-avatar { width: 48px; height: 48px; font-size: 15px; }
        .bp-an-name { font-size: 15px; font-weight: 800; color: var(--color-ink); }
        .bp-an-bio { font-size: 14px; line-height: 1.55; color: var(--color-ink-soft); margin-top: 3px; }
        .bp-an-link { display: inline-block; margin-top: 10px; font-size: 13.5px; font-weight: 800; color: var(--theme-deep); text-decoration: none; }
        .bp-an-link:hover { text-decoration: underline; }

        /* Anterior / Siguiente */
        .bp-nav { max-width: 900px; margin: 56px auto 0; padding: 0 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .bp-nav-item { display: block; background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 16px 20px; text-decoration: none; transition: transform .2s, box-shadow .2s, border-color .2s; }
        .bp-nav-item:hover { transform: translateY(-3px); box-shadow: 0 16px 34px -22px rgba(0,0,0,.28); border-color: var(--theme); }
        .bp-nav-next { text-align: right; }
        .bp-nav-label { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--theme-deep); }
        .bp-nav-ttl { font-size: 15px; font-weight: 700; color: var(--color-ink); line-height: 1.35; margin-top: 5px; }
        .bp-nav-empty { border: none; background: none; pointer-events: none; }

        /* Más artículos */
        .bp-related { max-width: 1000px; margin: 70px auto 0; padding: 40px 24px 90px; border-top: 1px solid var(--color-line); }
        .bp-related-title { font-family: var(--font-display), var(--font-sans); font-size: 24px; font-weight: 800; color: var(--color-ink); margin-bottom: 24px; }
        .bp-related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .bp-related-card { display: block; background: #fff; border: 1px solid var(--color-line); border-radius: 18px; overflow: hidden; text-decoration: none; transition: transform .2s, box-shadow .2s; }
        .bp-related-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -22px rgba(0,0,0,.25); }
        .bp-related-img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .bp-related-body { padding: 16px 18px; }
        .bp-related-cat { font-size: 10.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--theme-deep); margin-bottom: 7px; }
        .bp-related-ttl { font-size: 15.5px; font-weight: 800; color: var(--color-ink); line-height: 1.3; margin-bottom: 8px; }
        .bp-related-meta { font-size: 12.5px; color: var(--color-ink-muted); }

        @media (max-width: 700px) {
          .bp-title { font-size: 32px; }
          .bp-lead { font-size: 18px; }
          .bp-nav { grid-template-columns: 1fr; }
          .bp-nav-next { text-align: left; }
          .bp-related-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div id="bp-progress" className="bp-progress" suppressHydrationWarning />
      <ReadingProgress />

      <div className="bp">
        <div className="bp-accent" />

        <article id="post-content">
          <div className="bp-wrap">
            <nav className="bp-crumb">
              <Link href="/blog">← Blog</Link> · {post.category}
            </nav>

            <span className="bp-cat">{post.category}</span>
            <h1 className="bp-title">{post.title}</h1>

            <div className="bp-meta">
              <div className="bp-avatar">{initials}</div>
              <div>
                <div className="bp-author">{post.author}</div>
                <div className="bp-date">
                  {formatDate(post.date)} · {post.readingMinutes} min de lectura
                </div>
              </div>
            </div>
          </div>

          {post.cover && (
            <div className="bp-cover-wrap">
              <figure className="bp-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.cover} alt={post.title} />
              </figure>
            </div>
          )}

          <div className="bp-wrap">
          {post.excerpt && <p className="bp-lead">{post.excerpt}</p>}

          <div className="bp-body">
            {hasContent ? (
              <BlockContent content={post.content} />
            ) : (
              <p className="bp-empty">Este artículo aún no tiene contenido publicado.</p>
            )}
          </div>

          {/* Compartir */}
          <div className="bp-share">
            <span className="bp-share-label">Compartir</span>
            <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`} target="_blank" rel="noopener" className="bp-sbtn bp-x">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              X
            </a>
            <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener" className="bp-sbtn bp-wa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              WhatsApp
            </a>
            <CopyLinkButton url={plainShareUrl} className="bp-sbtn bp-link" />
          </div>

          {/* Autor */}
          <div className="bp-author-note">
            <div className="bp-avatar">{initials}</div>
            <div>
              <div className="bp-an-name">{post.author}</div>
              <p className="bp-an-bio">
                Equipo de neuropsicología y terapias de SANTI. Acompañamos a las familias con
                intervención basada en evidencia.
              </p>
              <Link href="/contacto" className="bp-an-link">Reserva tu cita →</Link>
            </div>
          </div>
          </div>{/* /bp-wrap cuerpo */}
        </article>

        {(older || newer) && (
          <nav className="bp-nav" aria-label="Navegación entre artículos">
            {older ? (
              <Link href={`/blog/${older.slug}`} className="bp-nav-item">
                <span className="bp-nav-label">← Anterior</span>
                <span className="bp-nav-ttl">{older.title}</span>
              </Link>
            ) : (
              <span className="bp-nav-item bp-nav-empty" aria-hidden />
            )}
            {newer ? (
              <Link href={`/blog/${newer.slug}`} className="bp-nav-item bp-nav-next">
                <span className="bp-nav-label">Siguiente →</span>
                <span className="bp-nav-ttl">{newer.title}</span>
              </Link>
            ) : (
              <span className="bp-nav-item bp-nav-empty" aria-hidden />
            )}
          </nav>
        )}

        {related.length > 0 && (
          <div className="bp-related">
            <h2 className="bp-related-title">Más artículos</h2>
            <div className="bp-related-grid">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="bp-related-card">
                  {r.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover} alt={r.title} className="bp-related-img" />
                  ) : (
                    <div
                      className="bp-related-img"
                      style={{
                        background: (THEME[r.color] ?? THEME.pink).tint,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 38,
                      }}
                    >
                      {r.coverEmoji}
                    </div>
                  )}
                  <div className="bp-related-body">
                    <div className="bp-related-cat" style={{ color: (THEME[r.color] ?? THEME.pink).deep }}>
                      {r.category}
                    </div>
                    <div className="bp-related-ttl">{r.title}</div>
                    <div className="bp-related-meta">
                      {r.readingMinutes} min · {formatDate(r.date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
