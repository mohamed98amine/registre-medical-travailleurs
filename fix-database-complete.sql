-- Script de réparation complète de la base de données
-- Exécutez ce script dans MySQL

USE registre_medical;

-- 1. Vérifier si la table demandes_affiliation existe
SHOW TABLES LIKE 'demandes_affiliation';

-- 2. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS demandes_affiliation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom_entreprise VARCHAR(255) NOT NULL,
    raison_sociale VARCHAR(255) NOT NULL,
    secteur_activite VARCHAR(255) NOT NULL,
    adresse_siege VARCHAR(500) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    code_postal VARCHAR(20),
    pays VARCHAR(100) DEFAULT 'Burkina Faso',
    
    -- Informations de contact
    nom_contact VARCHAR(255) NOT NULL,
    prenom_contact VARCHAR(255) NOT NULL,
    telephone_contact VARCHAR(50) NOT NULL,
    email_contact VARCHAR(255) NOT NULL,
    fonction_contact VARCHAR(255),
    
    -- Informations financières
    chiffre_affaires DECIMAL(15,2),
    nombre_employes INT,
    capital_social DECIMAL(15,2),
    statut_juridique VARCHAR(100),
    
    -- Statut et dates
    statut VARCHAR(50) DEFAULT 'NOUVELLE',
    motif_rejet TEXT,
    commentaires TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Relations
    employeur_id BIGINT,
    directeur_regional_id BIGINT,
    
    -- Index
    INDEX idx_employeur (employeur_id),
    INDEX idx_directeur (directeur_regional_id),
    INDEX idx_statut (statut),
    INDEX idx_date_creation (date_creation),
    
    -- Contraintes
    FOREIGN KEY (employeur_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (directeur_regional_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Vérifier la structure de la table
DESCRIBE demandes_affiliation;

-- 4. Vérifier les données existantes
SELECT COUNT(*) as nombre_demandes FROM demandes_affiliation;

-- 5. Vérifier les utilisateurs existants
SELECT id, email, role FROM users WHERE role IN ('EMPLOYEUR', 'DIRECTEUR_REGIONAL');

-- 6. Message de confirmation
SELECT 'Table demandes_affiliation créée/réparée avec succès!' as message;
