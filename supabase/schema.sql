-- =====================================================================
-- Schéma de la base du catalogue (Supabase / PostgreSQL)
-- À exécuter une fois : Supabase → SQL Editor → coller ce fichier → Run.
-- Puis exécuter supabase/seed.sql pour charger le catalogue de départ.
-- =====================================================================

-- ---------- Tables ----------

create table if not exists public.boutique (
  id          smallint primary key default 1 check (id = 1),  -- une seule ligne
  nom         text not null default 'Ma boutique',
  slogan      text not null default '',
  whatsapp    text not null default '',
  telephone   text not null default '',
  adresse     text not null default '',
  devise      text not null default 'FCFA',
  updated_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  nom         text not null check (length(trim(nom)) > 0),
  icone       text not null default '📦',
  ordre       integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table if not exists public.produits (
  id            text primary key check (id ~ '^[a-z0-9-]+$'),
  categorie_id  text not null references public.categories (id) on update cascade on delete restrict,
  nom           text not null check (length(trim(nom)) > 0),
  description   text not null default '',
  unite         text not null default 'pièce',
  prix_detail   integer not null check (prix_detail >= 0),
  prix_gros     integer check (prix_gros >= 0),
  qte_min_gros  integer check (qte_min_gros >= 1),
  image         text not null default '',
  disponible    boolean not null default true,
  ordre         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists produits_categorie_idx on public.produits (categorie_id, ordre);

-- Comptes autorisés à modifier le catalogue (ajoutés à la main, voir LISEZMOI).
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

insert into public.boutique (id) values (1) on conflict do nothing;

-- ---------- Date de mise à jour automatique ----------

create or replace function public.maj_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists boutique_maj on public.boutique;
create trigger boutique_maj before update on public.boutique for each row execute function public.maj_updated_at();
drop trigger if exists categories_maj on public.categories;
create trigger categories_maj before update on public.categories for each row execute function public.maj_updated_at();
drop trigger if exists produits_maj on public.produits;
create trigger produits_maj before update on public.produits for each row execute function public.maj_updated_at();

-- ---------- Sécurité (Row Level Security) ----------
-- Tout le monde peut LIRE le catalogue ; seuls les comptes présents dans « admins » peuvent le MODIFIER.

create or replace function public.est_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.est_admin() from public;
grant execute on function public.est_admin() to anon, authenticated;

alter table public.boutique   enable row level security;
alter table public.categories enable row level security;
alter table public.produits   enable row level security;
alter table public.admins     enable row level security;

drop policy if exists "lecture publique" on public.boutique;
create policy "lecture publique" on public.boutique for select to anon, authenticated using (true);
drop policy if exists "admins modifient" on public.boutique;
create policy "admins modifient" on public.boutique for update to authenticated
  using ((select public.est_admin())) with check ((select public.est_admin()));

drop policy if exists "lecture publique" on public.categories;
create policy "lecture publique" on public.categories for select to anon, authenticated using (true);
drop policy if exists "admins gèrent" on public.categories;
create policy "admins gèrent" on public.categories for all to authenticated
  using ((select public.est_admin())) with check ((select public.est_admin()));

drop policy if exists "lecture publique" on public.produits;
create policy "lecture publique" on public.produits for select to anon, authenticated using (true);
drop policy if exists "admins gèrent" on public.produits;
create policy "admins gèrent" on public.produits for all to authenticated
  using ((select public.est_admin())) with check ((select public.est_admin()));

-- Un admin peut seulement vérifier sa propre ligne ; aucune écriture via l'API.
drop policy if exists "voir son statut" on public.admins;
create policy "voir son statut" on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------- Photos des articles (Storage) ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produits', 'produits', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "admins envoient des photos" on storage.objects;
create policy "admins envoient des photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'produits' and (select public.est_admin()));
drop policy if exists "admins suppriment des photos" on storage.objects;
create policy "admins suppriment des photos" on storage.objects for delete to authenticated
  using (bucket_id = 'produits' and (select public.est_admin()));
