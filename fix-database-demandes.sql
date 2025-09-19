-- Script pour diagnostiquer et corriger la base de données
-- Exécutez ces commandes dans votre base de données

-- 1. Vérifier si la table existe
SHOW TABLES LIKE 'demandes_affiliation';

-- 2. Vérifier la structure de la table
DESCRIBE demandes_affiliation;

-- 3. Vérifier les utilisateurs existants
SELECT id, nom, email, role FROM users WHERE role = 'EMPLOYEUR' LIMIT 5;
SELECT id, nom, email, role FROM users WHERE role = 'DIRECTEUR_REGIONAL' LIMIT 5;

-- 4. Créer la table si elle n'existe pas
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

-- 5. Vérifier les contraintes
SELECT 
    CONSTRAINT_NAME, 
    CONSTRAINT_TYPE, 
    TABLE_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'demandes_affiliation';

-- 6. Créer un utilisateur directeur régional de test si nécessaire
INSERT IGNORE INTO users (
    nom, 
    prenom, 
    email, 
    password, 
    role, 
    telephone, 
    created_at
) VALUES (
    'Directeur', 
    'Test', 
    'directeur@test.com', 
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', -- password123
    'DIRECTEUR_REGIONAL', 
    '+22612345678',
    NOW()
);

-- 7. Créer une demande de test
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
    (SELECT id FROM users WHERE role = 'EMPLOYEUR' LIMIT 1),
    (SELECT id FROM users WHERE role = 'DIRECTEUR_REGIONAL' LIMIT 1)
);

-- 8. Vérifier les données
SELECT 
    d.id,
    d.raison_sociale,
    d.statut,
    u.nom as employeur_nom,
    dr.nom as directeur_nom
FROM demandes_affiliation d
LEFT JOIN users u ON d.employeur_id = u.id
LEFT JOIN users dr ON d.directeur_regional_id = dr.id;
