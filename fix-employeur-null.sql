-- Permettre employeur_id null dans la table entreprises
USE registre_medical;

-- Modifier la colonne pour permettre NULL
ALTER TABLE entreprises MODIFY COLUMN employeur_id BIGINT NULL;

-- Vérifier la modification
DESCRIBE entreprises;

SELECT 'Colonne employeur_id modifiée pour permettre NULL' as resultat;