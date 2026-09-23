/*
 * CATALOGUE DE LA BOUTIQUE
 * ------------------------
 * Ce fichier contient TOUTES les informations affichées sur le site.
 * Le plus simple pour le modifier : ouvrir « admin.html », faire les changements,
 * puis cliquer sur « Télécharger catalogue.js » et remplacer ce fichier.
 *
 * Prix : nombres entiers, sans espace ni devise (ex. 5500).
 * prixGros / qteMinGros : laisser à null si l'article n'est pas vendu en gros.
 * image : chemin vers une photo (ex. "images/frigo.jpg") ou lien internet ; vide = icône de la catégorie.
 */
window.CATALOGUE = {
  "boutique": {
    "nom": "Ets Serge & Fils",
    "slogan": "Électroménager, matériaux de construction et électricité — vente en gros et en détail",
    "whatsapp": "22900000000",
    "telephone": "+229 00 00 00 00",
    "adresse": "Cotonou, Bénin",
    "devise": "FCFA",
    "miseAJour": "2026-09-23"
  },
  "categories": [
    { "id": "electromenager", "nom": "Électroménager", "icone": "🧊" },
    { "id": "ciment", "nom": "Ciment & Maçonnerie", "icone": "🧱" },
    { "id": "electricite", "nom": "Électricité", "icone": "💡" },
    { "id": "plomberie", "nom": "Plomberie", "icone": "🚰" },
    { "id": "fer", "nom": "Fer & Acier", "icone": "🔩" },
    { "id": "peinture", "nom": "Peinture", "icone": "🎨" },
    { "id": "quincaillerie", "nom": "Quincaillerie & Outillage", "icone": "🛠️" }
  ],
  "produits": [
    { "id": "refrigerateur-200l", "categorie": "electromenager", "nom": "Réfrigérateur 200 L", "description": "Double porte, classe A+, garantie 1 an.", "unite": "pièce", "prixDetail": 185000, "prixGros": 172000, "qteMinGros": 5, "image": "", "disponible": true },
    { "id": "congelateur-300l", "categorie": "electromenager", "nom": "Congélateur coffre 300 L", "description": "Idéal commerce et boissons.", "unite": "pièce", "prixDetail": 230000, "prixGros": 215000, "qteMinGros": 3, "image": "", "disponible": true },
    { "id": "ventilateur-pied", "categorie": "electromenager", "nom": "Ventilateur sur pied 16\"", "description": "3 vitesses, oscillation.", "unite": "pièce", "prixDetail": 17500, "prixGros": 15000, "qteMinGros": 10, "image": "", "disponible": true },
    { "id": "climatiseur-12000", "categorie": "electromenager", "nom": "Climatiseur split 12 000 BTU", "description": "Livré avec kit d'installation.", "unite": "pièce", "prixDetail": 245000, "prixGros": null, "qteMinGros": null, "image": "", "disponible": true },
    { "id": "televiseur-43", "categorie": "electromenager", "nom": "Téléviseur LED 43\"", "description": "Smart TV, HDMI x3.", "unite": "pièce", "prixDetail": 150000, "prixGros": 140000, "qteMinGros": 5, "image": "", "disponible": false },

    { "id": "ciment-cpj35", "categorie": "ciment", "nom": "Ciment CPJ 35", "description": "Sac de 50 kg.", "unite": "sac", "prixDetail": 5200, "prixGros": 4900, "qteMinGros": 50, "image": "", "disponible": true },
    { "id": "ciment-cpj45", "categorie": "ciment", "nom": "Ciment CPJ 45", "description": "Sac de 50 kg, haute résistance.", "unite": "sac", "prixDetail": 5600, "prixGros": 5300, "qteMinGros": 50, "image": "", "disponible": true },
    { "id": "brique-15", "categorie": "ciment", "nom": "Brique creuse de 15", "description": "Agglo standard.", "unite": "pièce", "prixDetail": 350, "prixGros": 300, "qteMinGros": 500, "image": "", "disponible": true },
    { "id": "carreau-60", "categorie": "ciment", "nom": "Carreaux sol 60x60", "description": "Grès cérame, finition brillante.", "unite": "m²", "prixDetail": 7500, "prixGros": 6800, "qteMinGros": 50, "image": "", "disponible": true },

    { "id": "cable-2-5", "categorie": "electricite", "nom": "Câble électrique 2,5 mm²", "description": "Rouleau de 100 m.", "unite": "rouleau", "prixDetail": 22000, "prixGros": 20000, "qteMinGros": 10, "image": "", "disponible": true },
    { "id": "cable-1-5", "categorie": "electricite", "nom": "Câble électrique 1,5 mm²", "description": "Rouleau de 100 m.", "unite": "rouleau", "prixDetail": 15000, "prixGros": 13500, "qteMinGros": 10, "image": "", "disponible": true },
    { "id": "ampoule-led-12w", "categorie": "electricite", "nom": "Ampoule LED 12 W", "description": "Culot E27, lumière blanche.", "unite": "pièce", "prixDetail": 1000, "prixGros": 750, "qteMinGros": 50, "image": "", "disponible": true },
    { "id": "disjoncteur-20a", "categorie": "electricite", "nom": "Disjoncteur 20 A", "description": "Modulaire, unipolaire + neutre.", "unite": "pièce", "prixDetail": 3500, "prixGros": 3000, "qteMinGros": 20, "image": "", "disponible": true },
    { "id": "prise-double", "categorie": "electricite", "nom": "Prise double encastrée", "description": "Avec terre, blanche.", "unite": "pièce", "prixDetail": 1500, "prixGros": 1200, "qteMinGros": 24, "image": "", "disponible": true },

    { "id": "tuyau-pvc-100", "categorie": "plomberie", "nom": "Tuyau PVC Ø100", "description": "Barre de 4 m, évacuation.", "unite": "barre", "prixDetail": 6500, "prixGros": 6000, "qteMinGros": 20, "image": "", "disponible": true },
    { "id": "robinet-laiton", "categorie": "plomberie", "nom": "Robinet laiton 1/2\"", "description": "Robinet de puisage.", "unite": "pièce", "prixDetail": 3000, "prixGros": 2500, "qteMinGros": 12, "image": "", "disponible": true },

    { "id": "fer-10", "categorie": "fer", "nom": "Fer à béton de 10", "description": "Barre de 12 m.", "unite": "barre", "prixDetail": 4200, "prixGros": 3900, "qteMinGros": 100, "image": "", "disponible": true },
    { "id": "fer-12", "categorie": "fer", "nom": "Fer à béton de 12", "description": "Barre de 12 m.", "unite": "barre", "prixDetail": 6000, "prixGros": 5600, "qteMinGros": 100, "image": "", "disponible": true },
    { "id": "tole-bac", "categorie": "fer", "nom": "Tôle bac alu", "description": "Longueur 3 m.", "unite": "feuille", "prixDetail": 5500, "prixGros": 5100, "qteMinGros": 50, "image": "", "disponible": true },

    { "id": "peinture-eau-25", "categorie": "peinture", "nom": "Peinture à eau blanche", "description": "Seau de 25 kg, intérieur/extérieur.", "unite": "seau", "prixDetail": 18000, "prixGros": 16500, "qteMinGros": 10, "image": "", "disponible": true },
    { "id": "peinture-huile-4", "categorie": "peinture", "nom": "Peinture à huile (glycéro)", "description": "Pot de 4 L, plusieurs couleurs.", "unite": "pot", "prixDetail": 9500, "prixGros": 8800, "qteMinGros": 12, "image": "", "disponible": true },

    { "id": "pointe-7cm", "categorie": "quincaillerie", "nom": "Pointes 7 cm", "description": "Carton de 25 kg.", "unite": "carton", "prixDetail": 21000, "prixGros": 19500, "qteMinGros": 10, "image": "", "disponible": true },
    { "id": "brouette", "categorie": "quincaillerie", "nom": "Brouette renforcée", "description": "Cuve 90 L, roue gonflable.", "unite": "pièce", "prixDetail": 27000, "prixGros": 24500, "qteMinGros": 5, "image": "", "disponible": true }
  ]
};
