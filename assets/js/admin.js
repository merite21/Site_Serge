/*
 * Tableau de bord administrateur.
 * - Mode base de données (config.js rempli) : connexion, chaque modification est enregistrée en ligne.
 * - Mode fichier : édition dans le navigateur (brouillon local) puis export de data/catalogue.js.
 * L'interface modifie toujours `data` en mémoire d'abord, puis persiste via enregistrer().
 */
(function () {
  "use strict";

  const { echapper, normaliser, slug } = window.Commun;
  const { enLigne, auth, ecriture } = window.Donnees;
  const CLE_BROUILLON = "catalogue-brouillon-v1";
  const original = JSON.stringify(window.CATALOGUE);

  let data = null;

  const $ = (id) => document.getElementById(id);
  const el = {
    ecranConnexion: $("ecran-connexion"),
    ecranEtat: $("ecran-etat"),
    ecranAdmin: $("ecran-admin"),
    messageEtat: $("message-etat"),
    formConnexion: $("form-connexion"),
    erreurConnexion: $("erreur-connexion"),
    deconnexion: $("btn-deconnexion"),
    bandeau: $("bandeau-en-ligne"),
    utilisateur: $("utilisateur"),
    indicateur: $("indicateur"),
    panneauFichier: $("panneau-fichier"),
    enteteBoutique: $("entete-boutique"),
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
    btnEnregistrer: $("btn-enregistrer-produit"),
    champPhotoFichier: $("champ-photo-fichier"),
    photoFichier: $("photo-fichier"),
    photoApercu: $("photo-apercu"),
    toast: $("toast"),
  };

  /* ---------- Écrans ---------- */

  function afficherEcran(nom) {
    el.ecranConnexion.hidden = nom !== "connexion";
    el.ecranEtat.hidden = nom !== "etat";
    el.ecranAdmin.hidden = nom !== "admin";
  }

  function afficherMessage(message) {
    el.messageEtat.textContent = message;
    afficherEcran("etat");
  }

  /* ---------- Notifications ---------- */

  let minuterieToast;
  function toast(message, erreur) {
    el.toast.textContent = message;
    el.toast.classList.toggle("toast--erreur", Boolean(erreur));
    el.toast.classList.add("toast--visible");
    clearTimeout(minuterieToast);
    minuterieToast = setTimeout(() => el.toast.classList.remove("toast--visible"), erreur ? 5000 : 2500);
  }

  /* ---------- Persistance ---------- */

  let enCours = 0;
  function indicateur(delta) {
    enCours += delta;
    el.indicateur.textContent = enCours > 0 ? "⏳ Enregistrement…" : "✔ Tout est enregistré";
  }

  // Mode fichier : met à jour le brouillon local. Mode en ligne : exécute l'écriture distante ;
  // en cas d'échec, recharge depuis la base pour annuler la modification affichée.
  async function enregistrer(actionDistante, message) {
    if (!enLigne) {
      sauverBrouillon();
      if (message) toast(message);
      return true;
    }
    indicateur(+1);
    try {
      await actionDistante();
      if (message) toast(message);
      return true;
    } catch (err) {
      toast("⚠️ Non enregistré : " + err.message, true);
      await recharger();
      return false;
    } finally {
      indicateur(-1);
    }
  }

  async function recharger() {
    try {
      data = await window.Donnees.charger();
      toutAfficher();
    } catch (err) {
      toast("⚠️ Impossible de recharger : " + err.message, true);
    }
  }

  function chargerBrouillon() {
    try {
      const brut = localStorage.getItem(CLE_BROUILLON);
      return brut ? JSON.parse(brut) : null;
    } catch { return null; }
  }

  function sauverBrouillon() {
    const actuel = JSON.stringify(data);
    try {
      if (actuel === original) localStorage.removeItem(CLE_BROUILLON);
      else localStorage.setItem(CLE_BROUILLON, actuel);
    } catch { /* stockage indisponible : l'édition reste possible, sans reprise */ }
    el.alerte.hidden = actuel === original;
  }

  /* ---------- Utilitaires ---------- */

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

  const aGros = (p) => p.prixGros !== null && p.prixGros !== undefined && p.prixGros !== "";

  /* ---------- Onglets ---------- */

  document.querySelector(".onglets").addEventListener("click", (e) => {
    const onglet = e.target.closest("[data-onglet]");
    if (!onglet) return;
    for (const o of document.querySelectorAll("[data-onglet]")) {
      const actif = o === onglet;
      o.classList.toggle("onglet--actif", actif);
      o.setAttribute("aria-selected", actif);
    }
    for (const p of document.querySelectorAll("[data-panneau]")) p.hidden = p.dataset.panneau !== onglet.dataset.onglet;
  });

  /* ---------- Statistiques ---------- */

  function afficherStats() {
    $("stat-articles").textContent = data.produits.length;
    $("stat-categories").textContent = data.categories.length;
    $("stat-rupture").textContent = data.produits.filter((p) => p.disponible === false).length;
    $("stat-sans-gros").textContent = data.produits.filter((p) => !aGros(p)).length;
    el.enteteBoutique.textContent = data.boutique.nom || "Gestion du catalogue";
  }

  /* ---------- Boutique ---------- */

  function afficherBoutique() {
    for (const champ of el.formBoutique.elements) {
      if (champ.name) champ.value = data.boutique[champ.name] ?? "";
    }
  }

  let minuterieBoutique;
  el.formBoutique.addEventListener("input", (e) => {
    if (!e.target.name) return;
    data.boutique[e.target.name] = e.target.value.trim();
    afficherStats();
    // Enregistre après une courte pause de frappe, pour ne pas écrire à chaque lettre.
    clearTimeout(minuterieBoutique);
    minuterieBoutique = setTimeout(() => enregistrer(() => ecriture.boutique(data.boutique), "Informations enregistrées"), 700);
  });

  /* ---------- Catégories ---------- */

  function afficherCategories() {
    const compte = {};
    for (const p of data.produits) compte[p.categorie] = (compte[p.categorie] || 0) + 1;

    el.categories.innerHTML = data.categories.length ? data.categories.map((c, i) =>
      '<div class="ligne-categorie" data-index="' + i + '">' +
        '<input class="ligne-categorie__icone" data-champ="icone" value="' + echapper(c.icone || "") + '" aria-label="Icône" maxlength="4">' +
        '<input class="ligne-categorie__nom" data-champ="nom" value="' + echapper(c.nom) + '" aria-label="Nom de la catégorie">' +
        '<span class="ligne-categorie__nb">' + (compte[c.id] || 0) + " article(s)</span>" +
        '<button type="button" class="bouton-mini" data-action="monter" ' + (i === 0 ? "disabled" : "") + ' aria-label="Monter">↑</button>' +
        '<button type="button" class="bouton-mini" data-action="descendre" ' + (i === data.categories.length - 1 ? "disabled" : "") + ' aria-label="Descendre">↓</button>' +
        '<button type="button" class="bouton-mini bouton-mini--danger" data-action="supprimer" aria-label="Supprimer">🗑</button>' +
      "</div>"
    ).join("") : '<p class="aide centre">Aucune catégorie. Créez-en une pour commencer.</p>';

    const choix = data.categories.map((c) => '<option value="' + echapper(c.id) + '">' + echapper(c.icone || "") + " " + echapper(c.nom) + "</option>").join("");
    const selection = el.filtreCategorie.value;
    el.filtreCategorie.innerHTML = '<option value="">Toutes les catégories</option>' + choix;
    el.filtreCategorie.value = data.categories.some((c) => c.id === selection) ? selection : "";
    el.formProduit.elements.categorie.innerHTML = choix;
  }

  el.categories.addEventListener("input", (e) => {
    const ligne = e.target.closest("[data-index]");
    if (!ligne || !e.target.dataset.champ) return;
    data.categories[ligne.dataset.index][e.target.dataset.champ] = e.target.value;
    if (!enLigne) sauverBrouillon();
  });

  // Une fois la saisie validée (sortie du champ) : enregistrer et rafraîchir les listes.
  el.categories.addEventListener("change", (e) => {
    const ligne = e.target.closest("[data-index]");
    if (!ligne || !e.target.dataset.champ) return;
    const c = data.categories[ligne.dataset.index];
    c.nom = c.nom.trim();
    if (!c.nom) { toast("Le nom de la catégorie est obligatoire", true); recharger(); return; }
    enregistrer(() => ecriture.modifierCategorie(c.id, { nom: c.nom, icone: c.icone }), "Catégorie enregistrée");
    afficherCategories();
    afficherProduits();
  });

  el.categories.addEventListener("click", async (e) => {
    const bouton = e.target.closest("[data-action]");
    if (!bouton) return;
    const i = Number(bouton.closest("[data-index]").dataset.index);
    const cats = data.categories;
    const action = bouton.dataset.action;

    if (action === "monter" || action === "descendre") {
      const j = action === "monter" ? i - 1 : i + 1;
      if (j < 0 || j >= cats.length) return;
      [cats[i], cats[j]] = [cats[j], cats[i]];
      afficherCategories();
      await enregistrer(() => ecriture.ordreCategories(cats.map((c) => c.id)));
      return;
    }

    if (action === "supprimer") {
      const nb = data.produits.filter((p) => p.categorie === cats[i].id).length;
      if (nb) { alert("Impossible : cette catégorie contient " + nb + " article(s). Déplacez-les ou supprimez-les d'abord."); return; }
      if (!confirm("Supprimer la catégorie « " + cats[i].nom + " » ?")) return;
      const [supprimee] = cats.splice(i, 1);
      toutAfficher();
      await enregistrer(() => ecriture.supprimerCategorie(supprimee.id), "Catégorie supprimée");
    }
  });

  $("btn-ajout-categorie").addEventListener("click", async () => {
    const nom = (prompt("Nom de la nouvelle catégorie (ex. Carrelage) :") || "").trim();
    if (!nom) return;
    const categorie = { id: idUnique(nom, new Set(data.categories.map((c) => c.id))), nom, icone: "📦" };
    data.categories.push(categorie);
    toutAfficher();
    await enregistrer(() => ecriture.ajouterCategorie(categorie, data.categories.length - 1), "Catégorie ajoutée");
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
    const cats = Object.fromEntries(data.categories.map((c) => [c.id, c]));
    const liste = produitsVisibles();
    el.compteur.textContent = "(" + data.produits.length + ")";

    el.produits.innerHTML = liste.length ? liste.map((p) => {
      const cat = cats[p.categorie];
      const vignette = p.image
        ? '<img class="vignette" src="' + echapper(p.image) + '" alt="" loading="lazy">'
        : '<span class="vignette vignette--icone" aria-hidden="true">' + echapper(cat?.icone || "📦") + "</span>";
      return '<tr data-id="' + echapper(p.id) + '"' + (p.disponible === false ? ' class="ligne--rupture"' : "") + ">" +
        '<td><div class="cellule-article">' + vignette + "<div>" +
          '<button type="button" class="lien lien--fort" data-action="modifier">' + echapper(p.nom) + "</button>" +
          '<div class="aide">' + echapper(p.unite || "") + "</div></div></div></td>" +
        "<td>" + (cat ? echapper(cat.nom) : "⚠️ sans catégorie") + "</td>" +
        '<td class="num"><input type="number" min="0" step="1" inputmode="numeric" data-champ="prixDetail" value="' + (p.prixDetail ?? "") + '" aria-label="Prix détail de ' + echapper(p.nom) + '"></td>' +
        '<td class="num"><input type="number" min="0" step="1" inputmode="numeric" data-champ="prixGros" value="' + (p.prixGros ?? "") + '" placeholder="—" aria-label="Prix gros de ' + echapper(p.nom) + '"></td>' +
        '<td class="num"><input type="number" min="1" step="1" inputmode="numeric" data-champ="qteMinGros" value="' + (p.qteMinGros ?? "") + '" placeholder="—" aria-label="Quantité minimum gros de ' + echapper(p.nom) + '"></td>' +
        '<td><input type="checkbox" data-champ="disponible"' + (p.disponible !== false ? " checked" : "") + ' aria-label="' + echapper(p.nom) + ' disponible"></td>' +
        '<td class="actions">' +
          '<button type="button" class="bouton-mini" data-action="modifier" title="Modifier">✏️</button>' +
          '<button type="button" class="bouton-mini" data-action="dupliquer" title="Dupliquer">⧉</button>' +
          '<button type="button" class="bouton-mini bouton-mini--danger" data-action="supprimer" title="Supprimer">🗑</button>' +
        "</td>" +
      "</tr>";
    }).join("") : '<tr><td colspan="7" class="aide centre">Aucun article.</td></tr>';

    afficherStats();
  }

  // Modification rapide des prix et de la disponibilité directement dans le tableau.
  el.produits.addEventListener("change", (e) => {
    const champ = e.target.dataset.champ;
    const ligne = e.target.closest("[data-id]");
    if (!champ || !ligne) return;
    const p = data.produits.find((x) => x.id === ligne.dataset.id);

    let valeur;
    if (champ === "disponible") {
      valeur = e.target.checked;
      ligne.classList.toggle("ligne--rupture", !valeur);
    } else {
      valeur = nombreOuNull(e.target.value);
      if (champ === "prixDetail" && valeur === null) { e.target.value = p.prixDetail; toast("Le prix détail est obligatoire", true); return; }
    }
    p[champ] = valeur;
    afficherStats();
    enregistrer(() => ecriture.modifierProduit(p.id, { [champ]: valeur }), "✔ " + p.nom + " mis à jour");
  });

  el.produits.addEventListener("click", async (e) => {
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
      afficherProduits();
      if (await enregistrer(() => ecriture.ajouterProduit(copie, data.produits.length), "Article dupliqué")) ouvrirProduit(copie);
    }

    if (bouton.dataset.action === "supprimer" && confirm("Supprimer « " + p.nom + " » ?")) {
      data.produits.splice(index, 1);
      toutAfficher();
      await enregistrer(() => ecriture.supprimerProduit(p.id), "Article supprimé");
    }
  });

  el.filtreTexte.addEventListener("input", afficherProduits);
  el.filtreCategorie.addEventListener("change", afficherProduits);

  /* ---------- Fenêtre d'édition ---------- */

  let enEdition = null; // null = nouvel article

  function apercuPhoto(url) {
    el.photoApercu.innerHTML = url ? '<img src="' + echapper(url) + '" alt="">' : "📷";
  }

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
    el.photoFichier.value = "";
    apercuPhoto(f.image.value);
    el.erreurProduit.textContent = "";
    el.btnEnregistrer.disabled = false;
    el.dialog.showModal();
    f.nom.focus();
  }

  $("btn-ajout-produit").addEventListener("click", () => {
    if (!data.categories.length) { alert("Créez d'abord une catégorie (onglet « Catégories »)."); return; }
    ouvrirProduit(null);
  });

  el.dialog.querySelector("[data-fermer]").addEventListener("click", () => el.dialog.close());
  el.formProduit.elements.image.addEventListener("input", (e) => apercuPhoto(e.target.value.trim()));

  // Envoi de photo (mode en ligne) : la photo est stockée dans Supabase, son adresse est remplie automatiquement.
  el.photoFichier.addEventListener("change", async () => {
    const fichier = el.photoFichier.files[0];
    if (!fichier) return;
    if (fichier.size > 5 * 1024 * 1024) { el.erreurProduit.textContent = "Photo trop lourde (5 Mo maximum)."; return; }
    el.btnEnregistrer.disabled = true;
    el.erreurProduit.textContent = "";
    el.photoApercu.textContent = "⏳";
    try {
      const nom = slug(el.formProduit.elements.nom.value) || "article";
      const url = await ecriture.photo(fichier, nom);
      el.formProduit.elements.image.value = url;
      apercuPhoto(url);
    } catch (err) {
      el.erreurProduit.textContent = "Envoi de la photo impossible : " + err.message;
      apercuPhoto(el.formProduit.elements.image.value);
    } finally {
      el.btnEnregistrer.disabled = false;
    }
  });

  el.formProduit.addEventListener("submit", async (e) => {
    e.preventDefault();
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

    if (!valeurs.nom || valeurs.prixDetail === null || !valeurs.categorie) {
      el.erreurProduit.textContent = "Le nom, la catégorie et le prix détail sont obligatoires.";
      return;
    }
    if (valeurs.prixGros !== null && valeurs.prixGros > valeurs.prixDetail &&
        !confirm("Le prix de gros est plus élevé que le prix détail. Continuer quand même ?")) {
      return;
    }

    el.btnEnregistrer.disabled = true;
    let ok;
    if (enEdition) {
      const cible = enEdition;
      Object.assign(cible, valeurs);
      ok = await enregistrer(() => ecriture.modifierProduit(cible.id, valeurs), "Article modifié");
    } else {
      const nouveau = { id: idUnique(valeurs.nom, new Set(data.produits.map((x) => x.id))), ...valeurs };
      data.produits.push(nouveau);
      ok = await enregistrer(() => ecriture.ajouterProduit(nouveau, data.produits.length), "Article ajouté");
    }
    el.btnEnregistrer.disabled = false;
    if (ok) el.dialog.close();
    toutAfficher();
  });

  /* ---------- Mode fichier : export / import ---------- */

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
    sauverBrouillon();
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
      sauverBrouillon();
      toutAfficher();
      toast("Catalogue chargé");
    } catch {
      alert("Ce fichier n'est pas un catalogue valide.");
    }
  });

  $("btn-annuler-brouillon").addEventListener("click", () => {
    if (!confirm("Annuler toutes les modifications non publiées ?")) return;
    data = JSON.parse(original);
    sauverBrouillon();
    toutAfficher();
  });

  /* ---------- Connexion (mode en ligne) ---------- */

  el.formConnexion.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = el.formConnexion.elements;
    const bouton = el.formConnexion.querySelector("button[type=submit]");
    bouton.disabled = true;
    el.erreurConnexion.textContent = "";
    try {
      await auth.connexion(f.email.value.trim(), f.motDePasse.value);
      f.motDePasse.value = "";
      await demarrer();
    } catch (err) {
      el.erreurConnexion.textContent = err.message;
    } finally {
      bouton.disabled = false;
    }
  });

  el.deconnexion.addEventListener("click", async () => {
    await auth.deconnexion();
    data = null;
    el.deconnexion.hidden = true;
    afficherEcran("connexion");
  });

  /* ---------- Démarrage ---------- */

  function toutAfficher() {
    afficherBoutique();
    afficherCategories();
    afficherProduits();
  }

  async function demarrer() {
    el.panneauFichier.hidden = enLigne;
    el.bandeau.hidden = !enLigne;
    el.champPhotoFichier.hidden = !enLigne;

    if (!enLigne) {
      data = chargerBrouillon() || JSON.parse(original);
      toutAfficher();
      sauverBrouillon();
      afficherEcran("admin");
      return;
    }

    try {
      afficherMessage("Chargement…");
      const session = await auth.session();
      if (!session) { afficherEcran("connexion"); return; }
      if (!(await auth.estAdmin())) {
        await auth.deconnexion();
        el.erreurConnexion.textContent = "Ce compte n'a pas les droits administrateur.";
        afficherEcran("connexion");
        return;
      }
      el.utilisateur.textContent = session.user.email;
      el.deconnexion.hidden = false;
      data = await window.Donnees.charger();
      toutAfficher();
      indicateur(0);
      afficherEcran("admin");
    } catch (err) {
      afficherMessage("⚠️ Connexion à la base impossible : " + err.message + ". Vérifiez votre connexion internet puis rechargez la page.");
    }
  }

  demarrer();
})();
