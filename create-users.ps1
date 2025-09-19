# Script PowerShell pour créer les utilisateurs de test
$connectionString = "Server=localhost;Database=registre_medical_travailleurs;Uid=root;Pwd=;"

try {
    # Charger l'assembly MySQL
    Add-Type -Path "C:\Program Files\MySQL\MySQL Connector Net 8.0.33\Assemblies\v4.5.2\MySql.Data.dll"
    
    $connection = New-Object MySql.Data.MySqlClient.MySqlConnection($connectionString)
    $connection.Open()
    
    # Créer l'employeur de test
    $employeurQuery = @"
INSERT INTO users (nom, prenom, email, password, role, active, date_creation) 
VALUES ('Dupont', 'Jean', 'employeur@test.com', '$2a$10`$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'EMPLOYEUR', 1, NOW())
ON DUPLICATE KEY UPDATE email = email
"@
    
    $command = New-Object MySql.Data.MySqlClient.MySqlCommand($employeurQuery, $connection)
    $command.ExecuteNonQuery()
    Write-Host "✅ Employeur créé avec succès"
    
    # Créer le directeur de test
    $directeurQuery = @"
INSERT INTO users (nom, prenom, email, password, role, active, date_creation) 
VALUES ('Martin', 'Pierre', 'directeur@test.com', '$2a$10`$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'DIRECTEUR_REGIONAL', 1, NOW())
ON DUPLICATE KEY UPDATE email = email
"@
    
    $command = New-Object MySql.Data.MySqlClient.MySqlCommand($directeurQuery, $connection)
    $command.ExecuteNonQuery()
    Write-Host "✅ Directeur créé avec succès"
    
    # Vérifier les utilisateurs créés
    $selectQuery = "SELECT id, nom, prenom, email, role FROM users WHERE email IN ('employeur@test.com', 'directeur@test.com')"
    $command = New-Object MySql.Data.MySqlClient.MySqlCommand($selectQuery, $connection)
    $reader = $command.ExecuteReader()
    
    Write-Host "`n📋 Utilisateurs créés:"
    while ($reader.Read()) {
        Write-Host "ID: $($reader['id']) - $($reader['nom']) $($reader['prenom']) - $($reader['email']) - $($reader['role'])"
    }
    
    $reader.Close()
    $connection.Close()
    Write-Host "`n✅ Script terminé avec succès"
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
