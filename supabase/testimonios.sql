-- ============================================================================
-- Testimonios públicos (comentarios con estrellas que dejan los visitantes)
-- Con MODERACIÓN: quedan pendientes hasta que el admin los apruebe.
-- Ejecuta este bloque en el SQL Editor de Supabase.
-- ============================================================================

create table if not exists public.testimonios_publicos (
  id         uuid primary key default gen_random_uuid(),
  segment    text not null,                 -- 'ninos' | 'jovenes-adultos'
  name       text not null,
  role       text,
  rating     int  not null,                 -- 1 a 5
  quote      text not null,
  approved   boolean not null default false, -- se muestra solo si es true
  created_at timestamptz not null default now()
);

-- Si la tabla ya existía sin la columna, la agrega:
alter table public.testimonios_publicos
  add column if not exists approved boolean not null default false;

alter table public.testimonios_publicos enable row level security;

-- El público solo ve los testimonios APROBADOS.
drop policy if exists "testimonios_read" on public.testimonios_publicos;
drop policy if exists "testimonios_read_public" on public.testimonios_publicos;
create policy "testimonios_read_public"
  on public.testimonios_publicos for select to anon
  using (approved = true);

-- El admin (autenticado) ve todos, incluidos los pendientes.
drop policy if exists "testimonios_read_admin" on public.testimonios_publicos;
create policy "testimonios_read_admin"
  on public.testimonios_publicos for select to authenticated
  using (true);

-- Cualquiera puede dejar un comentario (queda pendiente de aprobación).
drop policy if exists "testimonios_insert" on public.testimonios_publicos;
create policy "testimonios_insert"
  on public.testimonios_publicos for insert to anon, authenticated
  with check (
    char_length(name)  between 1 and 60
    and char_length(quote) between 3 and 500
    and rating between 1 and 5
  );

-- Solo el admin aprueba (update) o elimina (delete).
drop policy if exists "testimonios_admin_update" on public.testimonios_publicos;
create policy "testimonios_admin_update"
  on public.testimonios_publicos for update to authenticated
  using (true) with check (true);

drop policy if exists "testimonios_admin_delete" on public.testimonios_publicos;
create policy "testimonios_admin_delete"
  on public.testimonios_publicos for delete to authenticated
  using (true);

notify pgrst, 'reload schema';
