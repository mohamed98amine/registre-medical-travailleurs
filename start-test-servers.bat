@echo off
echo ========================================
echo   Demarrage des serveurs de test
echo ========================================
echo.

echo 1. Demarrage du backend Spring Boot...
start "Backend Spring Boot" cmd /k "cd backend && mvn spring-boot:run -Dspring-boot.run.fork=false"

echo.
echo 2. Attente de 10 secondes pour que le backend demarre...
timeout /t 10 /nobreak

echo.
echo 3. Demarrage du frontend React...
start "Frontend React" cmd /k "npm run dev"

echo.
echo ========================================
echo   Serveurs demarres !
echo ========================================
echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5174
echo.
echo Pour tester:
echo 1. Ouvrez http://localhost:5174/test-flux-complet-employeurs-fixed.html
echo 2. Ou utilisez l'application React normale
echo.
pause
