package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// @RestController
@RequestMapping("/api/employeurs-disabled")
@CrossOrigin(origins = "*")
public class EmployeurController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllEmployeurs() {
        try {
            String sql = "SELECT id, nom FROM employeurs ORDER BY id";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
            
            List<Map<String, Object>> employeurs = results.stream().map(row -> {
                Map<String, Object> employeur = new HashMap<>();
                employeur.put("id", row.get("id"));
                employeur.put("nom", row.get("nom"));
                employeur.put("prenom", "");
                employeur.put("email", "");
                employeur.put("telephone", "");
                employeur.put("role", "EMPLOYEUR");
                employeur.put("active", true);
                return employeur;
            }).toList();
            
            return ResponseEntity.ok(employeurs);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createEmployeur(@RequestBody Map<String, Object> data) {
        try {
            String sql = "INSERT INTO employeurs (nom) VALUES (?)";
            jdbcTemplate.update(sql, data.get("nom"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Employeur créé avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}