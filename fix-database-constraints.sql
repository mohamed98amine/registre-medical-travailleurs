USE registre_medical;

-- Supprimer les tables avec contraintes
DROP TABLE IF EXISTS visites;
DROP TABLE IF EXISTS employeurs;

-- Recréer la table employeurs sans contraintes
CREATE TABLE employeurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Recréer la table visites
CREATE TABLE visites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    statut VARCHAR(50) DEFAULT 'Planifiée',
    aptitude VARCHAR(50) DEFAULT NULL,
    employeur_id BIGINT,
    medecin_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employeur_id) REFERENCES employeurs(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Insérer des données de test
INSERT INTO employeurs (nom) VALUES 
('Entreprise ABC'),
('Société XYZ'),
('SARL Dupont');

INSERT INTO visites (type, date, heure, statut, aptitude, employeur_id, medecin_id) VALUES
('Périodique', '2025-09-20', '10:00:00', 'Planifiée', 'Apte', 1, 1),
('Embauche', '2025-09-21', '14:30:00', 'Planifiée', NULL, 2, 1),
('Contrôle', '2025-09-22', '09:15:00', 'Terminée', 'Apte', 1, 2);

-- Vérifier les données
SELECT 'Employeurs:' as table_name;
SELECT * FROM employeurs;

SELECT 'Visites:' as table_name;
SELECT * FROM visites;

SELECT 'Tables créées et données insérées avec succès!' as resultat;