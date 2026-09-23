/* Vitrine publique : affiche le catalogue, gère recherche, filtres et liens partageables. */
(function () {
  "use strict";

  const { formatPrix, echapper, normaliser, formatDate, pluriel } = window.Commun;
  const data = window.CATALOGUE;
  const { boutique, categories, produits } = data;
  const categorieParId = Object.fromEntries(categories.map((c) => [c.id, c]));

  const el = {
    nom: document.getElementById("boutique-nom"),
    slogan: document.getElementById("boutique-slogan"),
    whatsapp: document.getElementById("lien-whatsapp"),
    appel: document.getElementById("lien-appel"),
    recherche: document.getElementById("recherche"),
    categories: document.getElementById("categories"),
    resultat: document.getElementById("resultat"),
    catalogue: document.getElementById("catalogue"),
    piedContact: document.getElementById("pied-contact"),
    piedMaj: document.getElementById("pied-maj"),
    toast: document.getElementById("toast"),
  };

  const params = new URLSearchParams(location.search);
  const ancreInitiale = decodeURIComponent(location.hash.slice(1));
  const etat = {
    categorie: categorieParId[params.get("cat")] ? params.get("cat") : "",
    recherche: params.get("q") || "",
  };

  /* ---------- Liens de contact ---------- */

  function lienWhatsApp(message) {
    const numero = String(boutique.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(message);
  }

  function lienProduit(p) {
    return location.origin + location.pathname + "?cat=" + encodeURIComponent(p.categorie) + "#" + encodeURIComponent(p.id);
  }

  function messageCommande(p) {
    return "Bonjour, je suis intéressé(e) par : " + p.nom +
      " (" + formatPrix(p.prixDetail, boutique.devise) + " / " + p.unite + ").\n" +
      "Quantité souhaitée : \n" + lienProduit(p);
  }

  /* ---------- En-tête et pied de page ---------- */

  function afficherBoutique() {
    document.title = boutique.nom + " — Catalogue";
    el.nom.textContent = boutique.nom;
    el.slogan.textContent = boutique.slogan || "";
    el.whatsapp.href = lienWhatsApp("Bonjour, je viens de consulter votre catalogue.");
    el.appel.href = "tel:" + String(boutique.telephone || "").replace(/\s/g, "");

    el.piedContact.innerHTML = [
      "<strong>" + echapper(boutique.nom) + "</strong>",
      boutique.adresse && "📍 " + echapper(boutique.adresse),
      boutique.telephone && "📞 " + echapper(boutique.telephone),
    ].filter(Boolean).join(" · ");
    if (boutique.miseAJour) {
      el.piedMaj.textContent = "Prix mis à jour le " + formatDate(boutique.miseAJour) + ". Prix susceptibles de varier, confirmez avant commande.";
    }
  }

  /* ---------- Filtres ---------- */

  function compterParCategorie() {
    const compte = {};
    for (const p of produits) compte[p.categorie] = (compte[p.categorie] || 0) + 1;
    return compte;
  }

  function afficherFiltres() {
    const compte = compterParCategorie();
    const puce = (id, libelle, nb) =>
      '<button type="button" class="puce' + (etat.categorie === id ? " puce--active" : "") +
      '" data-cat="' + echapper(id) + '" aria-pressed="' + (etat.categorie === id) + '">' +
      libelle + ' <span class="puce__nb">' + nb + "</span></button>";

    el.categories.innerHTML =
      puce("", "Tout", produits.length) +
      categories
        .filter((c) => compte[c.id])
        .map((c) => puce(c.id, echapper(c.icone || "") + " " + echapper(c.nom), compte[c.id]))
        .join("");
  }

  function produitsFiltres() {
    const termes = normaliser(etat.recherche).split(/\s+/).filter(Boolean);
    return produits.filter((p) => {
      if (etat.categorie && p.categorie !== etat.categorie) return false;
      if (!termes.length) return true;
      const cat = categorieParId[p.categorie];
      const texte = normaliser([p.nom, p.description, p.unite, cat && cat.nom].join(" "));
      return termes.every((t) => texte.includes(t));
    });
  }

  /* ---------- Cartes produits ---------- */

  function carteProduit(p) {
    const cat = categorieParId[p.categorie] || {};
    const devise = boutique.devise;
    const unite = echapper(p.unite || "unité");
    const visuel = p.image
      ? '<img src="' + echapper(p.image) + '" alt="' + echapper(p.nom) + '" loading="lazy">'
      : '<span class="carte__icone" aria-hidden="true">' + echapper(cat.icone || "📦") + "</span>";

    const aGros = p.prixGros !== null && p.prixGros !== undefined && p.prixGros !== "";
    const gros = aGros
      ? '<div class="prix prix--gros"><span class="prix__type">Gros</span>' +
        '<span class="prix__montant">' + formatPrix(p.prixGros, devise) + '<small> / ' + unite + "</small></span>" +
        (p.qteMinGros ? '<span class="prix__condition">dès ' + echapper(p.qteMinGros) + " " + echapper(pluriel(p.unite || "unité", p.qteMinGros)) + "</span>" : "") +
        "</div>"
      : '<div class="prix prix--gros prix--absent"><span class="prix__type">Gros</span><span class="prix__condition">Sur demande</span></div>';

    return (
      '<article class="carte' + (p.disponible === false ? " carte--rupture" : "") + '" id="' + echapper(p.id) + '">' +
        '<div class="carte__visuel">' + visuel +
          (p.disponible === false ? '<span class="badge badge--rupture">Rupture de stock</span>' : "") +
        "</div>" +
        '<div class="carte__corps">' +
          '<p class="carte__categorie">' + echapper(cat.nom || "") + "</p>" +
          '<h3 class="carte__nom">' + echapper(p.nom) + "</h3>" +
          (p.description ? '<p class="carte__description">' + echapper(p.description) + "</p>" : "") +
          '<div class="carte__prix">' +
            '<div class="prix prix--detail"><span class="prix__type">Détail</span>' +
            '<span class="prix__montant">' + formatPrix(p.prixDetail, devise) + "<small> / " + unite + "</small></span></div>" +
            gros +
          "</div>" +
          '<div class="carte__actions">' +
            '<a class="bouton bouton--whatsapp bouton--plein" href="' + echapper(lienWhatsApp(messageCommande(p))) + '" target="_blank" rel="noopener">Commander</a>' +
            '<button type="button" class="bouton bouton--icone" data-partager="' + echapper(p.id) + '" title="Copier le lien de cet article" aria-label="Partager ' + echapper(p.nom) + '">🔗</button>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function afficherCatalogue() {
    const liste = produitsFiltres();
    el.resultat.textContent = liste.length
      ? liste.length + " article" + (liste.length > 1 ? "s" : "")
      : "";

    if (!liste.length) {
      el.catalogue.innerHTML =
        '<div class="vide"><p>Aucun article ne correspond à votre recherche.</p>' +
        '<a class="bouton bouton--whatsapp" target="_blank" rel="noopener" href="' +
        echapper(lienWhatsApp("Bonjour, je cherche : " + etat.recherche)) +
        '">Demander sur WhatsApp</a></div>';
      return;
    }

    // Regroupe par catégorie, dans l'ordre défini dans le catalogue.
    el.catalogue.innerHTML = categories
      .map((c) => {
        const items = liste.filter((p) => p.categorie === c.id);
        if (!items.length) return "";
        return (
          '<section class="section" aria-labelledby="titre-' + echapper(c.id) + '">' +
            '<h2 class="section__titre" id="titre-' + echapper(c.id) + '"><span aria-hidden="true">' + echapper(c.icone || "") + "</span> " + echapper(c.nom) + "</h2>" +
            '<div class="grille">' + items.map(carteProduit).join("") + "</div>" +
          "</section>"
        );
      })
      .join("");
  }

  /* ---------- URL (liens à partager) ---------- */

  function majUrl() {
    const p = new URLSearchParams();
    if (etat.categorie) p.set("cat", etat.categorie);
    if (etat.recherche) p.set("q", etat.recherche);
    const qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  function rafraichir() {
    afficherFiltres();
    afficherCatalogue();
    majUrl();
  }

  /* ---------- Partage ---------- */

  let minuterieToast;
  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("toast--visible");
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(() => el.toast.classList.remove("toast--visible"), 2500);
  }

  async function partager(p) {
    const url = lienProduit(p);
    if (navigator.share) {
      try { await navigator.share({ title: p.nom, text: p.nom + " — " + formatPrix(p.prixDetail, boutique.devise), url }); return; }
      catch (e) { if (e.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Lien de l'article copié ✔");
    } catch {
      prompt("Copiez ce lien :", url);
    }
  }

  /* ---------- Événements ---------- */

  el.categories.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-cat]");
    if (!bouton) return;
    etat.categorie = bouton.dataset.cat;
    rafraichir();
    document.querySelector("main").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  let minuterieRecherche;
  el.recherche.addEventListener("input", () => {
    clearTimeout(minuterieRecherche);
    minuterieRecherche = setTimeout(() => {
      etat.recherche = el.recherche.value.trim();
      afficherCatalogue();
      majUrl();
    }, 150);
  });

  el.catalogue.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-partager]");
    if (!bouton) return;
    const p = produits.find((x) => x.id === bouton.dataset.partager);
    if (p) partager(p);
  });

  /* ---------- Démarrage ---------- */

  afficherBoutique();
  el.recherche.value = etat.recherche;
  rafraichir();

  // Lien direct vers un article (#id) : le mettre en évidence.
  if (ancreInitiale) {
    const cible = document.getElementById(ancreInitiale);
    if (cible) {
      cible.classList.add("carte--cible");
      setTimeout(() => cible.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }
})();
