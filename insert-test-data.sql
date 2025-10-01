USE registre_medical;

-- Créer la table médecins si elle n'existe pas
CREATE TABLE IF NOT EXISTS medecins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(50),
    specialite VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insérer des médecins de test
INSERT INTO medecins (nom, prenom, email, telephone, specialite, disponible) VALUES
('OUEDRAOGO', 'Dr. Jean', 'jean.ouedraogo@medecin.bf', '+226 70 12 34 56', 'Médecine du travail', TRUE),
('KABORE', 'Dr. Marie', 'marie.kabore@medecin.bf', '+226 70 23 45 67', 'Médecine générale', TRUE),
('SAWADOGO', 'Dr. Paul', 'paul.sawadogo@medecin.bf', '+226 70 34 56 78', 'Cardiologie', TRUE),
('TRAORE', 'Dr. Fatou', 'fatou.traore@medecin.bf', '+226 70 45 67 89', 'Pneumologie', TRUE),
('ZONGO', 'Dr. Ibrahim', 'ibrahim.zongo@medecin.bf', '+226 70 56 78 90', 'Médecine du travail', TRUE);

-- Insérer des entreprises de test
INSERT INTO entreprises (nom, adresse, ville, code_postal, telephone, email, secteur_activite, effectif) VALUES
('BURKINA TECH SARL', '123 Avenue Kwame Nkrumah', 'Ouagadougou', '01 BP 1234', '+226 25 12 34 56', 'contact@burkinatech.bf', 'Informatique', 50),
('FASO MINING SA', '456 Rue de la Paix', 'Ouagadougou', '01 BP 5678', '+226 25 23 45 67', 'info@fasomining.bf', 'Mines', 120),
('SAHEL CONSTRUCTION', '789 Boulevard Charles de Gaulle', 'Bobo-Dioulasso', '01 BP 9012', '+226 20 34 56 78', 'contact@sahelconstruction.bf', 'Construction', 80),
('BURKINA AGRO SARL', '321 Avenue de la Nation', 'Koudougou', '01 BP 3456', '+226 25 45 67 89', 'info@burkinaagro.bf', 'Agriculture', 35),
('FASO TELECOM SA', '654 Rue de l''Indépendance', 'Ouagadougou', '01 BP 7890', '+226 25 56 78 90', 'contact@fasotelecom.bf', 'Télécommunications', 200);

-- Vérifier les insertions
SELECT 'Données de test insérées:' as message;
SELECT COUNT(*) as nombre_medecins FROM medecins;
SELECT COUNT(*) as nombre_entreprises FROM entreprises;

-- Afficher les médecins
SELECT 'MÉDECINS:' as type;
SELECT id, CONCAT(prenom, ' ', nom) as nom_complet, specialite, disponible FROM medecins;

-- Afficher les entreprises
SELECT 'ENTREPRISES:' as type;
SELECT id, nom, secteur_activite, effectif FROM entreprises;

SELECT '✅ Données de test créées avec succès!' as resultat;