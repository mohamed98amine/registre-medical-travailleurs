package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications-simple")
@CrossOrigin(origins = "*")
public class NotificationControllerSimple {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam String destinataireType,
            @RequestParam String destinataireEmail) {
        try {
            System.out.println("=== Récupération notifications simple ===");
            System.out.println("Type: " + destinataireType + ", Email: " + destinataireEmail);
            
            String sql = "SELECT * FROM notifications WHERE destinataire_type = ? AND destinataire_email = ? ORDER BY date DESC";
            
            List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, destinataireType, destinataireEmail);
            
            System.out.println("Notifications trouvées: " + notifications.size());
            
            return ResponseEntity.ok(notifications);
            
        } catch (Exception e) {
            System.err.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}/lu")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            String sql = "UPDATE notifications SET statut = 'LU' WHERE id = ?";
            jdbcTemplate.update(sql, id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification marquée comme lue");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}