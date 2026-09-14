-- ============================================================================
-- SANTI · Esquema del blog (correr en Supabase → SQL Editor → New query → Run)
-- ============================================================================

-- 1) Tabla de posts ----------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text not null default '',
  category        text not null default '',
  color           text not null default 'pink',   -- pink | orange | sky | green
  author          text not null default 'Equipo SANTI',
  cover           text,                            -- URL de imagen de portada
  body            text not null default '',        -- markdown simple (posts antiguos)
  content         jsonb not null default '[]'::jsonb, -- bloques del editor nuevo
  media           jsonb not null default '[]'::jsonb, -- [{type,url,provider}]
  reading_minutes int  not null default 3,
  date            date not null default current_date,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists posts_published_date_idx
  on public.posts (published, date desc);

-- Si la tabla ya existía sin la columna de bloques, agrégala:
alter table public.posts
  add column if not exists content jsonb not null default '[]'::jsonb;

-- Mantener updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- 2) Seguridad a nivel de fila (RLS) ----------------------------------------
alter table public.posts enable row level security;

-- Cualquiera puede LEER los posts publicados
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read"
  on public.posts for select
  using (published = true);

-- Usuarios autenticados (el admin) pueden LEER todo (borradores incluidos)
drop policy if exists "posts_admin_read" on public.posts;
create policy "posts_admin_read"
  on public.posts for select to authenticated
  using (true);

-- Usuarios autenticados pueden crear / editar / borrar
drop policy if exists "posts_admin_write" on public.posts;
create policy "posts_admin_write"
  on public.posts for all to authenticated
  using (true) with check (true);

-- 3) Almacenamiento de medios (imágenes / videos) ---------------------------
insert into storage.buckets (id, name, public)
  values ('blog-media', 'blog-media', true)
  on conflict (id) do nothing;

-- Lectura pública del bucket
drop policy if exists "blog_media_public_read" on storage.objects;
create policy "blog_media_public_read"
  on storage.objects for select
  using (bucket_id = 'blog-media');

-- Subir / actualizar / borrar solo autenticados
drop policy if exists "blog_media_admin_write" on storage.objects;
create policy "blog_media_admin_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'blog-media') with check (bucket_id = 'blog-media');
