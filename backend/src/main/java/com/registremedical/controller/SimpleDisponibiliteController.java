package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class SimpleDisponibiliteController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/api/disponibilite-simple")
    public ResponseEntity<Map<String, Object>> ajouterDisponibilite(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("=== AJOUT DISPONIBILITE ===");
            System.out.println("Data reçue: " + data);
            
            // Créer la table si elle n'existe pas
            String createTable = """
                CREATE TABLE IF NOT EXISTS disponibilites_medecin (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    medecin_id BIGINT NOT NULL,
                    jour_semaine VARCHAR(20) NOT NULL,
                    heure_debut TIME NOT NULL,
                    heure_fin TIME NOT NULL,
                    actif BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """;
            jdbcTemplate.execute(createTable);
            
            String sql = "INSERT INTO disponibilites_medecin (medecin_id, jour_semaine, heure_debut, heure_fin) VALUES (?, ?, ?, ?)";
            
            int result = jdbcTemplate.update(sql,
                Long.valueOf(data.get("medecinId").toString()),
                data.get("jourSemaine").toString(),
                data.get("heureDebut").toString(),
                data.get("heureFin").toString()
            );
            
            System.out.println("Lignes affectées: " + result);
            
            response.put("success", true);
            response.put("message", "Disponibilité ajoutée");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/api/indisponibilite-simple")
    public ResponseEntity<Map<String, Object>> ajouterIndisponibilite(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("=== AJOUT INDISPONIBILITE ===");
            System.out.println("Data reçue: " + data);
            
            // Créer la table si elle n'existe pas
            String createTable = """
                CREATE TABLE IF NOT EXISTS creneaux_indisponibles (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    medecin_id BIGINT NOT NULL,
                    date_debut DATETIME NOT NULL,
                    date_fin DATETIME NOT NULL,
                    motif VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """;
            jdbcTemplate.execute(createTable);
            
            String sql = "INSERT INTO creneaux_indisponibles (medecin_id, date_debut, date_fin, motif) VALUES (?, ?, ?, ?)";
            
            int result = jdbcTemplate.update(sql,
                Long.valueOf(data.get("medecinId").toString()),
                data.get("dateDebut").toString(),
                data.get("dateFin").toString(),
                data.get("motif").toString()
            );
            
            System.out.println("Lignes affectées: " + result);
            
            response.put("success", true);
            response.put("message", "Indisponibilité ajoutée");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/api/test-disponibilite")
    public ResponseEntity<String> testDisponibilite() {
        System.out.println("=== TEST CONTROLLER ===");
        try {
            String sql = "SELECT COUNT(*) FROM disponibilites_medecin";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return ResponseEntity.ok("Controller fonctionne! Disponibilités: " + count);
        } catch (Exception e) {
            return ResponseEntity.ok("Erreur: " + e.getMessage());
        }
    }
}