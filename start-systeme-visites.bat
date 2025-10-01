@echo off
echo ========================================
echo   SYSTEME DE PROGRAMMATION DE VISITES
echo ========================================
echo.
echo 🎯 Objectif: Permettre la programmation d'une visite
echo    avec selection d'entreprise, employeur et medecin
echo    depuis des listes deroulantes dynamiques
echo.
echo 📋 Fonctionnalites implementees:
echo    ✅ Listes deroulantes dynamiques (useEffect + useState)
echo    ✅ Ajout rapide d'entreprises avec mise a jour automatique
echo    ✅ Ajout rapide d'employeurs avec mise a jour automatique  
echo    ✅ Ajout rapide de medecins avec mise a jour automatique
echo    ✅ Creation de visites avec toutes les donnees liees
echo    ✅ Sauvegarde en base MySQL
echo.
echo 🚀 Demarrage du systeme...
echo.

echo 1️⃣ Demarrage du backend Spring Boot...
start "Backend Spring Boot" cmd /k "cd backend && mvn spring-boot:run"
timeout /t 3 /nobreak > nul

echo 2️⃣ Demarrage du frontend React...
start "Frontend React" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo 3️⃣ Ouverture du test complet...
start "Test Complet" test-programmer-visite-complet.html
timeout /t 2 /nobreak > nul

echo.
echo ✅ Systeme demarre avec succes !
echo.
echo 📱 Acces aux applications:
echo    - Frontend React: http://localhost:5173
echo    - Backend API: http://localhost:8080/api
echo    - Test Complet: test-programmer-visite-complet.html
echo.
echo 🎯 Pour tester le systeme:
echo    1. Ouvrez http://localhost:5173
echo    2. Connectez-vous en tant que Chef de Zone
echo    3. Allez dans "Programmer une Visite"
echo    4. Testez l'ajout rapide d'entreprises/employeurs/medecins
echo    5. Verifiez que les listes se mettent a jour automatiquement
echo    6. Creez une visite complete
echo.
echo 🔧 Pour arreter le systeme:
echo    - Fermez les fenetres de commande
echo    - Ou utilisez Ctrl+C dans chaque terminal
echo.
pause





