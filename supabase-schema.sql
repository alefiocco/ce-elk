-- ============================================================
-- SCHEMA SUPABASE — CE Riclassificato
-- Esegui questo script nell'editor SQL di Supabase
-- ============================================================

-- 1. Tabella profili (estende auth.users con ruolo)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  ruolo text not null check (ruolo in ('admin', 'cliente')),
  nome text,
  created_at timestamptz default now()
);

-- RLS: ogni utente vede solo il proprio profilo; admin vede tutti
alter table public.profiles enable row level security;

create policy "Utente vede proprio profilo"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin vede tutti i profili"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.ruolo = 'admin'
    )
  );

-- Auto-crea profilo alla registrazione
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, ruolo, nome)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'ruolo', 'cliente'),
    coalesce(new.raw_user_meta_data->>'nome', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. Tabella mesi: un record per ogni mese pubblicato
-- ============================================================
create table if not exists public.mesi (
  id uuid default gen_random_uuid() primary key,
  mese text not null,                        -- "2026-03"
  label text,                                -- "Marzo 2026"

  -- Dati CE elaborati per locale (JSON con vals + gruppi)
  dati_ce jsonb not null default '{}',       -- { tot, via4, capp, new }

  -- Dati comparativi
  dati_anno_prec jsonb default '{}',
  dati_bilancio  jsonb default '{}',

  -- Prima nota (righe CE con fatture)
  prima_nota jsonb default '[]',

  -- Configurazione
  extra_scritture jsonb default '[]',
  mappatura_extra jsonb default '{}',
  alloc_conf      jsonb default '{}',
  cespiti         jsonb default '{}',

  -- Metadati
  pubblicato_at timestamptz default now(),
  pubblicato_da uuid references auth.users(id),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.mesi enable row level security;

-- Admin: lettura e scrittura totale
create policy "Admin legge tutti i mesi"
  on public.mesi for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'admin')
  );

create policy "Admin scrive i mesi"
  on public.mesi for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'admin')
  );

-- Cliente: solo lettura
create policy "Cliente legge i mesi"
  on public.mesi for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and ruolo = 'cliente')
  );

-- Indice su mese per ordinamento
create index if not exists mesi_mese_idx on public.mesi(mese desc);

-- ============================================================
-- ISTRUZIONI POST-SETUP
-- ============================================================
-- 1. Crea il commercialista da Supabase Dashboard > Authentication > Users
--    oppure da SQL:
--
--    select auth.create_user(
--      email := 'commercialista@studio.it',
--      password := 'PasswordSicura123!',
--      user_metadata := '{"ruolo": "admin", "nome": "Studio Commerciale"}'
--    );
--
-- 2. Crea il cliente:
--    select auth.create_user(
--      email := 'cliente@azienda.it',
--      password := 'ClientePass456!',
--      user_metadata := '{"ruolo": "cliente", "nome": "ELK SRL"}'
--    );
--
-- 3. Copia SUPABASE_URL e SUPABASE_ANON_KEY da
--    Project Settings > API > Project URL e anon key
--    e aggiungili come variabili d'ambiente su Vercel.
