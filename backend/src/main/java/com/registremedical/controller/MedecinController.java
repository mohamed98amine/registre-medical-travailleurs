package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/medecin")
@CrossOrigin(origins = "*")
public class MedecinController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Saisir les résultats d'examen
    @PostMapping("/resultats")
    public ResponseEntity<?> saisirResultats(@RequestBody Map<String, Object> data) {
        try {
            String sql = """
                INSERT INTO resultats_examens 
                (visite_id, tension_arterielle, frequence_cardiaque, poids, taille, 
                 vision_od, vision_og, audition, observations, verdict, restrictions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            jdbcTemplate.update(sql,
                Long.valueOf(data.get("visiteId").toString()),
                data.get("tensionArterielle"),
                data.get("frequenceCardiaque") != null ? Integer.valueOf(data.get("frequenceCardiaque").toString()) : null,
                data.get("poids") != null ? Double.valueOf(data.get("poids").toString()) : null,
                data.get("taille") != null ? Double.valueOf(data.get("taille").toString()) : null,
                data.get("visionOD"),
                data.get("visionOG"),
                data.get("audition"),
                data.get("observations"),
                data.get("verdict").toString(),
                data.get("restrictions")
            );
            
            // Mettre à jour le statut de la visite
            jdbcTemplate.update("UPDATE visites SET statut = 'Terminée', aptitude = ? WHERE id = ?",
                data.get("verdict").toString(), Long.valueOf(data.get("visiteId").toString()));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Résultats enregistrés avec succès");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Générer un certificat
    @PostMapping("/certificat/{visiteId}")
    public ResponseEntity<?> genererCertificat(@PathVariable Long visiteId) {
        try {
            // Récupérer les données de la visite et des résultats
            String sql = """
                SELECT v.id, v.type, v.date, v.heure, v.aptitude,
                       e.nom as employeur_nom, e.email as employeur_email,
                       m.nom as medecin_nom, m.prenom as medecin_prenom,
                       r.tension_arterielle, r.frequence_cardiaque, r.poids, r.taille,
                       r.vision_od, r.vision_og, r.audition, r.observations, r.verdict, r.restrictions
                FROM visites v
                LEFT JOIN employeurs e ON e.id = v.employeur_id
                LEFT JOIN medecins m ON m.id = v.medecin_id
                LEFT JOIN resultats_examens r ON r.visite_id = v.id
                WHERE v.id = ?
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, visiteId);
            if (results.isEmpty()) {
                throw new RuntimeException("Visite non trouvée");
            }
            
            Map<String, Object> data = results.get(0);
            
            // Générer un numéro de certificat unique
            String numeroCertificat = "CERT-" + visiteId + "-" + System.currentTimeMillis();
            
            // Enregistrer le certificat (sans le PDF pour l'instant)
            String insertCert = """
                INSERT INTO certificats (visite_id, resultat_id, numero_certificat, nom_fichier)
                SELECT ?, r.id, ?, ?
                FROM resultats_examens r WHERE r.visite_id = ?
                """;
            
            String nomFichier = "certificat_" + numeroCertificat + ".pdf";
            jdbcTemplate.update(insertCert, visiteId, numeroCertificat, nomFichier, visiteId);
            
            // Envoyer notification à l'employeur
            String message = "Certificat médical disponible pour la visite du " + data.get("date") + 
                           ". Verdict: " + data.get("verdict");
            
            String notifSql = "INSERT INTO notifications (message, destinataire_type, destinataire_email, statut) VALUES (?, 'EMPLOYEUR', ?, 'NON_LU')";
            String employeurEmail = data.get("employeur_email") != null ? data.get("employeur_email").toString() : "damine98@gmail.com";
            jdbcTemplate.update(notifSql, message, employeurEmail);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Certificat généré et envoyé à l'employeur");
            response.put("numeroCertificat", numeroCertificat);
            response.put("donnees", data);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Consulter le dossier médical d'un employeur
    @GetMapping("/dossier/{employeurId}")
    public ResponseEntity<?> consulterDossier(@PathVariable Long employeurId) {
        try {
            String sql = """
                SELECT v.id, v.type, v.date, v.heure, v.statut, v.aptitude,
                       e.nom as employeur_nom,
                       m.nom as medecin_nom, m.prenom as medecin_prenom,
                       r.tension_arterielle, r.frequence_cardiaque, r.poids, r.taille,
                       r.vision_od, r.vision_og, r.audition, r.observations, r.verdict, r.restrictions,
                       c.numero_certificat, c.nom_fichier, c.envoye_employeur, c.date_envoi
                FROM visites v
                LEFT JOIN employeurs e ON e.id = v.employeur_id
                LEFT JOIN medecins m ON m.id = v.medecin_id
                LEFT JOIN resultats_examens r ON r.visite_id = v.id
                LEFT JOIN certificats c ON c.visite_id = v.id
                WHERE v.employeur_id = ?
                ORDER BY v.date DESC, v.heure DESC
                """;
            
            List<Map<String, Object>> dossier = jdbcTemplate.queryForList(sql, employeurId);
            return ResponseEntity.ok(dossier);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }



    @GetMapping("/certificats")
    public ResponseEntity<List<Map<String, Object>>> getCertificats() {
        try {
            String sql = """
                SELECT c.id, c.numero_certificat, c.envoye_employeur, c.date_envoi, c.created_at,
                       v.date as date_visite, r.verdict,
                       e.nom as employeur_nom, e.prenom as employeur_prenom,
                       ent.nom as entreprise_nom
                FROM certificats c
                JOIN visites v ON c.visite_id = v.id
                JOIN resultats_examens r ON c.resultat_id = r.id
                JOIN employeurs e ON v.employeur_id = e.id
                JOIN entreprises ent ON e.entreprise_id = ent.id
                WHERE v.medecin_id = ?
                ORDER BY c.created_at DESC
                """;
            List<Map<String, Object>> certificats = jdbcTemplate.queryForList(sql, 1L);
            return ResponseEntity.ok(certificats);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/certificats/{id}/download")
    public ResponseEntity<byte[]> downloadCertificat(@PathVariable Long id) {
        try {
            String sql = "SELECT fichier_pdf, nom_fichier FROM certificats WHERE id = ?";
            Map<String, Object> certificat = jdbcTemplate.queryForMap(sql, id);
            
            byte[] pdfData = (byte[]) certificat.get("fichier_pdf");
            String nomFichier = (String) certificat.get("nom_fichier");
            
            if (pdfData == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"" + nomFichier + "\"")
                    .body(pdfData);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}