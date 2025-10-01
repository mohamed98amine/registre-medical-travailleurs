package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Obtenir les médecins par spécialité (endpoint public)
    @GetMapping("/medecins/specialite/{specialite}")
    public ResponseEntity<?> getMedecinsBySpecialite(@PathVariable String specialite) {
        try {
            String sql = "SELECT * FROM medecins WHERE specialite = ? AND disponible = true ORDER BY nom, prenom";
            List<Map<String, Object>> medecins = jdbcTemplate.queryForList(sql, specialite);
            return ResponseEntity.ok(medecins);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la récupération des médecins: " + ex.getMessage());
        }
    }

    // Obtenir toutes les spécialités disponibles
    @GetMapping("/specialites")
    public ResponseEntity<?> getSpecialites() {
        try {
            String sql = "SELECT DISTINCT specialite FROM medecins WHERE disponible = true ORDER BY specialite";
            List<String> specialites = jdbcTemplate.queryForList(sql, String.class);
            return ResponseEntity.ok(specialites);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des spécialités: " + ex.getMessage());
        }
    }
}
