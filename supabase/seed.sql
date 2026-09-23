-- Catalogue de départ, généré par outils/generer-seed.js depuis data/catalogue.js.
-- À exécuter après schema.sql. Ré-exécutable : met à jour les lignes existantes.
begin;

update public.boutique set nom = 'Ets Serge & Fils', slogan = 'Électroménager, matériaux de construction et électricité — vente en gros et en détail', whatsapp = '22900000000', telephone = '+229 00 00 00 00', adresse = 'Cotonou, Bénin', devise = 'FCFA' where id = 1;

insert into public.categories (id, nom, icone, ordre) values
  ('electromenager', 'Électroménager', '🧊', 0),
  ('ciment', 'Ciment & Maçonnerie', '🧱', 1),
  ('electricite', 'Électricité', '💡', 2),
  ('plomberie', 'Plomberie', '🚰', 3),
  ('fer', 'Fer & Acier', '🔩', 4),
  ('peinture', 'Peinture', '🎨', 5),
  ('quincaillerie', 'Quincaillerie & Outillage', '🛠️', 6)
on conflict (id) do update set nom = excluded.nom, icone = excluded.icone, ordre = excluded.ordre;

insert into public.produits (id, categorie_id, nom, description, unite, prix_detail, prix_gros, qte_min_gros, image, disponible, ordre) values
  ('refrigerateur-200l', 'electromenager', 'Réfrigérateur 200 L', 'Double porte, classe A+, garantie 1 an.', 'pièce', 185000, 172000, 5, '', true, 0),
  ('congelateur-300l', 'electromenager', 'Congélateur coffre 300 L', 'Idéal commerce et boissons.', 'pièce', 230000, 215000, 3, '', true, 1),
  ('ventilateur-pied', 'electromenager', 'Ventilateur sur pied 16"', '3 vitesses, oscillation.', 'pièce', 17500, 15000, 10, '', true, 2),
  ('climatiseur-12000', 'electromenager', 'Climatiseur split 12 000 BTU', 'Livré avec kit d''installation.', 'pièce', 245000, null, null, '', true, 3),
  ('televiseur-43', 'electromenager', 'Téléviseur LED 43"', 'Smart TV, HDMI x3.', 'pièce', 150000, 140000, 5, '', false, 4),
  ('ciment-cpj35', 'ciment', 'Ciment CPJ 35', 'Sac de 50 kg.', 'sac', 5200, 4900, 50, '', true, 5),
  ('ciment-cpj45', 'ciment', 'Ciment CPJ 45', 'Sac de 50 kg, haute résistance.', 'sac', 5600, 5300, 50, '', true, 6),
  ('brique-15', 'ciment', 'Brique creuse de 15', 'Agglo standard.', 'pièce', 350, 300, 500, '', true, 7),
  ('carreau-60', 'ciment', 'Carreaux sol 60x60', 'Grès cérame, finition brillante.', 'm²', 7500, 6800, 50, '', true, 8),
  ('cable-2-5', 'electricite', 'Câble électrique 2,5 mm²', 'Rouleau de 100 m.', 'rouleau', 22000, 20000, 10, '', true, 9),
  ('cable-1-5', 'electricite', 'Câble électrique 1,5 mm²', 'Rouleau de 100 m.', 'rouleau', 15000, 13500, 10, '', true, 10),
  ('ampoule-led-12w', 'electricite', 'Ampoule LED 12 W', 'Culot E27, lumière blanche.', 'pièce', 1000, 750, 50, '', true, 11),
  ('disjoncteur-20a', 'electricite', 'Disjoncteur 20 A', 'Modulaire, unipolaire + neutre.', 'pièce', 3500, 3000, 20, '', true, 12),
  ('prise-double', 'electricite', 'Prise double encastrée', 'Avec terre, blanche.', 'pièce', 1500, 1200, 24, '', true, 13),
  ('tuyau-pvc-100', 'plomberie', 'Tuyau PVC Ø100', 'Barre de 4 m, évacuation.', 'barre', 6500, 6000, 20, '', true, 14),
  ('robinet-laiton', 'plomberie', 'Robinet laiton 1/2"', 'Robinet de puisage.', 'pièce', 3000, 2500, 12, '', true, 15),
  ('fer-10', 'fer', 'Fer à béton de 10', 'Barre de 12 m.', 'barre', 4200, 3900, 100, '', true, 16),
  ('fer-12', 'fer', 'Fer à béton de 12', 'Barre de 12 m.', 'barre', 6000, 5600, 100, '', true, 17),
  ('tole-bac', 'fer', 'Tôle bac alu', 'Longueur 3 m.', 'feuille', 5500, 5100, 50, '', true, 18),
  ('peinture-eau-25', 'peinture', 'Peinture à eau blanche', 'Seau de 25 kg, intérieur/extérieur.', 'seau', 18000, 16500, 10, '', true, 19),
  ('peinture-huile-4', 'peinture', 'Peinture à huile (glycéro)', 'Pot de 4 L, plusieurs couleurs.', 'pot', 9500, 8800, 12, '', true, 20),
  ('pointe-7cm', 'quincaillerie', 'Pointes 7 cm', 'Carton de 25 kg.', 'carton', 21000, 19500, 10, '', true, 21),
  ('brouette', 'quincaillerie', 'Brouette renforcée', 'Cuve 90 L, roue gonflable.', 'pièce', 27000, 24500, 5, '', true, 22)
on conflict (id) do update set categorie_id = excluded.categorie_id, nom = excluded.nom, description = excluded.description, unite = excluded.unite,
  prix_detail = excluded.prix_detail, prix_gros = excluded.prix_gros, qte_min_gros = excluded.qte_min_gros, image = excluded.image,
  disponible = excluded.disponible, ordre = excluded.ordre;

commit;
