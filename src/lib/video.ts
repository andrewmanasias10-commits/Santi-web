/** Convierte una URL de YouTube/Vimeo en su URL embebible. */
export function toEmbedUrl(url: string, provider: "youtube" | "vimeo" = "youtube"): string {
  try {
    const u = new URL(url);
    const isVimeo = provider === "vimeo" || u.hostname.includes("vimeo");
    if (isVimeo) {
      const id = u.pathname.split("/").filter(Boolean).pop() ?? "";
      return `https://player.vimeo.com/video/${id}`;
    }
    // YouTube (youtu.be/ID, watch?v=ID, /embed/ID, /shorts/ID)
    let id = u.searchParams.get("v") ?? "";
    if (!id) id = u.pathname.split("/").filter(Boolean).pop() ?? "";
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return url;
  }
}
