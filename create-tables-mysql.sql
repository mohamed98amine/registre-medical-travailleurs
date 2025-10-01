-- Création des tables pour stocker les données en MySQL
USE registre_medical;

-- Table des médecins
CREATE TABLE IF NOT EXISTS medecins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(50),
    specialite VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Modifier la table entreprises pour s'assurer qu'elle est correcte
ALTER TABLE entreprises MODIFY COLUMN employeur_id BIGINT NULL;

-- Vérifier les tables
DESCRIBE medecins;
DESCRIBE entreprises;
DESCRIBE users;

SELECT 'Tables créées avec succès pour stockage MySQL!' as resultat;