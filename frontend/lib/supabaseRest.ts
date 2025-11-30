// REST helper layer for Supabase (notes CRUD)
// Uses fetch against Supabase REST API, authorized via user access token.

export async function restFetch(path: string, options: RequestInit = {}, accessToken: string | null = null) {
  const restUrl = process.env.NEXT_PUBLIC_SUPABASE_REST_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!restUrl || !anonKey) {
    throw new Error("Supabase REST env vars are missing. Set NEXT_PUBLIC_SUPABASE_REST_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const headers: Record<string, string> = {
    apikey: anonKey,
    Authorization: accessToken ? `Bearer ${accessToken}` : `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${restUrl}/${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`REST error ${response.status}: ${errorText || response.statusText}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const fetchNotes = (accessToken: string) =>
  restFetch("notes?select=*&order=created_at.desc", { method: "GET" }, accessToken);

export const createNote = (
  accessToken: string,
  payload: { title: string; content: string; user_id: string },
) => restFetch("notes", { method: "POST", body: JSON.stringify(payload) }, accessToken);

export const updateNote = (
  accessToken: string,
  id: string,
  payload: { title?: string; content?: string },
) => restFetch(`notes?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(payload) }, accessToken);

export const deleteNote = (accessToken: string, id: string) =>
  restFetch(`notes?id=eq.${id}`, { method: "DELETE" }, accessToken);
