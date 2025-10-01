USE registre_medical;

-- Table employeurs
CREATE TABLE IF NOT EXISTS employeurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Table visites avec structure simplifiée
DROP TABLE IF EXISTS visites;
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

SELECT 'Tables créées avec succès!' as resultat;