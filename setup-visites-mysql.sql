USE registre_medical;

-- Créer la table visites
CREATE TABLE IF NOT EXISTS visites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id BIGINT NOT NULL,
    employeur_id BIGINT NOT NULL,
    medecin_id BIGINT NOT NULL,
    date_visite DATE NOT NULL,
    heure_visite TIME NOT NULL,
    statut VARCHAR(50) DEFAULT 'PROGRAMMEE',
    type_visite VARCHAR(100) DEFAULT 'VISITE_PERIODIQUE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    FOREIGN KEY (employeur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Insérer quelques données de test
INSERT INTO visites (entreprise_id, employeur_id, medecin_id, date_visite, heure_visite, statut, type_visite, notes) VALUES
(1, 1, 1, '2025-01-15', '09:00:00', 'PROGRAMMEE', 'VMA', 'Visite médicale d\'aptitude initiale'),
(1, 1, 1, '2025-01-16', '14:30:00', 'PROGRAMMEE', 'VPC', 'Contrôle périodique annuel'),
(2, 2, 2, '2025-01-17', '10:15:00', 'EN_COURS', 'VRE', 'Visite de reprise après arrêt maladie');

SELECT 'Table visites créée avec succès!' as resultat;
SELECT COUNT(*) as 'Nombre de visites' FROM visites;