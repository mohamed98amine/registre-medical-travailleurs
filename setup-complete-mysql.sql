USE registre_medical;

-- Table médecins
CREATE TABLE IF NOT EXISTS medecins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    specialite VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table visites
CREATE TABLE IF NOT EXISTS visites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entreprise_id BIGINT NOT NULL,
    employeur_id BIGINT NOT NULL,
    medecin_id BIGINT NOT NULL,
    type_visite VARCHAR(50) NOT NULL,
    date_visite DATE NOT NULL,
    heure_visite TIME NOT NULL,
    commentaires TEXT,
    statut VARCHAR(20) DEFAULT 'PROGRAMMEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id),
    FOREIGN KEY (employeur_id) REFERENCES users(id),
    FOREIGN KEY (medecin_id) REFERENCES medecins(id)
);

-- S'assurer que employeur_id peut être NULL dans entreprises
ALTER TABLE entreprises MODIFY COLUMN employeur_id BIGINT NULL;

SELECT 'Tables créées avec succès!' as resultat;