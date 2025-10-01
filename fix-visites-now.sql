-- Script pour corriger la table visites
USE registre_medical;

-- Supprimer la table visites si elle existe et la recréer
DROP TABLE IF EXISTS visites;

-- Créer la table visites avec la bonne structure
CREATE TABLE visites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_visite VARCHAR(50) DEFAULT 'Périodique',
    date_visite DATE,
    heure_visite TIME,
    statut VARCHAR(50) DEFAULT 'Prévue',
    aptitude VARCHAR(50),
    employeur_id BIGINT,
    medecin_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employeur_id) REFERENCES employeurs(id),
    FOREIGN KEY (medecin_id) REFERENCES medecins(id)
);

-- Vérifier la structure
DESCRIBE visites;

-- Afficher un message de confirmation
SELECT 'Table visites créée avec succès!' as message;