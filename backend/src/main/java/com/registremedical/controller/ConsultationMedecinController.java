package com.registremedical.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/consultations")
@CrossOrigin(origins = "*")
public class ConsultationMedecinController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/demande-visite")
    public ResponseEntity<?> creerDemandeVisite(@RequestBody Map<String, Object> data) {
        try {
            System.out.println("Données reçues: " + data);
            
            // Créer table simple
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS demandes_visite_simple (id BIGINT AUTO_INCREMENT PRIMARY KEY, medecin_email VARCHAR(255), type_visite VARCHAR(50), specialite VARCHAR(100), date_souhaitee VARCHAR(20), motif TEXT, statut VARCHAR(20) DEFAULT 'EN_ATTENTE', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            // Récupérer l'email du médecin
            String medecinEmail = "ouedrao666gomohamedamine98@gmail.com"; // Email par défaut pour test
            
            String sql = "INSERT INTO demandes_visite_simple (medecin_email, type_visite, specialite, date_souhaitee, motif) VALUES (?, ?, ?, ?, ?)";
            
            jdbcTemplate.update(sql,
                medecinEmail,
                data.get("typeVisite").toString(),
                data.get("specialite").toString(),
                data.get("dateSouhaitee").toString(),
                data.get("motif").toString()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Demande de visite créée avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur création demande: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/medecin/{medecinEmail}")
    public ResponseEntity<?> getConsultationsMedecin(@PathVariable String medecinEmail) {
        try {
            String sql = "SELECT d.*, m.nom as medecin_nom, m.prenom as medecin_prenom FROM demandes_visite_simple d LEFT JOIN medecins m ON d.medecin_email = m.email WHERE d.medecin_email = ? ORDER BY d.created_at DESC";
            
            List<Map<String, Object>> consultations = jdbcTemplate.queryForList(sql, medecinEmail);
            return ResponseEntity.ok(consultations);

        } catch (Exception e) {
            System.err.println("Erreur récupération consultations: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        try {
            // Créer table notifications si nécessaire
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS notifications_employeur (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    employeur_email VARCHAR(255),
                    message TEXT,
                    statut VARCHAR(20),
                    demande_id BIGINT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """);

            // Mettre à jour le statut
            String sql = "UPDATE demandes_visite_simple SET statut = ? WHERE id = ?";
            jdbcTemplate.update(sql, data.get("statut").toString(), id);

            // Créer notification pour l'employeur
            String notifSql = "INSERT INTO notifications_employeur (employeur_email, message, statut, demande_id) VALUES (?, ?, ?, ?)";
            String message = "Votre demande de visite a été " + data.get("statut").toString().toLowerCase();
            jdbcTemplate.update(notifSql, "employeur@test.com", message, data.get("statut").toString(), id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Statut mis à jour et notification envoyée");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur update statut: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/notifications/{employeurEmail}")
    public ResponseEntity<?> getNotifications(@PathVariable String employeurEmail) {
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS notifications_employeur (id BIGINT AUTO_INCREMENT PRIMARY KEY, employeur_email VARCHAR(255), message TEXT, statut VARCHAR(20), demande_id BIGINT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            String sql = "SELECT * FROM notifications_employeur WHERE employeur_email = ? ORDER BY created_at DESC";
            List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, employeurEmail);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Erreur notifications: " + e.getMessage());
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/generer-certificat")
    public ResponseEntity<?> genererCertificat(@RequestBody Map<String, Object> data) {
        System.out.println("=== Génération certificat ===");
        System.out.println("Données reçues: " + data);
        
        Map<String, Object> response = new HashMap<>();
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS certificats_simple (id BIGINT AUTO_INCREMENT PRIMARY KEY, aptitude VARCHAR(50), observations TEXT, travailleur VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
            
            // Récupérer le nom complet du travailleur
            String nomComplet = "";
            if (data.get("travailleurNom") != null) {
                nomComplet = data.get("travailleurNom").toString();
            } else if (data.get("selectedWorkers") != null) {
                // Si plusieurs travailleurs sélectionnés, prendre le premier
                @SuppressWarnings("unchecked")
                List<String> workers = (List<String>) data.get("selectedWorkers");
                if (!workers.isEmpty()) {
                    nomComplet = workers.get(0);
                }
            }
            
            String sql = "INSERT INTO certificats_simple (aptitude, observations, travailleur) VALUES (?, ?, ?)"; 
            
            jdbcTemplate.update(sql,
                data.get("aptitude"),
                data.get("observations"),
                nomComplet
            );

            System.out.println("Certificat inséré avec succès pour: " + nomComplet);
            response.put("success", true);
            response.put("message", "Certificat généré avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    private String genererContenuPdf(Map<String, Object> data) {
        StringBuilder pdf = new StringBuilder();
        pdf.append("%PDF-1.4\n");
        pdf.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
        pdf.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
        pdf.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n");
        pdf.append("4 0 obj\n<< /Length 200 >>\nstream\n");
        pdf.append("BT /F1 12 Tf 50 700 Td (CERTIFICAT MEDICAL) Tj\n");
        pdf.append("0 -20 Td (Nom: ").append(data.get("travailleurNom")).append(" ").append(data.get("travailleurPrenom")).append(") Tj\n");
        pdf.append("0 -20 Td (Entreprise: ").append(data.get("entrepriseNom")).append(") Tj\n");
        pdf.append("0 -20 Td (Aptitude: ").append(data.get("aptitude")).append(") Tj\n");
        if (data.get("observations") != null) {
            pdf.append("0 -20 Td (Observations: ").append(data.get("observations")).append(") Tj\n");
        }
        if (data.get("restrictions") != null && !data.get("restrictions").toString().isEmpty()) {
            pdf.append("0 -20 Td (Restrictions: ").append(data.get("restrictions")).append(") Tj\n");
        }
        pdf.append("ET\nendstream\nendobj\n");
        pdf.append("xref\n0 5\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000125 00000 n\n0000000209 00000 n\n");
        pdf.append("trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n500\n%%EOF");
        return pdf.toString();
    }

    @GetMapping("/consultation/{consultationId}/travailleurs")
    public ResponseEntity<?> getTravailleursConsultation(@PathVariable Long consultationId) {
        try {
            System.out.println("=== DIAGNOSTIC TRAVAILLEURS MYSQL ===");
            System.out.println("Consultation ID: " + consultationId);
            
            // Test de connexion MySQL
            try {
                String testSql = "SELECT 1";
                jdbcTemplate.queryForObject(testSql, Integer.class);
                System.out.println("Connexion MySQL OK");
            } catch (Exception e) {
                System.err.println("Erreur connexion MySQL: " + e.getMessage());
                throw e;
            }
            
            // Vérifier si la table existe
            try {
                String checkTableSql = "SHOW TABLES LIKE 'travailleurs'";
                List<Map<String, Object>> tables = jdbcTemplate.queryForList(checkTableSql);
                System.out.println("Tables 'travailleurs' trouvées: " + tables.size());
                if (tables.isEmpty()) {
                    System.err.println("Table 'travailleurs' n'existe pas!");
                }
            } catch (Exception e) {
                System.err.println("Erreur vérification table: " + e.getMessage());
            }
            
            // Compter les enregistrements
            try {
                String countSql = "SELECT COUNT(*) FROM travailleurs";
                int count = jdbcTemplate.queryForObject(countSql, Integer.class);
                System.out.println("Nombre total de travailleurs dans MySQL: " + count);
            } catch (Exception e) {
                System.err.println("Erreur comptage: " + e.getMessage());
            }
            
            // Récupérer les travailleurs
            String sql = "SELECT id, nom, prenom FROM travailleurs ORDER BY nom, prenom";
            List<Map<String, Object>> travailleurs = jdbcTemplate.queryForList(sql);
            
            System.out.println("Travailleurs récupérés: " + travailleurs.size());
            for (Map<String, Object> t : travailleurs) {
                System.out.println("- ID: " + t.get("id") + ", Nom: " + t.get("nom") + ", Prénom: " + t.get("prenom"));
            }
            
            if (travailleurs.isEmpty()) {
                System.err.println("AUCUN TRAVAILLEUR TROUVE - Verifiez que l'employeur a bien cree des travailleurs!");
            }
            
            return ResponseEntity.ok(travailleurs);
            
        } catch (Exception e) {
            System.err.println("=== ERREUR MYSQL ===");
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/certificats/{employeurEmail}")
    public ResponseEntity<?> getCertificats(@PathVariable String employeurEmail) {
        try {
            String sql = "SELECT id, aptitude, observations, travailleur, created_at FROM certificats_simple ORDER BY created_at DESC";
            List<Map<String, Object>> certificats = jdbcTemplate.queryForList(sql);
            
            // Transformer pour compatibilité
            for (Map<String, Object> cert : certificats) {
                String nomComplet = cert.get("travailleur").toString();
                String[] parts = nomComplet.split(" ", 2);
                
                cert.put("travailleur_nom", parts.length > 0 ? parts[0] : nomComplet);
                cert.put("travailleur_prenom", parts.length > 1 ? parts[1] : "");
                cert.put("entreprise_nom", "Entreprise Test");
                cert.put("date_generation", cert.get("created_at"));
            }
            
            return ResponseEntity.ok(certificats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    @GetMapping("/certificat/pdf/{certificatId}")
    public ResponseEntity<byte[]> telechargerCertificatPdf(@PathVariable Long certificatId) {
        try {
            String sql = "SELECT aptitude, observations, travailleur FROM certificats_simple WHERE id = ?";
            Map<String, Object> result = jdbcTemplate.queryForMap(sql, certificatId);
            
            // Séparer nom et prénom
            String nomComplet = result.get("travailleur").toString();
            String[] parts = nomComplet.split(" ", 2);
            String nom = parts.length > 0 ? parts[0] : nomComplet;
            String prenom = parts.length > 1 ? parts[1] : "";
            
            // Date actuelle
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
            String dateActuelle = sdf.format(new java.util.Date());
            
            // Aptitude en français
            String aptitude = result.get("aptitude").toString();
            String aptitudeText = "";
            switch(aptitude) {
                case "APTE":
                    aptitudeText = "APTE";
                    break;
                case "INAPTE":
                    aptitudeText = "INAPTE";
                    break;
                case "APTE_AVEC_RESTRICTIONS":
                    aptitudeText = "APTE AVEC RESTRICTIONS";
                    break;
            }
            
            // Générer PDF simple et lisible
            StringBuilder pdf = new StringBuilder();
            pdf.append("%PDF-1.4\n");
            pdf.append("1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n");
            pdf.append("2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n");
            pdf.append("3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n");
            
            pdf.append("4 0 obj<</Length 800>>stream\nBT\n");
            pdf.append("/F1 14 Tf 50 750 Td (BURKINA FASO) Tj\n");
            pdf.append("0 -20 Td (MINISTERE DU TRAVAIL) Tj\n");
            pdf.append("0 -20 Td (Service de Medecine du Travail) Tj\n");
            pdf.append("\n");
            pdf.append("0 -40 Td (CERTIFICAT MEDICAL D'APTITUDE) Tj\n");
            pdf.append("\n");
            pdf.append("/F1 12 Tf 0 -40 Td (Dr. Mohamed Amine OUEDRAOGO) Tj\n");
            pdf.append("0 -15 Td (Medecin du Travail) Tj\n");
            pdf.append("\n");
            pdf.append("0 -30 Td (Fait a Ouagadougou, le ").append(dateActuelle).append(") Tj\n");
            pdf.append("\n");
            pdf.append("0 -40 Td (Je certifie avoir examine :) Tj\n");
            pdf.append("\n");
            pdf.append("0 -30 Td (Nom : ").append(nom).append(") Tj\n");
            pdf.append("0 -20 Td (Prenom : ").append(prenom).append(") Tj\n");
            pdf.append("\n");
            pdf.append("0 -40 Td (CONCLUSION : ").append(aptitudeText).append(") Tj\n");
            
            if (result.get("observations") != null && !result.get("observations").toString().isEmpty()) {
                pdf.append("\n");
                pdf.append("0 -30 Td (Observations : ").append(result.get("observations")).append(") Tj\n");
            }
            
            pdf.append("\n");
            pdf.append("0 -60 Td (Dr. Mohamed Amine OUEDRAOGO) Tj\n");
            pdf.append("0 -15 Td (Signature et cachet) Tj\n");
            
            pdf.append("ET\nendstream\nendobj\n");
            pdf.append("5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n");
            pdf.append("xref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000125 00000 n\n0000000300 00000 n\n0000001150 00000 n\n");
            pdf.append("trailer<</Size 6/Root 1 0 R>>\nstartxref\n1200\n%%EOF");
            
            String contenu = pdf.toString();
            byte[] data = contenu.getBytes("UTF-8");
            String filename = "certificat_" + nom + "_" + prenom + ".pdf";
            
            return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(data);
                
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}