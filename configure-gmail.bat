@echo off
echo ========================================
echo Configuration Gmail pour l'envoi d'emails
echo ========================================
echo.
echo Pour que l'envoi d'emails fonctionne, vous devez:
echo.
echo 1. Aller sur votre compte Gmail: https://myaccount.google.com/
echo 2. Activer la verification en 2 etapes si ce n'est pas fait
echo 3. Generer un mot de passe d'application:
echo    - Aller dans "Securite" puis "Mots de passe des applications"
echo    - Selectionner "Autre" et nommer "Registre Medical"
echo    - Copier le mot de passe genere (16 caracteres)
echo.
echo 4. Modifier le fichier: backend/src/main/resources/application.properties
echo    - Remplacer "your_app_password_here" par le mot de passe genere
echo.
echo 5. Redemarrer le serveur backend
echo.
echo ========================================
echo Email de test: omohamedamine98@gmail.com
echo ========================================
pause
