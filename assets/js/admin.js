/* Administration : édition du catalogue dans le navigateur, puis export de data/catalogue.js. */
(function () {
  "use strict";

  const { echapper, normaliser, slug } = window.Commun;
  const CLE_BROUILLON = "catalogue-brouillon-v1";
  const original = JSON.stringify(window.CATALOGUE);

  let data = chargerBrouillon() || JSON.parse(original);

  const $ = (id) => document.getElementById(id);
  const el = {
    alerte: $("alerte-brouillon"),
    formBoutique: $("form-boutique"),
    categories: $("liste-categories"),
    produits: $("liste-produits"),
    compteur: $("compteur-articles"),
    filtreTexte: $("filtre-texte"),
    filtreCategorie: $("filtre-categorie"),
    dialog: $("dialog-produit"),
    dialogTitre: $("dialog-produit-titre"),
    formProduit: $("form-produit"),
    erreurProduit: $("erreur-produit"),
    toast: $("toast"),
  };

  /* ---------- Brouillon (localStorage) ---------- */

  function chargerBrouillon() {
    try {
      const brut = localStorage.getItem(CLE_BROUILLON);
      return brut ? JSON.parse(brut) : null;
    } catch { return null; }
  }

  function sauver() {
    const actuel = JSON.stringify(data);
    try {
      if (actuel === original) localStorage.removeItem(CLE_BROUILLON);
      else localStorage.setItem(CLE_BROUILLON, actuel);
    } catch { /* stockage indisponible : l'édition reste possible, sans reprise */ }
    el.alerte.hidden = actuel === original;
  }

  /* ---------- Utilitaires ---------- */

  let minuterieToast;
  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("toast--visible");
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(() => el.toast.classList.remove("toast--visible"), 2500);
  }

  function idUnique(base, existants) {
    const racine = slug(base) || "element";
    let id = racine, n = 2;
    while (existants.has(id)) id = racine + "-" + n++;
    return id;
  }

  function nombreOuNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  }

  function aujourdhui() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* ---------- Boutique ---------- */

  function afficherBoutique() {
    for (const champ of el.formBoutique.elements) {
      if (champ.name) champ.value = data.boutique[champ.name] ?? "";
    }
  }

  el.formBoutique.addEventListener("input", (e) => {
    if (!e.target.name) return;
    data.boutique[e.target.name] = e.target.value.trim();
    sauver();
  });

  /* ---------- Catégories ---------- */

  function afficherCategories() {
    const compte = {};
    for (const p of data.produits) compte[p.categorie] = (compte[p.categorie] || 0) + 1;

    el.categories.innerHTML = data.categories.map((c, i) =>
      '<div class="ligne-categorie" data-index="' + i + '">' +
        '<input class="ligne-categorie__icone" data-champ="icone" value="' + echapper(c.icone || "") + '" aria-label="Icône" maxlength="4">' +
        '<input class="ligne-categorie__nom" data-champ="nom" value="' + echapper(c.nom) + '" aria-label="Nom de la catégorie">' +
        '<span class="ligne-categorie__nb">' + (compte[c.id] || 0) + " article(s)</span>" +
        '<button type="button" class="bouton-mini" data-action="monter" ' + (i === 0 ? "disabled" : "") + ' aria-label="Monter">↑</button>' +
        '<button type="button" class="bouton-mini" data-action="descendre" ' + (i === data.categories.length - 1 ? "disabled" : "") + ' aria-label="Descendre">↓</button>' +
        '<button type="button" class="bouton-mini bouton-mini--danger" data-action="supprimer" aria-label="Supprimer">🗑</button>' +
      "</div>"
    ).join("");

    const choix = data.categories.map((c) => '<option value="' + echapper(c.id) + '">' + echapper(c.nom) + "</option>").join("");
    const selection = el.filtreCategorie.value;
    el.filtreCategorie.innerHTML = '<option value="">Toutes les catégories</option>' + choix;
    el.filtreCategorie.value = data.categories.some((c) => c.id === selection) ? selection : "";
    el.formProduit.elements.categorie.innerHTML = choix;
  }

  el.categories.addEventListener("input", (e) => {
    const ligne = e.target.closest("[data-index]");
    if (!ligne || !e.target.dataset.champ) return;
    data.categories[ligne.dataset.index][e.target.dataset.champ] = e.target.value;
    sauver();
  });

  // Rafraîchir les listes déroulantes une fois le nom saisi.
  el.categories.addEventListener("change", () => { afficherCategories(); afficherProduits(); });

  el.categories.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-action]");
    if (!bouton) return;
    const i = Number(bouton.closest("[data-index]").dataset.index);
    const cats = data.categories;

    if (bouton.dataset.action === "monter" && i > 0) [cats[i - 1], cats[i]] = [cats[i], cats[i - 1]];
    if (bouton.dataset.action === "descendre" && i < cats.length - 1) [cats[i + 1], cats[i]] = [cats[i], cats[i + 1]];
    if (bouton.dataset.action === "supprimer") {
      const nb = data.produits.filter((p) => p.categorie === cats[i].id).length;
      if (nb) { alert("Impossible : cette catégorie contient " + nb + " article(s). Déplacez-les ou supprimez-les d'abord."); return; }
      if (!confirm("Supprimer la catégorie « " + cats[i].nom + " » ?")) return;
      cats.splice(i, 1);
    }
    sauver();
    afficherCategories();
  });

  $("btn-ajout-categorie").addEventListener("click", () => {
    const nom = (prompt("Nom de la nouvelle catégorie (ex. Carrelage) :") || "").trim();
    if (!nom) return;
    const id = idUnique(nom, new Set(data.categories.map((c) => c.id)));
    data.categories.push({ id, nom, icone: "📦" });
    sauver();
    afficherCategories();
    toast("Catégorie ajoutée");
  });

  /* ---------- Articles ---------- */

  function produitsVisibles() {
    const termes = normaliser(el.filtreTexte.value).split(/\s+/).filter(Boolean);
    const cat = el.filtreCategorie.value;
    return data.produits.filter((p) =>
      (!cat || p.categorie === cat) &&
      termes.every((t) => normaliser(p.nom + " " + p.description).includes(t))
    );
  }

  function afficherProduits() {
    const nomsCat = Object.fromEntries(data.categories.map((c) => [c.id, c.nom]));
    const liste = produitsVisibles();
    el.compteur.textContent = "(" + data.produits.length + ")";

    el.produits.innerHTML = liste.length ? liste.map((p) =>
      '<tr data-id="' + echapper(p.id) + '"' + (p.disponible === false ? ' class="ligne--rupture"' : "") + ">" +
        '<td><button type="button" class="lien lien--fort" data-action="modifier">' + echapper(p.nom) + "</button>" +
          '<div class="aide">' + echapper(p.unite || "") + "</div></td>" +
        "<td>" + echapper(nomsCat[p.categorie] || "⚠️ sans catégorie") + "</td>" +
        '<td class="num"><input type="number" min="0" step="1" data-champ="prixDetail" value="' + (p.prixDetail ?? "") + '" aria-label="Prix détail"></td>' +
        '<td class="num"><input type="number" min="0" step="1" data-champ="prixGros" value="' + (p.prixGros ?? "") + '" placeholder="—" aria-label="Prix gros"></td>' +
        '<td class="num"><input type="number" min="1" step="1" data-champ="qteMinGros" value="' + (p.qteMinGros ?? "") + '" placeholder="—" aria-label="Quantité minimum gros"></td>' +
        '<td><input type="checkbox" data-champ="disponible"' + (p.disponible !== false ? " checked" : "") + ' aria-label="Disponible"></td>' +
        '<td class="actions">' +
          '<button type="button" class="bouton-mini" data-action="modifier" title="Modifier">✏️</button>' +
          '<button type="button" class="bouton-mini" data-action="dupliquer" title="Dupliquer">⧉</button>' +
          '<button type="button" class="bouton-mini bouton-mini--danger" data-action="supprimer" title="Supprimer">🗑</button>' +
        "</td>" +
      "</tr>"
    ).join("") : '<tr><td colspan="7" class="aide centre">Aucun article.</td></tr>';
  }

  // Modification rapide des prix et de la disponibilité directement dans le tableau.
  el.produits.addEventListener("change", (e) => {
    const champ = e.target.dataset.champ;
    const ligne = e.target.closest("[data-id]");
    if (!champ || !ligne) return;
    const p = data.produits.find((x) => x.id === ligne.dataset.id);
    if (champ === "disponible") {
      p.disponible = e.target.checked;
      ligne.classList.toggle("ligne--rupture", !p.disponible);
    } else {
      const v = nombreOuNull(e.target.value);
      if (champ === "prixDetail" && v === null) { e.target.value = p.prixDetail; toast("Le prix détail est obligatoire"); return; }
      p[champ] = v;
    }
    sauver();
    toast("✔ " + p.nom + " mis à jour");
  });

  el.produits.addEventListener("click", (e) => {
    const bouton = e.target.closest("[data-action]");
    if (!bouton) return;
    const id = bouton.closest("[data-id]").dataset.id;
    const index = data.produits.findIndex((x) => x.id === id);
    const p = data.produits[index];

    if (bouton.dataset.action === "modifier") ouvrirProduit(p);
    if (bouton.dataset.action === "dupliquer") {
      const copie = { ...p, nom: p.nom + " (copie)" };
      copie.id = idUnique(copie.nom, new Set(data.produits.map((x) => x.id)));
      data.produits.splice(index + 1, 0, copie);
      sauver();
      afficherProduits();
      ouvrirProduit(copie);
    }
    if (bouton.dataset.action === "supprimer" && confirm("Supprimer « " + p.nom + " » ?")) {
      data.produits.splice(index, 1);
      sauver();
      afficherProduits();
      afficherCategories();
    }
  });

  el.filtreTexte.addEventListener("input", afficherProduits);
  el.filtreCategorie.addEventListener("change", afficherProduits);

  /* ---------- Fenêtre d'édition ---------- */

  let enEdition = null; // null = nouvel article

  function ouvrirProduit(p) {
    enEdition = p;
    const f = el.formProduit.elements;
    el.dialogTitre.textContent = p ? "Modifier l'article" : "Nouvel article";
    f.nom.value = p ? p.nom : "";
    f.categorie.value = p ? p.categorie : (el.filtreCategorie.value || data.categories[0]?.id || "");
    f.description.value = p ? p.description || "" : "";
    f.unite.value = p ? p.unite || "" : "pièce";
    f.prixDetail.value = p ? p.prixDetail ?? "" : "";
    f.prixGros.value = p ? p.prixGros ?? "" : "";
    f.qteMinGros.value = p ? p.qteMinGros ?? "" : "";
    f.image.value = p ? p.image || "" : "";
    f.disponible.checked = p ? p.disponible !== false : true;
    el.erreurProduit.textContent = "";
    el.dialog.showModal();
    f.nom.focus();
  }

  $("btn-ajout-produit").addEventListener("click", () => {
    if (!data.categories.length) { alert("Créez d'abord une catégorie."); return; }
    ouvrirProduit(null);
  });

  el.dialog.querySelector("[data-fermer]").addEventListener("click", () => el.dialog.close());

  el.formProduit.addEventListener("submit", (e) => {
    const f = el.formProduit.elements;
    const valeurs = {
      nom: f.nom.value.trim(),
      categorie: f.categorie.value,
      description: f.description.value.trim(),
      unite: f.unite.value.trim() || "pièce",
      prixDetail: nombreOuNull(f.prixDetail.value),
      prixGros: nombreOuNull(f.prixGros.value),
      qteMinGros: nombreOuNull(f.qteMinGros.value),
      image: f.image.value.trim(),
      disponible: f.disponible.checked,
    };

    if (!valeurs.nom || valeurs.prixDetail === null) {
      e.preventDefault();
      el.erreurProduit.textContent = "Le nom et le prix détail sont obligatoires.";
      return;
    }
    if (valeurs.prixGros !== null && valeurs.prixGros > valeurs.prixDetail &&
        !confirm("Le prix de gros est plus élevé que le prix détail. Continuer quand même ?")) {
      e.preventDefault();
      return;
    }

    if (enEdition) {
      Object.assign(enEdition, valeurs);
    } else {
      const id = idUnique(valeurs.nom, new Set(data.produits.map((x) => x.id)));
      data.produits.push({ id, ...valeurs });
    }
    sauver();
    afficherProduits();
    afficherCategories();
    toast(enEdition ? "Article modifié" : "Article ajouté");
  });

  /* ---------- Export / import ---------- */

  function genererFichier() {
    data.boutique.miseAJour = aujourdhui();
    return [
      "/*",
      " * CATALOGUE DE LA BOUTIQUE — généré par admin.html le " + data.boutique.miseAJour + ".",
      " * Pour modifier : ouvrir admin.html, faire les changements, puis « Télécharger catalogue.js ».",
      " */",
      "window.CATALOGUE = " + JSON.stringify(data, null, 2) + ";",
      "",
    ].join("\n");
  }

  $("btn-exporter").addEventListener("click", () => {
    const erreurs = data.produits.filter((p) => !data.categories.some((c) => c.id === p.categorie));
    if (erreurs.length && !confirm(erreurs.length + " article(s) n'ont pas de catégorie valide et ne s'afficheront pas. Exporter quand même ?")) return;

    const blob = new Blob([genererFichier()], { type: "text/javascript;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "catalogue.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    sauver();
    toast("Fichier téléchargé — remplacez data/catalogue.js");
  });

  $("btn-importer").addEventListener("change", async (e) => {
    const fichier = e.target.files[0];
    e.target.value = "";
    if (!fichier) return;
    try {
      const texte = await fichier.text();
      const json = texte.slice(texte.indexOf("{", texte.indexOf("=") + 1), texte.lastIndexOf("}") + 1);
      const importe = JSON.parse(fichier.name.endsWith(".json") ? texte : json);
      if (!importe.boutique || !Array.isArray(importe.categories) || !Array.isArray(importe.produits)) throw new Error("format");
      if (!confirm("Remplacer le catalogue en cours d'édition par « " + fichier.name + " » ?")) return;
      data = importe;
      sauver();
      toutAfficher();
      toast("Catalogue chargé");
    } catch {
      alert("Ce fichier n'est pas un catalogue valide.");
    }
  });

  $("btn-annuler-brouillon").addEventListener("click", () => {
    if (!confirm("Annuler toutes les modifications non publiées ?")) return;
    data = JSON.parse(original);
    sauver();
    toutAfficher();
  });

  function toutAfficher() {
    afficherBoutique();
    afficherCategories();
    afficherProduits();
  }

  toutAfficher();
  sauver();
})();
