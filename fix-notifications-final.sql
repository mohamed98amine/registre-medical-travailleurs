-- Supprimer la table notifications et la recréer avec la bonne structure
DROP TABLE IF EXISTS notifications;

-- Créer la table notifications avec la structure correcte
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    destinataire_type VARCHAR(20) NOT NULL,
    destinataire_email VARCHAR(255) NOT NULL,
    statut VARCHAR(10) NOT NULL DEFAULT 'NON_LU'
);

-- Insérer quelques notifications de test
INSERT INTO notifications (message, destinataire_type, destinataire_email, statut) VALUES
('Test notification pour médecin', 'MEDECIN', 'damine98@gmail.com', 'NON_LU'),
('Test notification pour employeur', 'EMPLOYEUR', 'damine98@gmail.com', 'NON_LU'),
('Nouvelle visite programmée', 'MEDECIN', 'damine98@gmail.com', 'NON_LU');

-- Vérifier les données
SELECT * FROM notifications;