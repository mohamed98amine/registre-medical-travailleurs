USE registre_medical;

-- Supprimer toutes les contraintes et tables
DROP TABLE IF EXISTS visites;
DROP TABLE IF EXISTS employeurs;

-- Créer table employeurs simple
CREATE TABLE employeurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Créer table visites sans contraintes d'abord
CREATE TABLE visites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    statut VARCHAR(50) DEFAULT 'Planifiée',
    aptitude VARCHAR(50) DEFAULT NULL,
    employeur_id BIGINT,
    medecin_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les employeurs d'abord
INSERT INTO employeurs (nom) VALUES 
('Entreprise ABC'),
('Société XYZ'),
('SARL Dupont');

-- Vérifier que les employeurs sont insérés
SELECT 'Employeurs insérés:' as status;
SELECT * FROM employeurs;

-- Insérer les visites (sans vérifier les médecins pour l'instant)
INSERT INTO visites (type, date, heure, statut, aptitude, employeur_id, medecin_id) VALUES
('Périodique', '2025-09-20', '10:00:00', 'Planifiée', 'Apte', 1, 1),
('Embauche', '2025-09-21', '14:30:00', 'Planifiée', NULL, 2, 1),
('Contrôle', '2025-09-22', '09:15:00', 'Terminée', 'Apte', 1, 1);

-- Vérifier les visites
SELECT 'Visites insérées:' as status;
SELECT * FROM visites;

SELECT 'Setup terminé avec succès!' as resultat;