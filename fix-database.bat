@echo off
echo Correction de la base de données...
echo.

echo Ajout des colonnes manquantes a la table visites...
mysql -u root -p -e "USE registre_medical; ALTER TABLE visites ADD COLUMN IF NOT EXISTS type_visite VARCHAR(50) DEFAULT 'Périodique'; ALTER TABLE visites ADD COLUMN IF NOT EXISTS date_visite DATE; ALTER TABLE visites ADD COLUMN IF NOT EXISTS heure_visite TIME; ALTER TABLE visites ADD COLUMN IF NOT EXISTS statut VARCHAR(50) DEFAULT 'Prévue'; ALTER TABLE visites ADD COLUMN IF NOT EXISTS aptitude VARCHAR(50); ALTER TABLE visites ADD COLUMN IF NOT EXISTS employeur_id BIGINT; ALTER TABLE visites ADD COLUMN IF NOT EXISTS medecin_id BIGINT;"

echo.
echo Base de donnees corrigee!
pause




