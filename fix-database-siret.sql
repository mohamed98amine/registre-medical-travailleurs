-- Script pour supprimer le champ SIRET de la table entreprises
-- Exécutez ce script dans MySQL après avoir arrêté le serveur backend

USE registre_medical;

-- Vérifier la structure actuelle de la table
DESCRIBE entreprises;

-- Supprimer la colonne siret si elle existe
ALTER TABLE entreprises DROP COLUMN IF EXISTS siret;

-- Vérifier la nouvelle structure
DESCRIBE entreprises;

-- Message de confirmation
SELECT 'Colonne SIRET supprimée de la table entreprises avec succès!' as message;