-- Script de test du workflow complet des demandes d'affiliation
USE registre_medical;

-- 1. Vérifier que l'utilisateur directeur existe
SELECT '1. Vérification du directeur:' as etape;
SELECT id, email, nom, prenom, role FROM users WHERE email = 'sanefatimata98@gmail.com';

-- 2. Créer un employeur de test si nécessaire
INSERT IGNORE INTO users (email, password, nom, prenom, telephone, role, actif) VALUES
('test-employeur@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'Employeur', '+226 70 00 00 99', 'EMPLOYEUR', TRUE);

-- 3. Créer une entreprise pour l'employeur de test
INSERT IGNORE INTO entreprises (nom, siret, adresse, ville, code_postal, telephone, email, employeur_id) VALUES
('Entreprise Test Workflow', '999999999', '123 Rue du Test', 'Ouagadougou', '01 BP 999', '+226 25 99 99 99', 'test@test-entreprise.bf', (SELECT id FROM users WHERE email = 'test-employeur@test.com'));

-- 4. Créer une demande d'affiliation de test
SELECT '2. Création d\'une demande d\'affiliation de test:' as etape;
INSERT INTO demandes_affiliation (
    raison_sociale, numero_rccm, secteur_activite, effectif, adresse,
    representant_legal, email, telephone, contact_drh, statut,
    employeur_id, directeur_regional_id
) VALUES (
    'Entreprise Test Workflow SARL',
    'BF-OUA-2024-WORKFLOW-001',
    'Informatique et Télécommunications',
    15,
    '123 Rue du Test, Ouagadougou',
    'Test Employeur',
    'test@test-entreprise.bf',
    '+226 25 99 99 99',
    'Test Employeur',
    'NOUVELLE',
    (SELECT id FROM users WHERE email = 'test-employeur@test.com'),
    (SELECT id FROM users WHERE email = 'sanefatimata98@gmail.com')
);

-- 5. Vérifier que la demande apparaît dans l'interface du directeur
SELECT '3. Demandes visibles par le directeur sanefatimata98@gmail.com:' as etape;
SELECT da.id, da.raison_sociale, da.statut, da.date_creation,
       u.email as employeur_email,
       d.email as directeur_email
FROM demandes_affiliation da
JOIN users u ON da.employeur_id = u.id
JOIN users d ON da.directeur_regional_id = d.id
WHERE d.email = 'sanefatimata98@gmail.com'
ORDER BY da.date_creation DESC;

-- 6. Simuler l'approbation de la demande
SELECT '4. Simulation de l\'approbation:' as etape;
UPDATE demandes_affiliation
SET statut = 'VALIDEE', date_modification = NOW()
WHERE raison_sociale = 'Entreprise Test Workflow SARL' AND statut = 'NOUVELLE';

-- 7. Vérifier que le statut est mis à jour
SELECT '5. Vérification du statut après approbation:' as etape;
SELECT da.id, da.raison_sociale, da.statut, da.date_modification,
       u.email as employeur_email
FROM demandes_affiliation da
JOIN users u ON da.employeur_id = u.id
WHERE da.raison_sociale = 'Entreprise Test Workflow SARL';

-- 8. Simuler un rejet
SELECT '6. Simulation d\'un rejet:' as etape;
INSERT INTO demandes_affiliation (
    raison_sociale, numero_rccm, secteur_activite, effectif, adresse,
    representant_legal, email, telephone, contact_drh, statut,
    employeur_id, directeur_regional_id
) VALUES (
    'Entreprise Rejetee SARL',
    'BF-OUA-2024-REJET-001',
    'Commerce et Distribution',
    8,
    '456 Avenue du Rejet, Ouagadougou',
    'Rejet Employeur',
    'rejet@test-entreprise.bf',
    '+226 25 88 88 88',
    'Rejet Employeur',
    'REJETEE',
    (SELECT id FROM users WHERE email = 'test-employeur@test.com'),
    (SELECT id FROM users WHERE email = 'sanefatimata98@gmail.com')
);

UPDATE demandes_affiliation
SET motif_rejet = 'Documents incomplets - RCCM expiré', date_modification = NOW()
WHERE raison_sociale = 'Entreprise Rejetee SARL';

-- 9. Vérifier les demandes de l'employeur (devrait voir les deux statuts)
SELECT '7. Demandes visibles par l\'employeur test-employeur@test.com:' as etape;
SELECT da.id, da.raison_sociale, da.statut, da.motif_rejet, da.date_creation, da.date_modification
FROM demandes_affiliation da
JOIN users u ON da.employeur_id = u.id
WHERE u.email = 'test-employeur@test.com'
ORDER BY da.date_creation DESC;

SELECT '8. Résumé du test:' as etape;
SELECT
    COUNT(*) as total_demandes,
    SUM(CASE WHEN statut = 'NOUVELLE' THEN 1 ELSE 0 END) as nouvelles,
    SUM(CASE WHEN statut = 'VALIDEE' THEN 1 ELSE 0 END) as validees,
    SUM(CASE WHEN statut = 'REJETEE' THEN 1 ELSE 0 END) as rejetees
FROM demandes_affiliation
WHERE directeur_regional_id = (SELECT id FROM users WHERE email = 'sanefatimata98@gmail.com');

SELECT '✅ Test du workflow terminé avec succès!' as resultat;