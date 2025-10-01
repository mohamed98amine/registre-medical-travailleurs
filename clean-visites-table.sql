USE registre_medical;

-- Supprimer la table visites existante avec ses contraintes
DROP TABLE IF EXISTS visites;

-- Recréer la table visites avec la structure correcte
CREATE TABLE visites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    statut VARCHAR(255) NOT NULL DEFAULT 'Prévue',
    aptitude VARCHAR(255),
    employeur_id BIGINT,
    medecin_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employeur_id) REFERENCES employeurs(id),
    FOREIGN KEY (medecin_id) REFERENCES medecins(id)
);

-- Insérer quelques données de test
INSERT INTO visites (type, date, heure, statut, aptitude, employeur_id, medecin_id) VALUES
('VMA', '2025-09-21', '09:00:00', 'Prévue', NULL, 1, 1),
('VPC', '2025-09-22', '14:30:00', 'Prévue', NULL, 2, 2),
('VRE', '2025-09-23', '10:15:00', 'Terminée', 'Apte', 3, 1);

-- Vérifier les données
SELECT 'Structure de la table visites:' as info;
DESCRIBE visites;

SELECT 'Données dans visites:' as info;
SELECT v.id, v.type, v.date, v.heure, v.statut, v.aptitude,
       e.nom as employeur_nom, m.nom as medecin_nom, m.prenom as medecin_prenom
FROM visites v
LEFT JOIN employeurs e ON v.employeur_id = e.id
LEFT JOIN medecins m ON v.medecin_id = m.id
ORDER BY v.id;

SELECT 'Table visites prête pour Spring Boot!' as resultat;