#!/usr/bin/env node
/*
 * Génère supabase/seed.sql à partir de data/catalogue.js.
 * Usage : node outils/generer-seed.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "data", "catalogue.js"));
const { boutique, categories, produits } = window.CATALOGUE;

const q = (v) => (v === null || v === undefined || v === "" ? "null" : typeof v === "number" || typeof v === "boolean" ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");
const txt = (v) => "'" + String(v ?? "").replace(/'/g, "''") + "'";

const lignes = [
  "-- Catalogue de départ, généré par outils/generer-seed.js depuis data/catalogue.js.",
  "-- À exécuter après schema.sql. Ré-exécutable : met à jour les lignes existantes.",
  "begin;",
  "",
  `update public.boutique set nom = ${txt(boutique.nom)}, slogan = ${txt(boutique.slogan)}, whatsapp = ${txt(boutique.whatsapp)}, telephone = ${txt(boutique.telephone)}, adresse = ${txt(boutique.adresse)}, devise = ${txt(boutique.devise)} where id = 1;`,
  "",
  "insert into public.categories (id, nom, icone, ordre) values",
  categories.map((c, i) => `  (${txt(c.id)}, ${txt(c.nom)}, ${txt(c.icone)}, ${i})`).join(",\n"),
  "on conflict (id) do update set nom = excluded.nom, icone = excluded.icone, ordre = excluded.ordre;",
  "",
  "insert into public.produits (id, categorie_id, nom, description, unite, prix_detail, prix_gros, qte_min_gros, image, disponible, ordre) values",
  produits.map((p, i) => `  (${txt(p.id)}, ${txt(p.categorie)}, ${txt(p.nom)}, ${txt(p.description)}, ${txt(p.unite)}, ${q(p.prixDetail)}, ${q(p.prixGros)}, ${q(p.qteMinGros)}, ${txt(p.image)}, ${p.disponible !== false}, ${i})`).join(",\n"),
  "on conflict (id) do update set categorie_id = excluded.categorie_id, nom = excluded.nom, description = excluded.description, unite = excluded.unite,",
  "  prix_detail = excluded.prix_detail, prix_gros = excluded.prix_gros, qte_min_gros = excluded.qte_min_gros, image = excluded.image,",
  "  disponible = excluded.disponible, ordre = excluded.ordre;",
  "",
  "commit;",
  "",
];

fs.writeFileSync(path.join(__dirname, "..", "supabase", "seed.sql"), lignes.join("\n"));
console.log("supabase/seed.sql : " + categories.length + " catégories, " + produits.length + " articles.");
