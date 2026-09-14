import { BlogPostEditor } from "@/components/admin/BlogPostEditor";

export const metadata = { robots: { index: false, follow: false } };

export default function NewBlogPostPage() {
  return <BlogPostEditor />;
}
