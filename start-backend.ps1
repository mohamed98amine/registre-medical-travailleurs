Write-Host "Démarrage du backend Spring Boot..." -ForegroundColor Green
Set-Location backend
mvn clean compile
if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilation réussie. Démarrage de l'application..." -ForegroundColor Green
    mvn spring-boot:run
} else {
    Write-Host "Erreur de compilation!" -ForegroundColor Red
}