Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Démarrage des serveurs de test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Démarrage du backend Spring Boot..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; mvn spring-boot:run -Dspring-boot.run.fork=false"

Write-Host ""
Write-Host "2. Attente de 10 secondes pour que le backend démarre..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "3. Démarrage du frontend React..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Serveurs démarrés !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8080" -ForegroundColor White
Write-Host "Frontend: http://localhost:5174" -ForegroundColor White
Write-Host ""
Write-Host "Pour tester:" -ForegroundColor White
Write-Host "1. Ouvrez http://localhost:5174/test-flux-complet-employeurs-fixed.html" -ForegroundColor White
Write-Host "2. Ou utilisez l'application React normale" -ForegroundColor White
Write-Host ""

Read-Host "Appuyez sur Entrée pour continuer"
