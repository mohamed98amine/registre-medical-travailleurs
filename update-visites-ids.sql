USE registre_medical;

-- Mettre à jour les employeur_id dans visites pour correspondre aux vrais IDs
UPDATE visites SET employeur_id = 16 WHERE employeur_id = 1;
UPDATE visites SET employeur_id = 17 WHERE employeur_id = 2;

-- Vérifier les données finales
SELECT 'Données finales:' as status;

SELECT 'Employeurs:' as table_name;
SELECT id, nom FROM employeurs;

SELECT 'Visites:' as table_name;
SELECT id, type, date, heure, statut, aptitude, employeur_id, medecin_id FROM visites;

SELECT 'Base de données prête pour Spring Boot!' as resultat;