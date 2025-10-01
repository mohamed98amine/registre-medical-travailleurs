package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @RestController
// @RequestMapping("/api")
// @CrossOrigin(origins = "*")
public class DisponibiliteSimpleController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/disponibilites")
    public ResponseEntity<?> ajouterDisponibilite(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/disponibilites appelé ===");
        System.out.println("Données reçues: " + data);

        Map<String, Object> response = new HashMap<>();
        try {
            // Créer table si nécessaire
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS disponibilites_medecin (id BIGINT AUTO_INCREMENT PRIMARY KEY, medecin_id BIGINT DEFAULT 1, jour_semaine VARCHAR(20), heure_debut TIME, heure_fin TIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            } catch (Exception e) {
                System.out.println("Table existe déjà: " + e.getMessage());
            }

            String sql = "INSERT INTO disponibilites_medecin (medecin_id, jour_semaine, heure_debut, heure_fin) VALUES (?, ?, ?, ?)";

            int result = jdbcTemplate.update(sql,
                1L, // medecin_id par défaut
                data.get("jourSemaine").toString(),
                data.get("heureDebut").toString(),
                data.get("heureFin").toString()
            );

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
    public ResponseEntity<Map<String, Object>> ajouterIndisponibilite(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Créer table si nécessaire
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS creneaux_indisponibles (id BIGINT AUTO_INCREMENT PRIMARY KEY, medecin_id BIGINT DEFAULT 1, date_debut DATETIME, date_fin DATETIME, motif VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            } catch (Exception e) {
                System.out.println("Table existe déjà: " + e.getMessage());
            }

            String sql = "INSERT INTO creneaux_indisponibles (medecin_id, date_debut, date_fin, motif) VALUES (?, ?, ?, ?)";

            jdbcTemplate.update(sql,
                1L, // medecin_id par défaut
                data.get("dateDebut").toString(),
                data.get("dateFin").toString(),
                data.get("motif").toString()
            );

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
        try {
            // Créer tables si nécessaire
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS disponibilites_medecin (id BIGINT AUTO_INCREMENT PRIMARY KEY, medecin_id BIGINT DEFAULT 1, jour_semaine VARCHAR(20), heure_debut TIME, heure_fin TIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS creneaux_indisponibles (id BIGINT AUTO_INCREMENT PRIMARY KEY, medecin_id BIGINT DEFAULT 1, date_debut DATETIME, date_fin DATETIME, motif VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            } catch (Exception e) {
                System.out.println("Tables existent déjà: " + e.getMessage());
            }

            // Query disponibilites - test simple d'abord
            String sqlCount = "SELECT COUNT(*) as total FROM disponibilites_medecin";
            int total = jdbcTemplate.queryForObject(sqlCount, Integer.class);
            System.out.println("Total enregistrements dans la table: " + total);
            
            String sqlDispo = "SELECT id, jour_semaine, heure_debut, heure_fin FROM disponibilites_medecin WHERE medecin_id = ? ORDER BY FIELD(jour_semaine, 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'), heure_debut";
            List<Map<String, Object>> disponibilites = jdbcTemplate.queryForList(sqlDispo, 1L);
            System.out.println("Disponibilités trouvées pour medecin_id=1: " + disponibilites.size());
            System.out.println("Données: " + disponibilites);

            // Query indisponibilites
            String sqlIndispo = "SELECT id, date_debut, date_fin, motif FROM creneaux_indisponibles WHERE medecin_id = ? ORDER BY date_debut";
            List<Map<String, Object>> indisponibilites = jdbcTemplate.queryForList(sqlIndispo, 1L);
            System.out.println("Indisponibilités trouvées: " + indisponibilites.size());

            Map<String, Object> result = new HashMap<>();
            result.put("disponibilites", disponibilites);
            result.put("indisponibilites", indisponibilites);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("Erreur GET disponibilites: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/partager-disponibilite")
    public ResponseEntity<?> partagerDisponibilite(@RequestBody Map<String, Object> data) {
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS disponibilites_partagees (id BIGINT AUTO_INCREMENT PRIMARY KEY, medecin_id BIGINT, nom_medecin VARCHAR(100), email_medecin VARCHAR(100), disponibilites TEXT, indisponibilites TEXT, date_partage TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            String sql = "INSERT INTO disponibilites_partagees (medecin_id, nom_medecin, email_medecin, disponibilites, indisponibilites) VALUES (?, ?, ?, ?, ?)";
            
            jdbcTemplate.update(sql,
                1L,
                data.get("nomMedecin").toString(),
                data.get("emailMedecin").toString(),
                data.get("disponibilites").toString(),
                data.get("indisponibilites").toString()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Disponibilité partagée avec le chef de zone");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/chef-zone/medecins-disponibles")
    public ResponseEntity<?> getMedecinsDisponibles() {
        try {
            String sql = "SELECT * FROM disponibilites_partagees ORDER BY date_partage DESC";
            List<Map<String, Object>> medecins = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(medecins);

        } catch (Exception e) {
            System.err.println("Erreur GET medecins disponibles: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            // Créer table d'abord
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS disponibilites_medecin (id BIGINT AUTO_INCREMENT PRIMARY KEY, medecin_id BIGINT DEFAULT 1, jour_semaine VARCHAR(20), heure_debut TIME, heure_fin TIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            // Test direct database query
            String sql = "SELECT * FROM disponibilites_medecin";
            List<Map<String, Object>> all = jdbcTemplate.queryForList(sql);
            System.out.println("TOUS LES ENREGISTREMENTS: " + all);
            
            Map<String, Object> result = new HashMap<>();
            result.put("total_records", all.size());
            result.put("records", all);
            result.put("message", "Test réussi");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("Erreur test DB: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("message", "Erreur lors du test de la base de données");
            return ResponseEntity.status(500).body(error);
        }
    }
}