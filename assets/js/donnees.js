/*
 * Accès aux données du catalogue.
 * - Mode « fichier » (config.js vide) : lit window.CATALOGUE (data/catalogue.js).
 * - Mode « base de données » (config.js rempli) : lit et écrit dans Supabase.
 * La vitrine et le tableau de bord ne manipulent que le format « catalogue » (camelCase).
 */
(function () {
  "use strict";

  const CDN_SUPABASE = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
  const BUCKET_PHOTOS = "produits";
  const cfg = window.CONFIG || {};
  const enLigne = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);

  let promesseClient = null;

  function chargerScript(src) {
    return new Promise((resoudre, rejeter) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resoudre;
      s.onerror = () => rejeter(new Error("Impossible de charger " + src));
      document.head.appendChild(s);
    });
  }

  function client() {
    if (!enLigne) return Promise.reject(new Error("Base de données non configurée (assets/js/config.js)."));
    promesseClient ??= chargerScript(CDN_SUPABASE).then(() =>
      window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
    );
    return promesseClient;
  }

  // Les erreurs Supabase sont renvoyées dans { error } : on les transforme en exceptions.
  function verifier({ data, error }) {
    if (error) throw new Error(error.message || "Erreur de la base de données");
    return data;
  }

  /* ---------- Conversions base ⇄ catalogue ---------- */

  const versBoutique = (b) => ({
    nom: b.nom, slogan: b.slogan, whatsapp: b.whatsapp, telephone: b.telephone,
    adresse: b.adresse, devise: b.devise,
  });

  const versCategorie = (c) => ({ id: c.id, nom: c.nom, icone: c.icone });

  const versProduit = (p) => ({
    id: p.id, categorie: p.categorie_id, nom: p.nom, description: p.description, unite: p.unite,
    prixDetail: p.prix_detail, prixGros: p.prix_gros, qteMinGros: p.qte_min_gros,
    image: p.image, disponible: p.disponible,
  });

  // Ne convertit que les champs présents : permet les mises à jour partielles.
  const CHAMPS_PRODUIT = {
    id: "id", categorie: "categorie_id", nom: "nom", description: "description", unite: "unite",
    prixDetail: "prix_detail", prixGros: "prix_gros", qteMinGros: "qte_min_gros",
    image: "image", disponible: "disponible", ordre: "ordre",
  };
  function depuisProduit(p) {
    const ligne = {};
    for (const [cle, colonne] of Object.entries(CHAMPS_PRODUIT)) if (cle in p) ligne[colonne] = p[cle];
    return ligne;
  }

  /* ---------- Lecture ---------- */

  async function charger() {
    if (!enLigne) return structuredClone(window.CATALOGUE);

    const sb = await client();
    const [boutique, categories, produits] = await Promise.all([
      sb.from("boutique").select("*").eq("id", 1).single().then(verifier),
      sb.from("categories").select("*").order("ordre").order("nom").then(verifier),
      sb.from("produits").select("*").order("ordre").order("nom").then(verifier),
    ]);

    const dates = [boutique, ...categories, ...produits].map((x) => x.updated_at).filter(Boolean).sort();
    return {
      boutique: { ...versBoutique(boutique), miseAJour: (dates.at(-1) || "").slice(0, 10) },
      categories: categories.map(versCategorie),
      produits: produits.map(versProduit),
    };
  }

  /* ---------- Authentification ---------- */

  const auth = {
    async session() {
      const sb = await client();
      return verifier(await sb.auth.getSession()).session;
    },
    async connexion(email, motDePasse) {
      const sb = await client();
      const { error } = await sb.auth.signInWithPassword({ email, password: motDePasse });
      if (error) throw new Error(error.message === "Invalid login credentials" ? "E-mail ou mot de passe incorrect." : error.message);
    },
    async deconnexion() {
      const sb = await client();
      await sb.auth.signOut();
    },
    async estAdmin() {
      const sb = await client();
      return verifier(await sb.rpc("est_admin")) === true;
    },
  };

  /* ---------- Écriture (réservée aux admins, contrôlée par RLS) ---------- */

  const ecriture = {
    async boutique(champs) {
      const sb = await client();
      const { miseAJour, ...reste } = champs;
      verifier(await sb.from("boutique").update(reste).eq("id", 1));
    },
    async ajouterCategorie(c, ordre) {
      const sb = await client();
      verifier(await sb.from("categories").insert({ id: c.id, nom: c.nom, icone: c.icone, ordre }));
    },
    async modifierCategorie(id, champs) {
      const sb = await client();
      verifier(await sb.from("categories").update(champs).eq("id", id));
    },
    async supprimerCategorie(id) {
      const sb = await client();
      verifier(await sb.from("categories").delete().eq("id", id));
    },
    async ordreCategories(ids) {
      const sb = await client();
      await Promise.all(ids.map((id, ordre) => sb.from("categories").update({ ordre }).eq("id", id).then(verifier)));
    },
    async ajouterProduit(p, ordre) {
      const sb = await client();
      verifier(await sb.from("produits").insert(depuisProduit({ ...p, ordre })));
    },
    async modifierProduit(id, champs) {
      const sb = await client();
      verifier(await sb.from("produits").update(depuisProduit(champs)).eq("id", id));
    },
    async supprimerProduit(id) {
      const sb = await client();
      verifier(await sb.from("produits").delete().eq("id", id));
    },
    // Envoie une photo et renvoie son adresse publique.
    async photo(fichier, nomBase) {
      const sb = await client();
      const ext = (fichier.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const chemin = nomBase + "-" + Date.now() + "." + ext;
      verifier(await sb.storage.from(BUCKET_PHOTOS).upload(chemin, fichier, { cacheControl: "31536000", contentType: fichier.type }));
      return sb.storage.from(BUCKET_PHOTOS).getPublicUrl(chemin).data.publicUrl;
    },
  };

  window.Donnees = { enLigne, charger, auth, ecriture };
})();
