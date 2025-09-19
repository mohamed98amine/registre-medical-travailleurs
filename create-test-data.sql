-- Script SQL pour créer des données de test
-- Utilisateur employeur de test
INSERT INTO users (id, nom, prenom, email, password, role, active, date_creation) 
VALUES (1, 'Dupont', 'Jean', 'employeur@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'EMPLOYEUR', true, NOW())
ON DUPLICATE KEY UPDATE email = email;

-- Utilisateur directeur de test
INSERT INTO users (id, nom, prenom, email, password, role, active, date_creation) 
VALUES (2, 'Martin', 'Pierre', 'directeur@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'DIRECTEUR_REGIONAL', true, NOW())
ON DUPLICATE KEY UPDATE email = email;

-- Demande d'affiliation de test
INSERT INTO demandes_affiliation (id, raison_sociale, numero_rccm, secteur_activite, effectif, adresse, representant_legal, email, telephone, contact_drh, statut, commentaires, date_creation, date_modification, employeur_id, directeur_regional_id)
VALUES (1, 'SARL Test Entreprise', 'RCCM-TEST-001', 'Informatique', 10, 'Ouagadougou, Burkina Faso', 'Jean Dupont', 'contact@testentreprise.bf', '+226 70 12 34 56', 'Marie Koura', 'NOUVELLE', 'Demande de test', NOW(), NOW(), 1, 2)
ON DUPLICATE KEY UPDATE raison_sociale = raison_sociale;

-- Autre demande d'affiliation
INSERT INTO demandes_affiliation (id, raison_sociale, numero_rccm, secteur_activite, effectif, adresse, representant_legal, email, telephone, contact_drh, statut, commentaires, date_creation, date_modification, employeur_id, directeur_regional_id)
VALUES (2, 'SARL Construction Plus', 'RCCM-CONST-002', 'Construction', 25, 'Bobo-Dioulasso, Burkina Faso', 'Amadou Traore', 'contact@constructionplus.bf', '+226 76 54 32 10', 'Fatouma Ouedraogo', 'EN_COURS', 'En cours de traitement', NOW(), NOW(), 1, 2)
ON DUPLICATE KEY UPDATE raison_sociale = raison_sociale;
