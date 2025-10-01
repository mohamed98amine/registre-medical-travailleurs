package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam String destinataireType,
            @RequestParam String destinataireEmail) {
        try {
            String sql = "SELECT * FROM notifications WHERE destinataire_type = ? AND destinataire_email = ? ORDER BY date DESC";
            List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, destinataireType, destinataireEmail);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Map<String, Object> data) {
        try {
            String sql = "INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES (?, NOW(), ?, ?, 'NON_LU')";
            jdbcTemplate.update(sql, 
                data.get("message").toString(),
                data.get("destinataireType").toString(),
                data.get("destinataireEmail").toString()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notification créée avec succès");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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

    @GetMapping("/count-unread")
    public ResponseEntity<?> countUnread(
            @RequestParam String destinataireType,
            @RequestParam String destinataireEmail) {
        try {
            String sql = "SELECT COUNT(*) FROM notifications WHERE destinataire_type = ? AND destinataire_email = ? AND statut = 'NON_LU'";
            Long count = jdbcTemplate.queryForObject(sql, Long.class, destinataireType, destinataireEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}