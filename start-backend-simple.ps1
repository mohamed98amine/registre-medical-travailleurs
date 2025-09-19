# Script PowerShell simple pour démarrer le backend
Write-Host "🚀 Démarrage du backend..." -ForegroundColor Green

# Aller dans le dossier backend
Set-Location backend

# Compiler et démarrer
Write-Host "📦 Compilation du projet..." -ForegroundColor Yellow
mvn clean package -DskipTests -q

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilation réussie!" -ForegroundColor Green
    Write-Host "🚀 Démarrage du serveur sur http://localhost:8080..." -ForegroundColor Green
    Write-Host "📝 Pour arrêter le serveur: Ctrl+C" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Démarrer le serveur
    java -jar target/registre-medical-travailleurs-1.0.0.jar
} else {
    Write-Host "❌ Erreur lors de la compilation!" -ForegroundColor Red
    Write-Host "Vérifiez que Java et Maven sont installés correctement." -ForegroundColor Yellow
}
