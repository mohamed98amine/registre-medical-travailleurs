USE registre_medical;

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

SELECT 'Table visites créée avec succès!' as resultat;