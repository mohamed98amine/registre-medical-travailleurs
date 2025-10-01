package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/visites-jdbc")
@CrossOrigin(origins = "*")
@Component
public class VisiteControllerJdbc {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllVisites() {
        try {
            System.out.println("=== JDBC Controller - getAllVisites ===");
            String sql = """
                SELECT v.id, v.type, v.date, v.heure, v.statut, v.aptitude,
                       e.id as employeur_id, e.nom as employeur_nom,
                       m.id as medecin_id, m.nom as medecin_nom, m.prenom as medecin_prenom
                FROM visites v
                LEFT JOIN employeurs e ON e.id = v.employeur_id
                LEFT JOIN medecins m ON m.id = v.medecin_id
                ORDER BY v.date DESC, v.heure DESC
                """;
            
            System.out.println("Exécution de la requête SQL...");
            List<Map<String, Object>> visites = jdbcTemplate.queryForList(sql);
            System.out.println("Nombre de visites trouvées: " + visites.size());
            
            List<Map<String, Object>> response = visites.stream().map(row -> {
                Map<String, Object> visite = new HashMap<>();
                visite.put("id", row.get("id"));
                visite.put("type", row.get("type"));
                visite.put("date", row.get("date").toString());
                visite.put("heure", row.get("heure").toString());
                visite.put("statut", row.get("statut"));
                visite.put("aptitude", row.get("aptitude"));
                
                Map<String, Object> employeur = new HashMap<>();
                employeur.put("id", row.get("employeur_id"));
                employeur.put("nom", row.get("employeur_nom"));
                visite.put("employeur", employeur);
                
                Map<String, Object> medecin = new HashMap<>();
                medecin.put("id", row.get("medecin_id"));
                medecin.put("nom", row.get("medecin_nom"));
                if (row.get("medecin_prenom") != null) {
                    medecin.put("prenom", row.get("medecin_prenom"));
                }
                visite.put("medecin", medecin);
                
                return visite;
            }).toList();
            
            System.out.println("Retour de " + response.size() + " visites transformées");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Erreur dans getAllVisites: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/{id}/notify")
    public ResponseEntity<?> sendNotifications(@PathVariable Long id) {
        try {
            System.out.println("=== Envoi notifications pour visite ID: " + id + " ===");
            
            // Récupérer la visite avec JDBC
            String sql = """
                SELECT v.id, v.type, v.date, v.heure,
                       e.nom as employeur_nom, e.email as employeur_email,
                       m.nom as medecin_nom, m.email as medecin_email
                FROM visites v
                LEFT JOIN employeurs e ON e.id = v.employeur_id
                LEFT JOIN medecins m ON m.id = v.medecin_id
                WHERE v.id = ?
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, id);
            if (results.isEmpty()) {
                throw new RuntimeException("Visite non trouvée");
            }
            
            Map<String, Object> visite = results.get(0);
            System.out.println("Visite trouvée: " + visite.get("type"));
            System.out.println("Email employeur: " + visite.get("employeur_email"));
            System.out.println("Email médecin: " + visite.get("medecin_email"));
            
            // Vérifier que les emails ne sont pas null
            String employeurEmail = visite.get("employeur_email") != null ? visite.get("employeur_email").toString() : "damine98@gmail.com";
            String medecinEmail = visite.get("medecin_email") != null ? visite.get("medecin_email").toString() : "damine98@gmail.com";
            
            String messageMedecin = "Nouvelle visite (" + visite.get("type") + ") prévue avec " + 
                                  visite.get("employeur_nom") + " le " + 
                                  visite.get("date") + " à " + visite.get("heure");
            
            String messageEmployeur = "Nouvelle visite (" + visite.get("type") + ") prévue avec " + 
                                    visite.get("medecin_nom") + " le " + 
                                    visite.get("date") + " à " + visite.get("heure");
            
            // Créer les notifications avec JdbcTemplate
            String sqlInsert = "INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES (?, NOW(), ?, ?, 'NON_LU')";
            
            jdbcTemplate.update(sqlInsert, messageMedecin, "MEDECIN", medecinEmail);
            jdbcTemplate.update(sqlInsert, messageEmployeur, "EMPLOYEUR", employeurEmail);
            
            System.out.println("Notifications créées avec succès");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notifications envoyées avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createVisite(@RequestBody Map<String, Object> data) {
        try {
            Long employeurId = Long.valueOf(data.get("employeurId").toString());
            Long medecinId = Long.valueOf(data.get("medecinId").toString());
            
            // Vérifier que l'employeur et le médecin existent
            Long employeurCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM employeurs WHERE id = ?", Long.class, employeurId);
            Long medecinCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM medecins WHERE id = ?", Long.class, medecinId);
            
            if (employeurCount == 0) {
                throw new RuntimeException("Employeur avec ID " + employeurId + " n'existe pas");
            }
            if (medecinCount == 0) {
                throw new RuntimeException("Médecin avec ID " + medecinId + " n'existe pas");
            }
            
            // Insérer la visite
            String sqlInsert = "INSERT INTO visites (type, date, heure, statut, employeur_id, medecin_id) VALUES (?, ?, ?, 'Prévue', ?, ?)";
            jdbcTemplate.update(sqlInsert, 
                data.get("typeVisite").toString(),
                LocalDate.parse(data.get("dateVisite").toString()),
                LocalTime.parse(data.get("heureVisite").toString()),
                employeurId,
                medecinId
            );
            
            // Récupérer l'ID de la visite créée
            Long visiteId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
            
            // Récupérer les détails pour les notifications
            String sql = """
                SELECT v.id, v.type, v.date, v.heure,
                       e.nom as employeur_nom, e.email as employeur_email,
                       m.nom as medecin_nom, m.email as medecin_email
                FROM visites v
                LEFT JOIN employeurs e ON e.id = v.employeur_id
                LEFT JOIN medecins m ON m.id = v.medecin_id
                WHERE v.id = ?
                """;
            
            Map<String, Object> visite = jdbcTemplate.queryForMap(sql, visiteId);
            
            // Vérifier que les emails ne sont pas null
            String employeurEmail = visite.get("employeur_email") != null ? visite.get("employeur_email").toString() : "damine98@gmail.com";
            String medecinEmail = visite.get("medecin_email") != null ? visite.get("medecin_email").toString() : "damine98@gmail.com";
            
            // Créer les notifications
            String messageMedecin = "Nouvelle visite (" + visite.get("type") + ") prévue avec " + 
                                  visite.get("employeur_nom") + " le " + 
                                  visite.get("date") + " à " + visite.get("heure");
            
            String messageEmployeur = "Nouvelle visite (" + visite.get("type") + ") prévue avec " + 
                                    visite.get("medecin_nom") + " le " + 
                                    visite.get("date") + " à " + visite.get("heure");
            
            String sqlNotif = "INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES (?, NOW(), ?, ?, 'NON_LU')";
            
            jdbcTemplate.update(sqlNotif, messageMedecin, "MEDECIN", medecinEmail);
            jdbcTemplate.update(sqlNotif, messageEmployeur, "EMPLOYEUR", employeurEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", visiteId);
            response.put("type", visite.get("type"));
            response.put("date", visite.get("date").toString());
            response.put("heure", visite.get("heure").toString());
            response.put("statut", "Prévue");
            
            Map<String, Object> employeurMap = new HashMap<>();
            employeurMap.put("id", employeurId);
            employeurMap.put("nom", visite.get("employeur_nom"));
            response.put("employeur", employeurMap);
            
            Map<String, Object> medecinMap = new HashMap<>();
            medecinMap.put("id", medecinId);
            medecinMap.put("nom", visite.get("medecin_nom"));
            response.put("medecin", medecinMap);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}