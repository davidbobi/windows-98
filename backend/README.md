## RetroOS 98 – backend (Supabase)

Acest folder conține schema și politicile RLS pentru integrarea RetroOS 98 cu Supabase.

### Cum aplici schema și politicile
1. Deschide Supabase Dashboard → SQL Editor.
2. Rulează conținutul din `schema.sql` pentru a crea tabelele.
3. Rulează conținutul din `policies.sql` pentru a activa RLS și politicile de acces.
   - Alternativ, poți copia fișierele în migrațiile proiectului Supabase.

### Tabele
- `profiles` — profil minim pentru fiecare utilizator (`id` = `auth.users.id`, câmpuri `email`, `username`, timestamps).
- `notes` — notele personale legate de utilizator (`user_id` → `auth.users.id`, titlu și conținut text, timestamps).

### Endpoint REST folosit
- `POST/GET/PATCH/DELETE /rest/v1/notes` — API-ul REST Supabase pentru operațiile cu notele, protejat de RLS; necesită token-ul de acces al utilizatorului.
