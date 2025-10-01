-- Insertion d'utilisateurs par défaut
INSERT INTO users (email, password, nom, prenom, role, active, created_at) VALUES 
('admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Admin', 'Test', 'ADMIN', true, NOW()),
('employeur@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Employeur', 'Test', 'EMPLOYEUR', true, NOW()),
('medecin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Medecin', 'Test', 'MEDECIN', true, NOW());

-- Insertion d'entreprises par défaut
INSERT INTO entreprises (nom, secteur_activite, effectif, adresse, ville, telephone, email, statut, created_at) VALUES 
('Entreprise Test', 'Informatique', 50, '123 Rue Test', 'Paris', '0123456789', 'contact@entreprise-test.com', 'ACTIVE', NOW());

-- Insertion de médecins par défaut
INSERT INTO medecins (nom, prenom, specialite, email, telephone, disponible, created_at) VALUES 
('Dr. Martin', 'Jean', 'GENERALISTE', 'dr.martin@test.com', '0123456789', true, NOW()),
('Dr. Dubois', 'Marie', 'CARDIOLOGUE', 'dr.dubois@test.com', '0123456789', true, NOW());

-- Insertion d'employeurs par défaut
INSERT INTO employeurs (nom, email, telephone, active, created_at) VALUES 
('Employeur Test', 'employeur@test.com', '0123456789', true, NOW());