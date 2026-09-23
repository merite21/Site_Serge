/*
 * CONNEXION À LA BASE DE DONNÉES (Supabase)
 * -----------------------------------------
 * Laisser vide : le site lit data/catalogue.js (mode fichier, sans connexion).
 * Rempli : le site lit les articles en direct depuis Supabase, et le tableau de bord
 * (admin.html) enregistre chaque modification immédiatement, avec connexion par mot de passe.
 *
 * Valeurs à copier depuis Supabase → Project Settings → API.
 * La clé « anon / publishable » est faite pour être publique : la sécurité repose
 * sur les règles d'accès (RLS) définies dans supabase/schema.sql.
 */
window.CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
};
