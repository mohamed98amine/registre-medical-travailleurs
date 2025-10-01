USE registre_medical;

CREATE TABLE IF NOT EXISTS visites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entreprise_id INT NOT NULL,
    employeur_id INT NOT NULL,
    medecin_id INT NOT NULL,
    type_visite VARCHAR(255) NOT NULL,
    date_visite DATE NOT NULL,
    heure_visite TIME NOT NULL,
    commentaires TEXT,
    travailleur VARCHAR(255),
    statut VARCHAR(50) DEFAULT 'Prévue',
    aptitude VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
    FOREIGN KEY (employeur_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

SELECT 'Table visites créée avec succès!' as resultat;