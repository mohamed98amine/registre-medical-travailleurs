USE registre_medical;

CREATE TABLE demandes_affiliation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    raison_sociale VARCHAR(255) NOT NULL,
    numero_rccm VARCHAR(255),
    secteur_activite VARCHAR(255),
    effectif INT,
    adresse TEXT,
    representant_legal VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(255),
    contact_drh VARCHAR(255),
    chiffre_affaire_annuel DOUBLE,
    statut VARCHAR(50) DEFAULT 'NOUVELLE',
    motif_rejet TEXT,
    commentaires TEXT,
    date_creation DATETIME(6),
    date_modification DATETIME(6),
    employeur_id BIGINT,
    directeur_regional_id BIGINT,
    FOREIGN KEY (employeur_id) REFERENCES users(id),
    FOREIGN KEY (directeur_regional_id) REFERENCES users(id)
);

SELECT 'Table demandes_affiliation créée avec succès!' as message;
