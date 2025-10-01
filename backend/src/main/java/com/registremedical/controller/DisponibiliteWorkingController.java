package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @RestController
// @RequestMapping("/api")
// @CrossOrigin(origins = "*")
public class DisponibiliteWorkingController {

    // Test endpoint simple
    @GetMapping("/test-simple")
    public ResponseEntity<?> testSimple() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Controller fonctionne");
        result.put("timestamp", new Date());
        return ResponseEntity.ok(result);
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/disponibilites")
    public ResponseEntity<?> ajouterDisponibilite(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/disponibilites appelé ===");
        System.out.println("Données reçues: " + data);
        
        Map<String, Object> response = new HashMap<>();
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS disponibilites_medecin (id INT AUTO_INCREMENT PRIMARY KEY, medecin_id INT DEFAULT 1, jour_semaine VARCHAR(20), heure_debut VARCHAR(10), heure_fin VARCHAR(10))");

            int result = jdbcTemplate.update("INSERT INTO disponibilites_medecin (jour_semaine, heure_debut, heure_fin) VALUES (?, ?, ?)",
                data.get("jourSemaine"),
                data.get("heureDebut"),
                data.get("heureFin"));
            
            System.out.println("Lignes affectées: " + result);

            response.put("success", true);
            response.put("message", "Disponibilité ajoutée");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/indisponibilites")
    public ResponseEntity<?> ajouterIndisponibilite(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS creneaux_indisponibles (id INT AUTO_INCREMENT PRIMARY KEY, medecin_id INT DEFAULT 1, date_debut VARCHAR(50), date_fin VARCHAR(50), motif VARCHAR(255))");

            jdbcTemplate.update("INSERT INTO creneaux_indisponibles (date_debut, date_fin, motif) VALUES (?, ?, ?)",
                data.get("dateDebut"),
                data.get("dateFin"),
                data.get("motif"));

            response.put("success", true);
            response.put("message", "Indisponibilité ajoutée");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/medecin/disponibilite/{userId}")
    public ResponseEntity<?> getDisponibilites(@PathVariable Long userId) {
        System.out.println("=== GET /api/medecin/disponibilite/" + userId + " appelé ===");
        
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS disponibilites_medecin (id INT AUTO_INCREMENT PRIMARY KEY, medecin_id INT DEFAULT 1, jour_semaine VARCHAR(20), heure_debut VARCHAR(10), heure_fin VARCHAR(10))");
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS creneaux_indisponibles (id INT AUTO_INCREMENT PRIMARY KEY, medecin_id INT DEFAULT 1, date_debut VARCHAR(50), date_fin VARCHAR(50), motif VARCHAR(255))");

            List<Map<String, Object>> disponibilites = jdbcTemplate.queryForList("SELECT * FROM disponibilites_medecin");
            List<Map<String, Object>> indisponibilites = jdbcTemplate.queryForList("SELECT * FROM creneaux_indisponibles");
            
            System.out.println("Disponibilités trouvées: " + disponibilites.size());
            System.out.println("Indisponibilités trouvées: " + indisponibilites.size());
            System.out.println("Données disponibilités: " + disponibilites);

            Map<String, Object> result = new HashMap<>();
            result.put("disponibilites", disponibilites);
            result.put("indisponibilites", indisponibilites);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("Erreur GET: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/test-get-data")
    public ResponseEntity<?> testGetData() {
        System.out.println("=== TEST GET DATA ===");
        try {
            List<Map<String, Object>> data = jdbcTemplate.queryForList("SELECT * FROM disponibilites_medecin");
            System.out.println("Données test: " + data);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}