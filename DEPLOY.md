# Guida al Deploy — CE Riclassificato
## Prerequisiti: account gratuito su supabase.com e vercel.com

---

## PASSO 1 — Crea il progetto Supabase

1. Vai su https://supabase.com e crea un account gratuito
2. Crea un nuovo progetto (scegli un nome es. "ce-cliente-xyz", regione Europe West)
3. Attendi ~2 minuti che il progetto venga inizializzato
4. Vai su **SQL Editor** (menu a sinistra) e incolla il contenuto di `supabase-schema.sql`
5. Clicca **Run** — crea le tabelle e le policy RLS

## PASSO 2 — Crea gli utenti

Nel SQL Editor di Supabase esegui (cambia email e password):

```sql
-- Crea il commercialista (admin)
select auth.create_user(
  email := 'tu@studio.it',
  password := 'TuaPasswordSicura123!',
  email_confirm := true,
  user_metadata := '{"ruolo": "admin", "nome": "Studio Commerciale"}'::jsonb
);

-- Crea il cliente
select auth.create_user(
  email := 'cliente@azienda.it',
  password := 'ClientePassword456!',
  email_confirm := true,
  user_metadata := '{"ruolo": "cliente", "nome": "Nome Cliente SRL"}'::jsonb
);
```

## PASSO 3 — Ottieni le chiavi API

1. Vai su **Project Settings > API**
2. Copia:
   - **Project URL** (es. `https://abcdef.supabase.co`)
   - **anon public** key (la chiave lunga sotto "Project API keys")

## PASSO 4 — Deploy su Vercel

1. Vai su https://vercel.com e crea un account gratuito
2. Clicca **Add New > Project**
3. Importa da GitHub (dovrai prima caricare questa cartella su GitHub)
   - Crea un repo su github.com
   - Carica tutti i file di questa cartella
   - Vercel lo rileva automaticamente come progetto Next.js
4. Nella schermata di configurazione Vercel, aggiungi le **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://tuoprogetto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...la tua anon key...
   ```
5. Clicca **Deploy**

## PASSO 5 — Testa il deploy

1. Apri l'URL Vercel (es. `https://ce-cliente-xyz.vercel.app`)
2. Accedi con le credenziali del commercialista → vedi la vista Admin
3. Apri in incognito e accedi con le credenziali del cliente → vedi la vista Cliente (solo lettura)

---

## Per ogni nuovo cliente: ripeti i passi 1-5

Il progetto Supabase è separato per cliente (dati isolati).
Puoi avere un solo repo GitHub e fare fork/copia per ogni cliente.

---

## Aggiornare la password di un utente

Dal SQL Editor Supabase:
```sql
select auth.update_user(
  uid := 'uuid-dell-utente',
  password := 'NuovaPassword789!'
);
```
Oppure da Dashboard > Authentication > Users > clicca sull'utente > Edit.

---

## Struttura dati salvata su Supabase

Ogni mese pubblicato contiene:
- `dati_ce`: gruppi contabili aggregati per codice gestionale
- `dati_anno_prec`, `dati_bilancio`: dati comparativi
- `prima_nota`: righe fatture per il drill-down
- `extra_scritture`: ratei, competenze, budget
- `mappatura_extra`: personalizzazioni piano dei conti
- `alloc_conf`, `cespiti`: coefficienti allocazione CC5
