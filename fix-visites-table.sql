-- Script pour corriger la table visites
-- Vérifier et corriger la structure de la table visites

USE registre_medical;

-- Vérifier la structure actuelle de la table
DESCRIBE visites;

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE visites ADD COLUMN IF NOT EXISTS type_visite VARCHAR(50) DEFAULT 'Périodique';
ALTER TABLE visites ADD COLUMN IF NOT EXISTS date_visite DATE;
ALTER TABLE visites ADD COLUMN IF NOT EXISTS heure_visite TIME;
ALTER TABLE visites ADD COLUMN IF NOT EXISTS statut VARCHAR(50) DEFAULT 'Prévue';
ALTER TABLE visites ADD COLUMN IF NOT EXISTS aptitude VARCHAR(50);
ALTER TABLE visites ADD COLUMN IF NOT EXISTS employeur_id BIGINT;
ALTER TABLE visites ADD COLUMN IF NOT EXISTS medecin_id BIGINT;

-- Vérifier la nouvelle structure
DESCRIBE visites;

-- Afficher quelques enregistrements pour vérifier
SELECT * FROM visites LIMIT 5;




