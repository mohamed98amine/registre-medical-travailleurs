USE registre_medical;

-- Supprimer la colonne travailleur si elle existe
ALTER TABLE visites DROP COLUMN IF EXISTS travailleur;

-- Vérifier la structure de la table
DESCRIBE visites;

SELECT 'Table visites mise à jour - utilise employeur_id au lieu de travailleur' as resultat;