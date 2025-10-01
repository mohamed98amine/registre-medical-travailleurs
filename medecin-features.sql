-- Tables pour les nouvelles fonctionnalités médecin

-- Table pour les résultats d'examens
CREATE TABLE IF NOT EXISTS resultats_examens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visite_id BIGINT NOT NULL,
    tension_arterielle VARCHAR(20),
    frequence_cardiaque INT,
    poids DECIMAL(5,2),
    taille DECIMAL(5,2),
    vision_od VARCHAR(10),
    vision_og VARCHAR(10),
    audition VARCHAR(50),
    observations TEXT,
    verdict ENUM('APTE', 'INAPTE', 'APTE_AVEC_RESTRICTIONS') NOT NULL,
    restrictions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visite_id) REFERENCES visites(id) ON DELETE CASCADE
);

-- Table pour les certificats générés
CREATE TABLE IF NOT EXISTS certificats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visite_id BIGINT NOT NULL,
    resultat_id BIGINT NOT NULL,
    numero_certificat VARCHAR(50) UNIQUE NOT NULL,
    fichier_pdf LONGBLOB,
    nom_fichier VARCHAR(255),
    envoye_employeur BOOLEAN DEFAULT FALSE,
    date_envoi DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visite_id) REFERENCES visites(id) ON DELETE CASCADE,
    FOREIGN KEY (resultat_id) REFERENCES resultats_examens(id) ON DELETE CASCADE
);

-- Table pour la disponibilité des médecins
CREATE TABLE IF NOT EXISTS disponibilites_medecin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medecin_id BIGINT NOT NULL,
    jour_semaine ENUM('LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE') NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Table pour les créneaux spécifiques (congés, indisponibilités)
CREATE TABLE IF NOT EXISTS creneaux_indisponibles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medecin_id BIGINT NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    motif VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medecin_id) REFERENCES medecins(id) ON DELETE CASCADE
);

-- Insérer quelques disponibilités de test
INSERT INTO disponibilites_medecin (medecin_id, jour_semaine, heure_debut, heure_fin) VALUES
(1, 'LUNDI', '08:00:00', '17:00:00'),
(1, 'MARDI', '08:00:00', '17:00:00'),
(1, 'MERCREDI', '08:00:00', '12:00:00'),
(1, 'JEUDI', '08:00:00', '17:00:00'),
(1, 'VENDREDI', '08:00:00', '16:00:00'),
(2, 'LUNDI', '09:00:00', '18:00:00'),
(2, 'MARDI', '09:00:00', '18:00:00'),
(2, 'JEUDI', '09:00:00', '18:00:00'),
(2, 'VENDREDI', '09:00:00', '17:00:00');