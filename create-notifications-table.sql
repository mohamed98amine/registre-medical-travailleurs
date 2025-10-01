-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(500) NOT NULL,
    date DATETIME NOT NULL,
    destinataire_type VARCHAR(20) NOT NULL,
    destinataire_email VARCHAR(255) NOT NULL,
    statut VARCHAR(10) NOT NULL DEFAULT 'NON_LU'
);

-- Insérer quelques notifications de test
INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES
('Test notification pour médecin', NOW(), 'MEDECIN', 'damine98@gmail.com', 'NON_LU'),
('Test notification pour employeur', NOW(), 'EMPLOYEUR', 'damine98@gmail.com', 'NON_LU'),
('Nouvelle visite programmée', NOW(), 'MEDECIN', 'damine98@gmail.com', 'NON_LU');