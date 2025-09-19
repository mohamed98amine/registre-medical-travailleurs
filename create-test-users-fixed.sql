-- Script pour créer des utilisateurs de test avec mots de passe correctement encodés
USE registre_medical;

-- Hash BCrypt pour le mot de passe "password"
-- $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Créer un directeur régional de test
INSERT INTO users (email, password, nom, prenom, telephone, role, actif) VALUES
('directeur@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dupont', 'Jean', '+226 70 00 00 01', 'DIRECTEUR_REGIONAL', TRUE);

-- Créer un employeur de test
INSERT INTO users (email, password, nom, prenom, telephone, role, actif) VALUES
('employeur@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Martin', 'Marie', '+226 70 00 00 02', 'EMPLOYEUR', TRUE);

-- Créer une zone médicale de test
INSERT INTO zones_medicales (nom, latitude, longitude, actif) VALUES
('Ouagadougou Centre', 12.3714, -1.5197, TRUE);

-- Créer un médecin de test
INSERT INTO medecins (nom, prenom, specialite, telephone, email, adresse, ville, code_postal, actif, zone_medicale_id) VALUES
('Traore', 'Amadou', 'GENERALISTE', '+226 70 00 00 03', 'medecin@test.com', '123 Rue de la Santé', 'Ouagadougou', '01 BP 1234', TRUE, 1);

-- Pour l'instant, créons seulement les utilisateurs de base
-- Vous pourrez créer les entreprises et demandes via l'interface

SELECT 'Utilisateurs de test créés avec succès' as message;
SELECT id, email, nom, prenom, role FROM users;