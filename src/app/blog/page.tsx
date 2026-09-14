import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Section, SectionHeading } from "@/components/ui/Section";
import { PostCard } from "@/components/PostCard";
import { getBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog para padres",
  description:
    "Recursos, guías y consejos para acompañar el desarrollo de tus hijos en casa. Contenido del equipo de SANTI.",
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHero
        color="green"
        visual={false}
        bgImage="/banner-blog.jpg"
        title="Recursos para acompañar en casa"
        subtitle="Guías, consejos y contenido basado en evidencia para que el desarrollo continúe más allá de la sesión."
      />
      <Section>
        <Container>
          <SectionHeading
            title="Últimos artículos"
            subtitle="Publicaciones del equipo de SANTI para acompañar el desarrollo en casa."
          />
          {posts.length === 0 ? (
            <p className="mt-10 text-center text-ink-soft">
              Pronto publicaremos nuevo contenido. ¡Vuelve pronto!
            </p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
