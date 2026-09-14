-- ============================================================================
-- SANTI · Contenido editable del sitio (videos, fotos y galería del inicio).
-- Correr en Supabase → SQL Editor → Run.
-- ============================================================================

-- Pares clave/valor para media editable (videos de YouTube y fotos sueltas)
create table if not exists public.site_content (
  key         text primary key,          -- home_video | aba_video | team_photo
  kind        text not null default 'video',  -- 'video' | 'image'
  url         text,
  updated_at  timestamptz default now()
);

alter table public.site_content enable row level security;

drop policy if exists "site_content_read" on public.site_content;
create policy "site_content_read"
  on public.site_content for select using (true);

drop policy if exists "site_content_write" on public.site_content;
create policy "site_content_write"
  on public.site_content for all to authenticated using (true) with check (true);

-- Galería de fotos del inicio ("nuestro espacio / lo que hacemos")
create table if not exists public.site_gallery (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  caption     text default '',
  sort        int  not null default 0,
  created_at  timestamptz default now()
);

-- Sección de la foto: home | testimonios | social (permite reusar la misma tabla)
alter table public.site_gallery
  add column if not exists section text not null default 'home';

create index if not exists site_gallery_sort_idx
  on public.site_gallery (section, sort, created_at);

alter table public.site_gallery enable row level security;

drop policy if exists "site_gallery_read" on public.site_gallery;
create policy "site_gallery_read"
  on public.site_gallery for select using (true);

drop policy if exists "site_gallery_write" on public.site_gallery;
create policy "site_gallery_write"
  on public.site_gallery for all to authenticated using (true) with check (true);

-- Equipo / "Nuestros profesionales" (varias personas: foto + nombre + cargo)
create table if not exists public.site_team (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  name        text default '',
  role        text default '',
  sort        int  not null default 0,
  created_at  timestamptz default now()
);

create index if not exists site_team_sort_idx
  on public.site_team (sort, created_at);

alter table public.site_team enable row level security;

drop policy if exists "site_team_read" on public.site_team;
create policy "site_team_read"
  on public.site_team for select using (true);

drop policy if exists "site_team_write" on public.site_team;
create policy "site_team_write"
  on public.site_team for all to authenticated using (true) with check (true);

-- Bucket de media del sitio (fotos del equipo, galería, etc.)
insert into storage.buckets (id, name, public)
  values ('site-media', 'site-media', true)
  on conflict (id) do nothing;

drop policy if exists "site_media_read" on storage.objects;
create policy "site_media_read"
  on storage.objects for select using (bucket_id = 'site-media');

drop policy if exists "site_media_write" on storage.objects;
create policy "site_media_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'site-media') with check (bucket_id = 'site-media');
