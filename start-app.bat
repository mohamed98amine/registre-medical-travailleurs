@echo off
echo ========================================
echo   REGISTRE MEDICAL TRAVAILLEURS
echo ========================================
echo.

echo Demarrage de XAMPP...
start "" "C:\xampp\xampp-control.exe"

echo.
echo Attente du demarrage de XAMPP (30 secondes)...
timeout /t 30 /nobreak

echo.
echo Creation de la base de donnees...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS registre_medical;"

echo.
echo Demarrage du backend Spring Boot...
cd backend
start "Backend Spring Boot" cmd /k "mvn spring-boot:run"

echo.
echo Attente du demarrage du backend (60 secondes)...
timeout /t 60 /nobreak

echo.
echo Demarrage du frontend React...
cd ..\frontend
start "Frontend React" cmd /k "npm run dev"

echo.
echo ========================================
echo   APPLICATION LANCEE AVEC SUCCES !
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo Swagger: http://localhost:8080/swagger-ui.html
echo.
echo Appuyez sur une touche pour fermer...
pause
