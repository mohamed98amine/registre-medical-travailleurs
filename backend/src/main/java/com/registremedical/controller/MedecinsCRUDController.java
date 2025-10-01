package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/medecins")
@CrossOrigin(origins = "*")
public class MedecinsCRUDController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllMedecins() {
        try {
            // Créer la table si elle n'existe pas
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS medecins (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    nom VARCHAR(255) NOT NULL,
                    prenom VARCHAR(255) NOT NULL,
                    specialite VARCHAR(255),
                    telephone VARCHAR(255),
                    email VARCHAR(255),
                    disponible BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """);

            String sql = "SELECT * FROM medecins ORDER BY nom, prenom";
            List<Map<String, Object>> medecins = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(medecins);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des médecins: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMedecinById(@PathVariable Long id) {
        try {
            String sql = "SELECT * FROM medecins WHERE id = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, id);
            
            if (results.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(results.get(0));
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération du médecin: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createMedecin(@RequestBody Map<String, Object> data) {
        try {
            System.out.println("Création d'un médecin avec les données: " + data);

            // Créer la table si elle n'existe pas
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS medecins (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    nom VARCHAR(255) NOT NULL,
                    prenom VARCHAR(255) NOT NULL,
                    specialite VARCHAR(255),
                    telephone VARCHAR(255),
                    email VARCHAR(255),
                    disponible BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """);

            // Validation des données requises
            if (data.get("nom") == null || data.get("nom").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Le nom est requis"));
            }
            if (data.get("prenom") == null || data.get("prenom").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Le prénom est requis"));
            }
            if (data.get("email") == null || data.get("email").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "L'email est requis"));
            }

            String sql = """
                INSERT INTO medecins (nom, prenom, specialite, telephone, email, disponible) 
                VALUES (?, ?, ?, ?, ?, ?)
            """;

            jdbcTemplate.update(sql,
                data.get("nom").toString().trim(),
                data.get("prenom").toString().trim(),
                data.get("specialite") != null ? data.get("specialite").toString() : null,
                data.get("telephone") != null ? data.get("telephone").toString() : null,
                data.get("email").toString().trim(),
                true
            );

            // Récupérer le médecin créé
            String selectSql = "SELECT * FROM medecins WHERE email = ? ORDER BY id DESC LIMIT 1";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(selectSql, data.get("email").toString().trim());
            
            if (!results.isEmpty()) {
                System.out.println("Médecin créé avec succès: " + results.get(0));
                return ResponseEntity.ok(results.get(0));
            } else {
                return ResponseEntity.status(500).body(Collections.singletonMap("error", "Erreur lors de la création"));
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de la création du médecin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Erreur lors de la création: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedecin(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            System.out.println("Mise à jour du médecin " + id + " avec les données: " + data);

            // Vérifier que le médecin existe
            String checkSql = "SELECT COUNT(*) FROM medecins WHERE id = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id);
            
            if (count == null || count == 0) {
                return ResponseEntity.notFound().build();
            }

            String sql = """
                UPDATE medecins 
                SET nom = ?, prenom = ?, specialite = ?, telephone = ?, email = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """;

            jdbcTemplate.update(sql,
                data.get("nom").toString().trim(),
                data.get("prenom").toString().trim(),
                data.get("specialite") != null ? data.get("specialite").toString() : null,
                data.get("telephone") != null ? data.get("telephone").toString() : null,
                data.get("email").toString().trim(),
                id
            );

            // Récupérer le médecin mis à jour
            String selectSql = "SELECT * FROM medecins WHERE id = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(selectSql, id);
            
            if (!results.isEmpty()) {
                System.out.println("Médecin mis à jour avec succès: " + results.get(0));
                return ResponseEntity.ok(results.get(0));
            } else {
                return ResponseEntity.status(500).body(Collections.singletonMap("error", "Erreur lors de la mise à jour"));
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de la mise à jour du médecin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Erreur lors de la mise à jour: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedecin(@PathVariable Long id) {
        try {
            System.out.println("Suppression du médecin " + id);

            // Vérifier que le médecin existe
            String checkSql = "SELECT COUNT(*) FROM medecins WHERE id = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id);
            
            if (count == null || count == 0) {
                return ResponseEntity.notFound().build();
            }

            String sql = "DELETE FROM medecins WHERE id = ?";
            jdbcTemplate.update(sql, id);

            System.out.println("Médecin supprimé avec succès");
            return ResponseEntity.ok(Collections.singletonMap("message", "Médecin supprimé avec succès"));

        } catch (Exception e) {
            System.err.println("Erreur lors de la suppression du médecin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Erreur lors de la suppression: " + e.getMessage()));
        }
    }

}