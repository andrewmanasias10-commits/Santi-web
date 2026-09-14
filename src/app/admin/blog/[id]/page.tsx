import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";

export const metadata = { robots: { index: false, follow: false } };

export default async function EditBlogPostPage(
  props: PageProps<"/admin/blog/[id]">,
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  // El contenido puede venir como array (jsonb) o string JSON.
  let content: unknown[] = [];
  if (typeof post.content === "string") {
    try {
      content = JSON.parse(post.content);
    } catch {
      content = [];
    }
  } else if (Array.isArray(post.content)) {
    content = post.content;
  }

  const normalized = {
    ...post,
    cover_url: post.cover_url || "",
    content,
    tags: Array.isArray(post.tags) ? post.tags : [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BlogPostEditor post={normalized as any} />;
}
