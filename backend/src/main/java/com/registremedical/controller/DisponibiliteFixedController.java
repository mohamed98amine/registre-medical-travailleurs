package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @RestController
// @RequestMapping("/api")
// @CrossOrigin(origins = "*")
public class DisponibiliteFixedController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/add-creneau")
    public ResponseEntity<?> addCreneau(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/add-creneau appelé ===");
        System.out.println("Données reçues: " + data);

        Map<String, Object> response = new HashMap<>();
        try {
            // Créer table simple
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS mysql_creneaux (id INT AUTO_INCREMENT PRIMARY KEY, jour VARCHAR(20), debut VARCHAR(10), fin VARCHAR(10))");

            String sql = "INSERT INTO mysql_creneaux (jour, debut, fin) VALUES (?, ?, ?)";
            int result = jdbcTemplate.update(sql,
                data.get("jourSemaine"),
                data.get("heureDebut"), 
                data.get("heureFin"));

            System.out.println("Lignes affectées: " + result);

            response.put("success", true);
            response.put("message", "Créneau ajouté en MySQL");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur MySQL: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/add-indispo")
    public ResponseEntity<?> addIndispo(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS mysql_indispos (id INT AUTO_INCREMENT PRIMARY KEY, date_debut VARCHAR(50), date_fin VARCHAR(50), motif VARCHAR(255))");

            String sql = "INSERT INTO mysql_indispos (date_debut, date_fin, motif) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql,
                data.get("dateDebut"),
                data.get("dateFin"),
                data.get("motif"));

            response.put("success", true);
            response.put("message", "Indisponibilité ajoutée en MySQL");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/get-creneaux/{userId}")
    public ResponseEntity<?> getCreneaux(@PathVariable Long userId) {
        try {
            // Créer tables si nécessaire
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS mysql_creneaux (id INT AUTO_INCREMENT PRIMARY KEY, jour VARCHAR(20), debut VARCHAR(10), fin VARCHAR(10))");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS mysql_indispos (id INT AUTO_INCREMENT PRIMARY KEY, date_debut VARCHAR(50), date_fin VARCHAR(50), motif VARCHAR(255))");
            
            // Récupérer créneaux
            List<Map<String, Object>> creneaux = jdbcTemplate.queryForList("SELECT * FROM mysql_creneaux");
            System.out.println("Créneaux MySQL trouvés: " + creneaux.size());
            
            // Récupérer indispos
            List<Map<String, Object>> indispos = jdbcTemplate.queryForList("SELECT * FROM mysql_indispos");
            System.out.println("Indispos MySQL trouvées: " + indispos.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("disponibilites", creneaux);
            result.put("indisponibilites", indispos);
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("Erreur GET MySQL: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/test-mysql")
    public ResponseEntity<?> testMySQL() {
        try {
            // Test simple
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(100))");
            jdbcTemplate.update("INSERT INTO test_table (message) VALUES (?)", "Test MySQL OK");
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList("SELECT * FROM test_table");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "MySQL fonctionne");
            response.put("results", results);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}