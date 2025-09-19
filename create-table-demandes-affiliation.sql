-- Script SQL pour créer la table demandes_affiliation
-- À exécuter dans votre base de données MySQL/PostgreSQL

CREATE TABLE IF NOT EXISTS demandes_affiliation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    raison_sociale VARCHAR(255) NOT NULL,
    numero_rccm VARCHAR(100) NOT NULL,
    secteur_activite VARCHAR(255) NOT NULL,
    effectif INT NOT NULL,
    adresse TEXT NOT NULL,
    representant_legal VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50) NOT NULL,
    contact_drh VARCHAR(255) NOT NULL,
    chiffre_affaire_annuel DECIMAL(15,2) NULL,
    statut ENUM('NOUVELLE', 'EN_COURS', 'VALIDEE', 'REJETEE') DEFAULT 'NOUVELLE',
    motif_rejet TEXT NULL,
    commentaires TEXT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    employeur_id BIGINT NOT NULL,
    directeur_regional_id BIGINT NULL,
    
    FOREIGN KEY (employeur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (directeur_regional_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_employeur (employeur_id),
    INDEX idx_directeur_regional (directeur_regional_id),
    INDEX idx_statut (statut),
    INDEX idx_date_creation (date_creation)
);

-- Insertion de données de test (optionnel)
INSERT IGNORE INTO demandes_affiliation (
    raison_sociale, 
    numero_rccm, 
    secteur_activite, 
    effectif, 
    adresse, 
    representant_legal, 
    email, 
    telephone, 
    contact_drh, 
    statut, 
    employeur_id, 
    directeur_regional_id
) VALUES (
    'SARL Test Entreprise',
    'BF-OUA-2024-TEST-001',
    'Industrie Manufacturière',
    25,
    '123 Avenue de la Paix, Ouagadougou',
    'Jean Dupont',
    'contact@test-entreprise.bf',
    '+226 25 30 40 50',
    'Marie Martin',
    'NOUVELLE',
    1, -- Remplacez par l'ID d'un employeur existant
    2  -- Remplacez par l'ID d'un directeur régional existant
);
