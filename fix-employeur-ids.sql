USE registre_medical;

-- Ajouter des employeurs avec des IDs séquentiels pour correspondre aux attentes du frontend
INSERT INTO employeurs (id, nom) VALUES 
(1, 'Jean Dupont'),
(2, 'Marie Martin'),
(3, 'Pierre Durand'),
(4, 'Sophie Leroy'),
(5, 'Michel Bernard')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

-- Ajouter des médecins avec des IDs séquentiels si nécessaire
INSERT INTO medecins (id, nom, prenom, specialite, email, telephone, disponible) VALUES 
(1, 'Traore', 'Amadou', 'Médecine du travail', 'traore@email.com', '0123456789', true),
(2, 'Ouedraogo', 'Fatimata', 'Médecine générale', 'ouedraogo@email.com', '0123456790', true),
(3, 'Kone', 'Ibrahim', 'Cardiologie', 'kone@email.com', '0123456791', true)
ON DUPLICATE KEY UPDATE 
nom = VALUES(nom), 
prenom = VALUES(prenom), 
specialite = VALUES(specialite), 
email = VALUES(email), 
telephone = VALUES(telephone), 
disponible = VALUES(disponible);

-- Vérifier les données
SELECT 'Employeurs après ajout:' as info;
SELECT id, nom FROM employeurs ORDER BY id;

SELECT 'Médecins après ajout:' as info;
SELECT id, nom, prenom, specialite FROM medecins ORDER BY id;