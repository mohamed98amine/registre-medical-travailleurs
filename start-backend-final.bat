@echo off
echo ====================================
echo    DEMARRAGE DU BACKEND SPRING BOOT
echo ====================================
echo.

echo Etape 1: Navigation vers le dossier backend...
cd /d "%~dp0backend"

echo Etape 2: Compilation du projet...
call mvn clean package -DskipTests -q

echo Etape 3: Demarrage du serveur...
echo Le serveur va demarrer sur http://localhost:8080
echo Pour arreter le serveur: Ctrl+C
echo.

java -jar target/registre-medical-travailleurs-1.0.0.jar

pause
