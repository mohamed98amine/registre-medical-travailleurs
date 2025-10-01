-- Vérifier la structure actuelle
DESCRIBE notifications;

-- Supprimer l'ancienne colonne et ajouter la nouvelle
ALTER TABLE notifications DROP COLUMN IF EXISTS destinataire_id;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS destinataire_email VARCHAR(255) NOT NULL;

-- Vider la table et insérer des données de test
DELETE FROM notifications;

-- Insérer quelques notifications de test
INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES
('Test notification pour médecin', NOW(), 'MEDECIN', 'damine98@gmail.com', 'NON_LU'),
('Test notification pour employeur', NOW(), 'EMPLOYEUR', 'damine98@gmail.com', 'NON_LU'),
('Nouvelle visite programmée', NOW(), 'MEDECIN', 'damine98@gmail.com', 'NON_LU');

-- Vérifier les données
SELECT * FROM notifications;