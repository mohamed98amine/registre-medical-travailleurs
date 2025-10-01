-- Script pour corriger la table employeurs
-- Supprime l'ancien champ 'active' et ajoute le champ 'statut' avec une valeur par défaut

-- Vérifier d'abord la structure actuelle de la table
DESCRIBE employeurs;

-- Supprimer le champ 'active' s'il existe
ALTER TABLE employeurs DROP COLUMN IF EXISTS active;

-- Ajouter le champ 'statut' s'il n'existe pas déjà
ALTER TABLE employeurs ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'Actif';

-- Mettre à jour les enregistrements existants pour avoir le statut 'Actif'
UPDATE employeurs SET statut = 'Actif' WHERE statut IS NULL;

-- Vérifier la nouvelle structure
DESCRIBE employeurs;

-- Afficher quelques enregistrements pour vérifier
SELECT * FROM employeurs LIMIT 5;