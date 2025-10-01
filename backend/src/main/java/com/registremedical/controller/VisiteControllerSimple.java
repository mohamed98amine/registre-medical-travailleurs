package com.registremedical.controller;

import com.registremedical.entity.Employeur;
import com.registremedical.entity.Medecin;
import com.registremedical.entity.Visite;
import com.registremedical.repository.EmployeurRepository;
import com.registremedical.repository.MedecinRepository;
import com.registremedical.repository.VisiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/api/visites")
@CrossOrigin(origins = "*")
public class VisiteControllerSimple {

    @Autowired
    private VisiteRepository visiteRepository;
    
    @Autowired
    private EmployeurRepository employeurRepository;
    
    @Autowired
    private MedecinRepository medecinRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<?> getAllVisites() {
        try {
            List<Visite> visites = visiteRepository.findAllWithEmployeurAndMedecin();
            
            List<Map<String, Object>> response = visites.stream().map(visite -> {
                Map<String, Object> visiteMap = new HashMap<>();
                visiteMap.put("id", visite.getId());
                visiteMap.put("type", visite.getType());
                visiteMap.put("date", visite.getDate().toString());
                visiteMap.put("heure", visite.getHeure().toString());
                visiteMap.put("statut", visite.getStatut());
                visiteMap.put("aptitude", visite.getAptitude());
                
                Map<String, Object> employeur = new HashMap<>();
                employeur.put("id", visite.getEmployeur().getId());
                employeur.put("nom", visite.getEmployeur().getNom());
                visiteMap.put("employeur", employeur);
                
                Map<String, Object> medecin = new HashMap<>();
                medecin.put("id", visite.getMedecin().getId());
                medecin.put("nom", visite.getMedecin().getNom());
                if (visite.getMedecin().getPrenom() != null) {
                    medecin.put("prenom", visite.getMedecin().getPrenom());
                }
                visiteMap.put("medecin", medecin);
                
                return visiteMap;
            }).toList();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/test-notify")
    public ResponseEntity<?> testNotifications() {
        try {
            System.out.println("=== Test notifications ===");
            
            // Créer des notifications de test avec JdbcTemplate
            String sqlInsert = "INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES (?, NOW(), ?, ?, 'NON_LU')";
            
            jdbcTemplate.update(sqlInsert, "Test notification pour médecin", "MEDECIN", "medecin@test.com");
            jdbcTemplate.update(sqlInsert, "Test notification pour employeur", "EMPLOYEUR", "employeur@test.com");
            jdbcTemplate.update(sqlInsert, "Test notification pour employeur 2", "EMPLOYEUR", "damine98@gmail.com");
            
            // Compter les notifications
            long totalNotifs = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM notifications", Long.class);
            System.out.println("Total notifications en base: " + totalNotifs);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notifications de test créées");
            response.put("total", totalNotifs);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Erreur test: " + e.getMessage());
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
            
            // Utiliser la même méthode que getAllVisites
            List<Visite> visites = visiteRepository.findAllWithEmployeurAndMedecin();
            Visite visite = visites.stream()
                .filter(v -> v.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Visite non trouvée"));
            
            System.out.println("Visite trouvée: " + visite.getType());
            
            String messageMedecin = "Nouvelle visite (" + visite.getType() + ") prévue avec " + 
                                  visite.getEmployeur().getNom() + " le " + 
                                  visite.getDate() + " à " + visite.getHeure();
            
            String messageEmployeur = "Nouvelle visite (" + visite.getType() + ") prévue avec " + 
                                    visite.getMedecin().getNom() + " le " + 
                                    visite.getDate() + " à " + visite.getHeure();
            
            // Créer les notifications avec JdbcTemplate
            String sqlInsert = "INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES (?, NOW(), ?, ?, 'NON_LU')";
            
            jdbcTemplate.update(sqlInsert, messageMedecin, "MEDECIN", visite.getMedecin().getEmail());
            jdbcTemplate.update(sqlInsert, messageEmployeur, "EMPLOYEUR", visite.getEmployeur().getEmail());
            
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
            
            Employeur employeur = employeurRepository.findById(employeurId)
                .orElseThrow(() -> new RuntimeException("Employeur avec ID " + employeurId + " n'existe pas"));
            Medecin medecin = medecinRepository.findById(medecinId)
                .orElseThrow(() -> new RuntimeException("Médecin avec ID " + medecinId + " n'existe pas"));
            
            Visite visite = new Visite();
            visite.setType(data.get("typeVisite").toString());
            visite.setDate(LocalDate.parse(data.get("dateVisite").toString()));
            visite.setHeure(LocalTime.parse(data.get("heureVisite").toString()));
            visite.setStatut("Prévue");
            visite.setAptitude(null);
            visite.setEmployeur(employeur);
            visite.setMedecin(medecin);
            
            Visite savedVisite = visiteRepository.save(visite);
            
            // Créer les notifications
            String messageMedecin = "Nouvelle visite (" + savedVisite.getType() + ") prévue avec " + 
                                  savedVisite.getEmployeur().getNom() + " le " + 
                                  savedVisite.getDate() + " à " + savedVisite.getHeure();
            
            String messageEmployeur = "Nouvelle visite (" + savedVisite.getType() + ") prévue avec " + 
                                    savedVisite.getMedecin().getNom() + " le " + 
                                    savedVisite.getDate() + " à " + savedVisite.getHeure();
            
            // Créer les notifications avec JdbcTemplate
            String sqlInsert = "INSERT INTO notifications (message, date, destinataire_type, destinataire_email, statut) VALUES (?, NOW(), ?, ?, 'NON_LU')";
            
            jdbcTemplate.update(sqlInsert, messageMedecin, "MEDECIN", savedVisite.getMedecin().getEmail());
            jdbcTemplate.update(sqlInsert, messageEmployeur, "EMPLOYEUR", savedVisite.getEmployeur().getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedVisite.getId());
            response.put("type", savedVisite.getType());
            response.put("date", savedVisite.getDate().toString());
            response.put("heure", savedVisite.getHeure().toString());
            response.put("statut", savedVisite.getStatut());
            response.put("aptitude", savedVisite.getAptitude());
            
            Map<String, Object> employeurMap = new HashMap<>();
            employeurMap.put("id", savedVisite.getEmployeur().getId());
            employeurMap.put("nom", savedVisite.getEmployeur().getNom());
            response.put("employeur", employeurMap);
            
            Map<String, Object> medecinMap = new HashMap<>();
            medecinMap.put("id", savedVisite.getMedecin().getId());
            medecinMap.put("nom", savedVisite.getMedecin().getNom());
            if (savedVisite.getMedecin().getPrenom() != null) {
                medecinMap.put("prenom", savedVisite.getMedecin().getPrenom());
            }
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