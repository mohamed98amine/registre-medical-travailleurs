package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DisponibiliteMemoryMySQLController {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private JavaMailSender mailSender;

    // Backup en mémoire si MySQL échoue
    private static final Map<Long, Map<String, Object>> disponibilites = new ConcurrentHashMap<>();
    private static final Map<Long, Map<String, Object>> indisponibilites = new ConcurrentHashMap<>();
    private static final Map<Long, Map<String, Object>> emploisTemps = new ConcurrentHashMap<>();
    private static final AtomicLong idCounter = new AtomicLong(1);
    private static final AtomicLong emploiTempsIdCounter = new AtomicLong(1);

    @PostMapping("/disponibilites")
    public ResponseEntity<?> ajouterDisponibilite(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/disponibilites appelé ===");
        System.out.println("Données reçues: " + data);

        Map<String, Object> response = new HashMap<>();
        try {
            // Essayer MySQL d'abord
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS disponibilites_medecin (id INT AUTO_INCREMENT PRIMARY KEY, jour_semaine VARCHAR(20), heure_debut VARCHAR(10), heure_fin VARCHAR(10))");
                jdbcTemplate.update("INSERT INTO disponibilites_medecin (jour_semaine, heure_debut, heure_fin) VALUES (?, ?, ?)",
                    data.get("jourSemaine"), data.get("heureDebut"), data.get("heureFin"));
                System.out.println("Sauvé en MySQL");
            } catch (Exception e) {
                System.out.println("MySQL échoué, utilisation mémoire: " + e.getMessage());
            }

            // Toujours sauver en mémoire pour affichage immédiat
            Long id = idCounter.getAndIncrement();
            Map<String, Object> creneau = new HashMap<>();
            creneau.put("id", id);
            creneau.put("jour_semaine", data.get("jourSemaine"));
            creneau.put("heure_debut", data.get("heureDebut"));
            creneau.put("heure_fin", data.get("heureFin"));
            
            disponibilites.put(id, creneau);
            System.out.println("Sauvé en mémoire: " + creneau);

            response.put("success", true);
            response.put("message", "Disponibilité ajoutée");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/indisponibilites")
    public ResponseEntity<?> ajouterIndisponibilite(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Essayer MySQL
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS creneaux_indisponibles (id INT AUTO_INCREMENT PRIMARY KEY, date_debut VARCHAR(50), date_fin VARCHAR(50), motif VARCHAR(255))");
                jdbcTemplate.update("INSERT INTO creneaux_indisponibles (date_debut, date_fin, motif) VALUES (?, ?, ?)",
                    data.get("dateDebut"), data.get("dateFin"), data.get("motif"));
            } catch (Exception e) {
                System.out.println("MySQL indispo échoué: " + e.getMessage());
            }

            // Sauver en mémoire
            Long id = idCounter.getAndIncrement();
            Map<String, Object> indispo = new HashMap<>();
            indispo.put("id", id);
            indispo.put("date_debut", data.get("dateDebut"));
            indispo.put("date_fin", data.get("dateFin"));
            indispo.put("motif", data.get("motif"));
            
            indisponibilites.put(id, indispo);

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
        System.out.println("=== GET /api/medecin/disponibilite/" + userId + " appelé ===");
        
        try {
            List<Map<String, Object>> dispoList = new ArrayList<>();
            List<Map<String, Object>> indispoList = new ArrayList<>();

            // Essayer MySQL d'abord
            try {
                dispoList = jdbcTemplate.queryForList("SELECT * FROM disponibilites_medecin");
                indispoList = jdbcTemplate.queryForList("SELECT * FROM creneaux_indisponibles");
                System.out.println("Données MySQL récupérées");
            } catch (Exception e) {
                System.out.println("MySQL lecture échouée, utilisation mémoire");
                dispoList = new ArrayList<>(disponibilites.values());
                indispoList = new ArrayList<>(indisponibilites.values());
            }

            System.out.println("Disponibilités: " + dispoList.size());
            System.out.println("Indisponibilités: " + indispoList.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("disponibilites", dispoList);
            result.put("indisponibilites", indispoList);
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            System.err.println("Erreur GET: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/envoyer-emploi-temps")
    public ResponseEntity<?> envoyerEmploiTemps(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/envoyer-emploi-temps appelé ===");
        System.out.println("Données reçues: " + data);
        
        try {
            // Vérifier les données requises
            if (data.get("emailChefZone") == null || data.get("emailChefZone").toString().trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "Email du chef de zone requis");
                return ResponseEntity.badRequest().body(response);
            }

            // Préparer les données avec valeurs par défaut
            String nomMedecin = data.get("nomMedecin") != null ? data.get("nomMedecin").toString() : "Dr. Médecin";
            String emailMedecin = data.get("emailMedecin") != null ? data.get("emailMedecin").toString() : "medecin@example.com";
            String emailChefZone = data.get("emailChefZone").toString();
            String disponibilites = data.get("disponibilites") != null ? data.get("disponibilites").toString() : "[]";
            String indisponibilites = data.get("indisponibilites") != null ? data.get("indisponibilites").toString() : "[]";
            
            System.out.println("Insertion avec: " + nomMedecin + ", " + emailMedecin + ", " + emailChefZone);

            // Essayer MySQL d'abord
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS emplois_temps_medecins (id INT AUTO_INCREMENT PRIMARY KEY, nom_medecin VARCHAR(100), email_medecin VARCHAR(100), email_chef_zone VARCHAR(100), disponibilites TEXT, indisponibilites TEXT, date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
                
                String sql = "INSERT INTO emplois_temps_medecins (nom_medecin, email_medecin, email_chef_zone, disponibilites, indisponibilites) VALUES (?, ?, ?, ?, ?)";
                int result = jdbcTemplate.update(sql, nomMedecin, emailMedecin, emailChefZone, disponibilites, indisponibilites);
                
                System.out.println("Lignes insérées: " + result);
                System.out.println("Emploi du temps sauvegardé pour: " + emailChefZone);
            } catch (Exception mysqlError) {
                System.err.println("MySQL échoué, sauvegarde en mémoire: " + mysqlError.getMessage());
                
                // Sauvegarder en mémoire comme backup
                Long id = emploiTempsIdCounter.getAndIncrement();
                Map<String, Object> emploiTemps = new HashMap<>();
                emploiTemps.put("id", id);
                emploiTemps.put("nom_medecin", nomMedecin);
                emploiTemps.put("email_medecin", emailMedecin);
                emploiTemps.put("email_chef_zone", emailChefZone);
                emploiTemps.put("disponibilites", disponibilites);
                emploiTemps.put("indisponibilites", indisponibilites);
                emploiTemps.put("date_envoi", new java.util.Date());
                
                emploisTemps.put(id, emploiTemps);
                System.out.println("Sauvegardé en mémoire avec ID: " + id);
            }

            // Envoyer l'email avec le planning
            try {
                envoyerEmailPlanning(nomMedecin, emailMedecin, emailChefZone, disponibilites, indisponibilites);
                System.out.println("Email envoyé avec succès à: " + emailChefZone);
            } catch (Exception emailError) {
                System.err.println("Erreur envoi email: " + emailError.getMessage());
                // Ne pas faire échouer la requête si l'email échoue
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Emploi du temps envoyé par email au chef de zone: " + emailChefZone);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur envoi: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Erreur lors de l'envoi: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/chef-zone/medecins-disponibles")
    public ResponseEntity<?> getMedecinsDisponibles() {
        try {
            // Essayer MySQL d'abord
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS emplois_temps_medecins (id INT AUTO_INCREMENT PRIMARY KEY, nom_medecin VARCHAR(100), email_medecin VARCHAR(100), email_chef_zone VARCHAR(100), disponibilites TEXT, indisponibilites TEXT, date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
                
                String sql = "SELECT * FROM emplois_temps_medecins ORDER BY date_envoi DESC";
                List<Map<String, Object>> medecins = jdbcTemplate.queryForList(sql);
                
                System.out.println("Médecins disponibles trouvés: " + medecins.size());
                return ResponseEntity.ok(medecins);
                
            } catch (Exception mysqlError) {
                System.err.println("MySQL lecture échouée, utilisation mémoire: " + mysqlError.getMessage());
                
                // Utiliser les données en mémoire comme backup
                List<Map<String, Object>> medecinsMemoire = new ArrayList<>(emploisTemps.values());
                System.out.println("Médecins en mémoire: " + medecinsMemoire.size());
                
                return ResponseEntity.ok(medecinsMemoire);
            }

        } catch (Exception e) {
            System.err.println("Erreur GET medecins disponibles: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
    
    private void envoyerEmailPlanning(String nomMedecin, String emailMedecin, String emailChefZone, String disponibilites, String indisponibilites) throws Exception {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("amribnas617@gmail.com");
            helper.setTo(emailChefZone);
            helper.setSubject("Planning de disponibilité - " + nomMedecin);
            
            // Créer le contenu HTML de l'email
            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<html><body style='font-family: Arial, sans-serif;'>");
            htmlContent.append("<div style='max-width: 800px; margin: 0 auto; padding: 20px;'>");
            htmlContent.append("<h2 style='color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;'>Planning de disponibilité</h2>");
            htmlContent.append("<div style='background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;'>");
            htmlContent.append("<p><strong>Médecin:</strong> ").append(nomMedecin).append("</p>");
            htmlContent.append("<p><strong>Email:</strong> ").append(emailMedecin).append("</p>");
            htmlContent.append("<p><strong>Date d'envoi:</strong> ").append(new java.util.Date()).append("</p>");
            htmlContent.append("</div>");
            
            // Ajouter les disponibilités
            htmlContent.append("<h3 style='color: #059669; margin-top: 30px;'>Disponibilités régulières:</h3>");
            htmlContent.append("<table style='border-collapse: collapse; width: 100%; border: 1px solid #d1d5db;'>");
            htmlContent.append("<tr style='background-color: #059669; color: white;'><th style='padding: 12px; border: 1px solid #d1d5db;'>Jour</th><th style='padding: 12px; border: 1px solid #d1d5db;'>Heure début</th><th style='padding: 12px; border: 1px solid #d1d5db;'>Heure fin</th></tr>");
            
            try {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> dispoList = mapper.readValue(disponibilites, new TypeReference<List<Map<String, Object>>>(){});
                
                if (dispoList.isEmpty()) {
                    htmlContent.append("<tr><td colspan='3' style='padding: 12px; border: 1px solid #d1d5db; text-align: center; color: #6b7280;'>Aucune disponibilité définie</td></tr>");
                } else {
                    for (Map<String, Object> dispo : dispoList) {
                        htmlContent.append("<tr style='background-color: #f9fafb;'>");
                        htmlContent.append("<td style='padding: 12px; border: 1px solid #d1d5db;'>").append(dispo.get("jour_semaine")).append("</td>");
                        htmlContent.append("<td style='padding: 12px; border: 1px solid #d1d5db;'>").append(dispo.get("heure_debut")).append("</td>");
                        htmlContent.append("<td style='padding: 12px; border: 1px solid #d1d5db;'>").append(dispo.get("heure_fin")).append("</td>");
                        htmlContent.append("</tr>");
                    }
                }
            } catch (Exception e) {
                htmlContent.append("<tr><td colspan='3' style='padding: 12px; border: 1px solid #d1d5db; text-align: center; color: #ef4444;'>Erreur lors du parsing des disponibilités</td></tr>");
            }
            
            htmlContent.append("</table>");
            
            // Ajouter les indisponibilités
            htmlContent.append("<h3 style='color: #dc2626; margin-top: 30px;'>Indisponibilités ponctuelles:</h3>");
            htmlContent.append("<table style='border-collapse: collapse; width: 100%; border: 1px solid #d1d5db;'>");
            htmlContent.append("<tr style='background-color: #dc2626; color: white;'><th style='padding: 12px; border: 1px solid #d1d5db;'>Date début</th><th style='padding: 12px; border: 1px solid #d1d5db;'>Date fin</th><th style='padding: 12px; border: 1px solid #d1d5db;'>Motif</th></tr>");
            
            try {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> indispoList = mapper.readValue(indisponibilites, new TypeReference<List<Map<String, Object>>>(){});
                
                if (indispoList.isEmpty()) {
                    htmlContent.append("<tr><td colspan='3' style='padding: 12px; border: 1px solid #d1d5db; text-align: center; color: #6b7280;'>Aucune indisponibilité définie</td></tr>");
                } else {
                    for (Map<String, Object> indispo : indispoList) {
                        htmlContent.append("<tr style='background-color: #fef2f2;'>");
                        htmlContent.append("<td style='padding: 12px; border: 1px solid #d1d5db;'>").append(indispo.get("date_debut")).append("</td>");
                        htmlContent.append("<td style='padding: 12px; border: 1px solid #d1d5db;'>").append(indispo.get("date_fin")).append("</td>");
                        htmlContent.append("<td style='padding: 12px; border: 1px solid #d1d5db;'>").append(indispo.get("motif")).append("</td>");
                        htmlContent.append("</tr>");
                    }
                }
            } catch (Exception e) {
                htmlContent.append("<tr><td colspan='3' style='padding: 12px; border: 1px solid #d1d5db; text-align: center; color: #ef4444;'>Erreur lors du parsing des indisponibilités</td></tr>");
            }
            
            htmlContent.append("</table>");
            htmlContent.append("<div style='margin-top: 30px; padding: 15px; background-color: #eff6ff; border-radius: 8px;'>");
            htmlContent.append("<p style='margin: 0;'><strong>Note:</strong> Ce planning a été généré automatiquement par le système de gestion médicale.</p>");
            htmlContent.append("<p style='margin: 5px 0 0 0;'>Pour toute question, veuillez contacter directement le médecin à l'adresse: ").append(emailMedecin).append("</p>");
            htmlContent.append("</div>");
            htmlContent.append("<br><p style='color: #6b7280;'>Cordialement,<br><strong>Système de gestion médicale</strong></p>");
            htmlContent.append("</div></body></html>");
            
            helper.setText(htmlContent.toString(), true);
            
            mailSender.send(message);
            System.out.println("Email envoyé avec succès à: " + emailChefZone);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}