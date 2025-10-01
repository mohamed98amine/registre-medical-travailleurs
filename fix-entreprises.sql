-- Suppression et recréation de la table entreprises
USE registre_medical;

-- Supprimer la table entreprises
DROP TABLE IF EXISTS entreprises;

-- Recréer la table entreprises avec une structure simple
CREATE TABLE entreprises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse VARCHAR(500) NOT NULL,
    ville VARCHAR(100) DEFAULT 'Ouagadougou',
    code_postal VARCHAR(20) DEFAULT '01 BP',
    telephone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    secteur_activite VARCHAR(255),
    effectif INT,
    zone_affectation VARCHAR(255),
    latitude DOUBLE,
    longitude DOUBLE,
    adresse_complete VARCHAR(500),
    coordinates_verified BOOLEAN DEFAULT FALSE,
    zone_medicale_id BIGINT,
    employeur_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vérifier que la table est créée
DESCRIBE entreprises;

SELECT 'Table entreprises recréée avec succès!' as resultat;