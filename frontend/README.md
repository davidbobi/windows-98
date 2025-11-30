# RetroOS 98 (frontend)

Interfața Win98-like construită cu Next.js 14 (App Router) și TypeScript.

## Pornire rapidă
```bash
cd frontend
npm install
npm run dev
```

Aplicatia pornește pe `http://localhost:3000`.

## Variabile de mediu (frontend/.env.local)
- `NEXT_PUBLIC_SUPABASE_URL` – URL-ul proiectului (Supabase Dashboard → Project Settings → API).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – anon/public API key.
- `NEXT_PUBLIC_SUPABASE_REST_URL` – de forma `<supabase_url>/rest/v1`.
- `NEXT_PUBLIC_SUPABASE_PROJECT_REF` – opțional, referința proiectului (pentru debug).

## Integrare Supabase
- Autentificare pe homescreen cu `supabase.auth.signInWithPassword` (supabase-js).
- Desktop-ul se afișează doar după login; buton Sign out în taskbar.
- Notes folosește Supabase REST API pentru CRUD (`/rest/v1/notes`) cu RLS.

## Aplicatii incluse
Desktop Win98-like cu ferestre, taskbar, Start menu, plus aplicații: Notes (Supabase), Paint, Minesweeper, My Files/My Computer, Settings, Recycle Bin, About.
