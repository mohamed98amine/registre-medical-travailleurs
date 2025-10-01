# Script PowerShell pour démarrer le système de programmation de visites
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SYSTEME DE PROGRAMMATION DE VISITES" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Objectif: Permettre la programmation d'une visite" -ForegroundColor Yellow
Write-Host "   avec sélection d'entreprise, employeur et médecin" -ForegroundColor Yellow
Write-Host "   depuis des listes déroulantes dynamiques" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Fonctionnalités implémentées:" -ForegroundColor Green
Write-Host "   ✅ Listes déroulantes dynamiques (useEffect + useState)" -ForegroundColor Green
Write-Host "   ✅ Ajout rapide d'entreprises avec mise à jour automatique" -ForegroundColor Green
Write-Host "   ✅ Ajout rapide d'employeurs avec mise à jour automatique" -ForegroundColor Green
Write-Host "   ✅ Ajout rapide de médecins avec mise à jour automatique" -ForegroundColor Green
Write-Host "   ✅ Création de visites avec toutes les données liées" -ForegroundColor Green
Write-Host "   ✅ Sauvegarde en base MySQL" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Démarrage du système..." -ForegroundColor Magenta
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "backend\pom.xml")) {
    Write-Host "❌ Erreur: Fichier pom.xml non trouvé dans le dossier backend" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le répertoire racine du projet" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Fichier package.json non trouvé" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le répertoire racine du projet" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "1️⃣ Démarrage du backend Spring Boot..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; mvn spring-boot:run"
Start-Sleep -Seconds 3

Write-Host "2️⃣ Démarrage du frontend React..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Start-Sleep -Seconds 3

Write-Host "3️⃣ Ouverture du test complet..." -ForegroundColor Blue
if (Test-Path "test-programmer-visite-complet.html") {
    Start-Process "test-programmer-visite-complet.html"
} else {
    Write-Host "⚠️ Fichier de test non trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Système démarré avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Accès aux applications:" -ForegroundColor Cyan
Write-Host "   - Frontend React: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:8080/api" -ForegroundColor White
Write-Host "   - Test Complet: test-programmer-visite-complet.html" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Pour tester le système:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:5173" -ForegroundColor White
Write-Host "   2. Connectez-vous en tant que Chef de Zone" -ForegroundColor White
Write-Host "   3. Allez dans 'Programmer une Visite'" -ForegroundColor White
Write-Host "   4. Testez l'ajout rapide d'entreprises/employeurs/médecins" -ForegroundColor White
Write-Host "   5. Vérifiez que les listes se mettent à jour automatiquement" -ForegroundColor White
Write-Host "   6. Créez une visite complète" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Pour arrêter le système:" -ForegroundColor Red
Write-Host "   - Fermez les fenêtres PowerShell" -ForegroundColor White
Write-Host "   - Ou utilisez Ctrl+C dans chaque terminal" -ForegroundColor White
Write-Host ""

# Attendre que l'utilisateur appuie sur une touche
Read-Host "Appuyez sur Entrée pour continuer"





