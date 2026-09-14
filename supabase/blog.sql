-- ============================================================================
-- SANTI · Blog por bloques (editor tipo capyABA). Correr en SQL Editor → Run.
-- ============================================================================

create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null default '',
  slug             text unique not null,
  excerpt          text,
  content          jsonb not null default '[]'::jsonb, -- páginas/bloques del editor
  cover_url        text,
  cover_emoji      text default '📝',
  cover_bg         text default '#FFE4B3',
  category         text not null default 'General',
  color            text not null default 'pink',    -- tema: pink | orange | sky | green
  author_name      text not null default 'Equipo SANTI',
  author_initials  text not null default 'ES',
  read_time        int  not null default 5,
  tags             jsonb not null default '[]'::jsonb,
  is_published     boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists blog_posts_pub_idx
  on public.blog_posts (is_published, created_at desc);

-- Si la tabla ya existía, agrega la columna de color:
alter table public.blog_posts
  add column if not exists color text not null default 'pink';

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- RLS
alter table public.blog_posts enable row level security;

drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read"
  on public.blog_posts for select using (is_published = true);

drop policy if exists "blog_admin_read" on public.blog_posts;
create policy "blog_admin_read"
  on public.blog_posts for select to authenticated using (true);

drop policy if exists "blog_admin_write" on public.blog_posts;
create policy "blog_admin_write"
  on public.blog_posts for all to authenticated using (true) with check (true);

-- Bucket de imágenes del blog
insert into storage.buckets (id, name, public)
  values ('blog-covers', 'blog-covers', true)
  on conflict (id) do nothing;

drop policy if exists "blog_covers_read" on storage.objects;
create policy "blog_covers_read"
  on storage.objects for select using (bucket_id = 'blog-covers');

drop policy if exists "blog_covers_write" on storage.objects;
create policy "blog_covers_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'blog-covers') with check (bucket_id = 'blog-covers');
