# Script PowerShell pour créer un médecin de test
$API_BASE_URL = "http://localhost:8080/api"

$medecinData = @{
    nom = "Dupont"
    prenom = "Jean"
    email = "jean.dupont@medecin.com"
    password = "password123"
    role = "MEDECIN"
    telephone = "0123456789"
    specialite = "GENERALISTE"
} | ConvertTo-Json

Write-Host "Création du médecin..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/auth/register" -Method POST -Body $medecinData -ContentType "application/json"
    
    Write-Host "Médecin créé avec succès!" -ForegroundColor Green
    Write-Host "Email: jean.dupont@medecin.com" -ForegroundColor Yellow
    Write-Host "Mot de passe: password123" -ForegroundColor Yellow
    Write-Host "Spécialité: GENERALISTE" -ForegroundColor Yellow
    Write-Host "Token: $($response.token)" -ForegroundColor Yellow
} catch {
    Write-Host "Erreur lors de la création du médecin:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
