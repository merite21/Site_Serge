/* Fonctions partagées entre la vitrine (index.html) et l'administration (admin.html). */
(function () {
  "use strict";

  const formatNombre = new Intl.NumberFormat("fr-FR");

  function formatPrix(montant, devise) {
    if (montant === null || montant === undefined || montant === "") return "—";
    return formatNombre.format(montant) + " " + (devise || "FCFA");
  }

  function echapper(texte) {
    return String(texte ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // Minuscules sans accents : « Électricité » et « electricite » se retrouvent à la recherche.
  function normaliser(texte) {
    return String(texte ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }

  function slug(texte) {
    return normaliser(texte).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return "";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  // « 5 sac » → « 5 sacs », « rouleau » → « rouleaux » ; les symboles (m², kg, L…) restent invariables.
  function pluriel(unite, quantite) {
    const u = String(unite ?? "");
    if (Number(quantite) < 2 || !/^[a-zà-ÿ]{3,}$/i.test(u) || /[sxz]$/i.test(u)) return u;
    return /(eau|au|eu)$/i.test(u) ? u + "x" : u + "s";
  }

  window.Commun = { formatPrix, echapper, normaliser, slug, formatDate, pluriel };
})();
