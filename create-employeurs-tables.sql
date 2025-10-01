-- Création de la table employeurs
CREATE TABLE IF NOT EXISTS employeurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    entreprise_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
);

-- Création de la table messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contenu TEXT NOT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    visite_medicale_id BIGINT,
    date_envoi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES employeurs(id) ON DELETE CASCADE,
    FOREIGN KEY (visite_medicale_id) REFERENCES visites_medicales(id) ON DELETE SET NULL
);

-- Ajout de la colonne employeur_id à la table visites_medicales si elle n'existe pas
ALTER TABLE visites_medicales
ADD COLUMN IF NOT EXISTS employeur_id BIGINT,
ADD CONSTRAINT fk_visites_employeur FOREIGN KEY (employeur_id) REFERENCES employeurs(id) ON DELETE SET NULL;

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_employeurs_entreprise ON employeurs(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_employeurs_active ON employeurs(active);
CREATE INDEX IF NOT EXISTS idx_employeurs_email ON employeurs(email);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_visite ON messages(visite_medicale_id);
CREATE INDEX IF NOT EXISTS idx_messages_date_envoi ON messages(date_envoi);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages(lu);

CREATE INDEX IF NOT EXISTS idx_visites_employeur ON visites_medicales(employeur_id);

-- Données de test pour les employeurs
INSERT INTO employeurs (nom, prenom, email, telephone, entreprise_id, active) VALUES
('TRAORE', 'Amadou', 'a.traore@sonabhy.bf', '70123456', 1, TRUE),
('KONATE', 'Fatou', 'f.konate@cfaomotors.bf', '70234567', 2, TRUE),
('DIALLO', 'Moussa', 'm.diallo@sonabhy.bf', '70345678', 1, TRUE),
('SANKARA', 'Mariam', 'm.sankara@cfaomotors.bf', '70456789', 2, TRUE)
ON DUPLICATE KEY UPDATE
    nom = VALUES(nom),
    prenom = VALUES(prenom),
    telephone = VALUES(telephone),
    entreprise_id = VALUES(entreprise_id),
    active = VALUES(active);