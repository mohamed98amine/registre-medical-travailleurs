package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @RestController
// @RequestMapping("/api")
// @CrossOrigin(origins = "*")
public class DisponibiliteTestController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/simple-test")
    public ResponseEntity<?> simpleTest() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "API fonctionne");
        result.put("timestamp", new Date());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/add-creneau")
    public ResponseEntity<?> addCreneau(@RequestBody Map<String, Object> data) {
        try {
            // Créer table simple
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS test_creneaux (id INT AUTO_INCREMENT PRIMARY KEY, jour VARCHAR(20), debut VARCHAR(10), fin VARCHAR(10))");
            
            // Insérer données
            jdbcTemplate.update("INSERT INTO test_creneaux (jour, debut, fin) VALUES (?, ?, ?)",
                data.get("jourSemaine"),
                data.get("heureDebut"), 
                data.get("heureFin"));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Créneau ajouté");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/get-creneaux/{userId}")
    public ResponseEntity<?> getCreneaux(@PathVariable Long userId) {
        try {
            // Créer table si nécessaire
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS test_creneaux (id INT AUTO_INCREMENT PRIMARY KEY, jour VARCHAR(20), debut VARCHAR(10), fin VARCHAR(10))");
            
            // Récupérer données
            List<Map<String, Object>> creneaux = jdbcTemplate.queryForList("SELECT * FROM test_creneaux");
            
            Map<String, Object> result = new HashMap<>();
            result.put("disponibilites", creneaux);
            result.put("indisponibilites", new ArrayList<>());
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}