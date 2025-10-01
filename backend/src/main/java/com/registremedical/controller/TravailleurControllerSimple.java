package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/travailleurs-simple")
@CrossOrigin(origins = "*")
public class TravailleurControllerSimple {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping
    public ResponseEntity<?> createTravailleur(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/travailleurs-simple appelé ===");
        System.out.println("Données reçues: " + data);
        
        try {
            // Ajouter la colonne matricule si elle n'existe pas
            try {
                jdbcTemplate.execute("ALTER TABLE travailleurs ADD COLUMN matricule VARCHAR(255)");
                System.out.println("Colonne matricule ajoutée avec succès");
            } catch (Exception e) {
                System.out.println("Colonne matricule existe déjà ou erreur: " + e.getMessage());
            }
            
            // Ajouter la colonne date_embauche si elle n'existe pas
            try {
                jdbcTemplate.execute("ALTER TABLE travailleurs ADD COLUMN date_embauche DATE");
                System.out.println("Colonne date_embauche ajoutée avec succès");
            } catch (Exception e) {
                System.out.println("Colonne date_embauche existe déjà ou erreur: " + e.getMessage());
            }
            
            String sql = "INSERT INTO travailleurs (nom, prenom, matricule, email, telephone, adresse, date_naissance, date_embauche, poste, entreprise_id, ville, code_postal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'N/A', '00000')";
            
            Object entrepriseObj = data.get("entreprise");
            Long entrepriseId = null;
            if (entrepriseObj instanceof Map) {
                entrepriseId = Long.valueOf(((Map<String, Object>) entrepriseObj).get("id").toString());
            }
            
            jdbcTemplate.update(sql,
                data.get("nom"),
                data.get("prenom"),
                data.get("matricule"),
                data.get("email"),
                data.get("telephone"),
                data.get("adresse"),
                data.get("dateNaissance"),
                data.get("dateEmbauche"),
                data.get("poste"),
                entrepriseId
            );
            
            System.out.println("Travailleur inséré avec succès");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Travailleur créé avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("Erreur lors de la création: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllTravailleurs() {
        try {
            String sql = "SELECT * FROM travailleurs";
            List<Map<String, Object>> travailleurs = jdbcTemplate.queryForList(sql);
            return ResponseEntity.ok(travailleurs);
        } catch (Exception e) {
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
}