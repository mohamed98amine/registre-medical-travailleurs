-- Script SQL pour créer les utilisateurs de test
-- Mot de passe: password123 (hashé avec BCrypt)

-- Créer l'employeur de test
INSERT INTO users (nom, prenom, email, password, role, active, date_creation) 
VALUES ('Dupont', 'Jean', 'employeur@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'EMPLOYEUR', true, NOW())
ON DUPLICATE KEY UPDATE email = email;

-- Créer le directeur de test
INSERT INTO users (nom, prenom, email, password, role, active, date_creation) 
VALUES ('Martin', 'Pierre', 'directeur@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'DIRECTEUR_REGIONAL', true, NOW())
ON DUPLICATE KEY UPDATE email = email;

-- Vérifier que les utilisateurs ont été créés
SELECT id, nom, prenom, email, role FROM users WHERE email IN ('employeur@test.com', 'directeur@test.com');
