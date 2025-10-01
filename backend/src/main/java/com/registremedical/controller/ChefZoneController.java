package com.registremedical.controller;

import com.registremedical.entity.User;
import com.registremedical.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/chef-zone")
@CrossOrigin(origins = "*")
public class ChefZoneController {

    @Autowired
    private JwtUtils jwtUtils;

    // Méthode helper pour récupérer le token depuis la requête
    private String getTokenFromRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }
        return null;
    }

    // Statistiques de la zone
    @GetMapping("/stats")
    public ResponseEntity<?> getZoneStats() {
        final Long userId;
        final String userRole;
        try {
            userId = jwtUtils.getCurrentUserId();

            // Récupérer le token depuis l'Authorization header
            String token = getTokenFromRequest();
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token manquant");
            }

            userRole = jwtUtils.extractRole(token);

            // Vérifier que l'utilisateur a le bon rôle
            if (!"DIRECTEUR_REGIONAL".equals(userRole) && !"CHEF_DE_ZONE".equals(userRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - rôle non autorisé");
            }
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            // Simulation des statistiques (à remplacer par des vraies données)
            Map<String, Object> stats = Map.of(
                "totalEntreprises", 15,
                "visitesProgrammees", 8,
                "visitesRealisees", 12,
                "visitesEnAttente", 3,
                "medecinsDisponibles", 5
            );

            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des statistiques: " + ex.getMessage());
        }
    }

    // Liste des entreprises de la zone
    @GetMapping("/entreprises")
    public ResponseEntity<?> getEntreprisesZone() {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            // Simulation des données d'entreprises (à remplacer par des vraies données)
            List<Map<String, Object>> entreprises = new ArrayList<>();

            Map<String, Object> entreprise1 = Map.of(
                "id", 1,
                "raisonSociale", "SONABHY SA",
                "secteurActivite", "Distribution carburants",
                "effectif", 245,
                "adresse", "Zone industrielle, Ouagadougou",
                "contactDrh", "Jean OUEDRAOGO",
                "email", "drh@sonabhy.bf",
                "telephone", "70123456",
                "statut", "ACTIVE",
                "dateAffiliation", "2024-01-15"
            );

            Map<String, Object> entreprise2 = Map.of(
                "id", 2,
                "raisonSociale", "CFAO Motors Burkina",
                "secteurActivite", "Automobile",
                "effectif", 89,
                "adresse", "Avenue Kwame Nkrumah, Ouagadougou",
                "contactDrh", "Marie KABORE",
                "email", "rh@cfaomotors.bf",
                "telephone", "70234567",
                "statut", "ACTIVE",
                "dateAffiliation", "2024-02-20"
            );

            entreprises.add(entreprise1);
            entreprises.add(entreprise2);

            return ResponseEntity.ok(entreprises);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des entreprises: " + ex.getMessage());
        }
    }

    // Liste des visites médicales
    @GetMapping("/visites")
    public ResponseEntity<?> getVisitesZone() {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            // Simulation des données de visites (à remplacer par des vraies données)
            List<Map<String, Object>> visites = new ArrayList<>();

            Map<String, Object> visite1 = Map.of(
                "id", 1,
                "type", "VMA",
                "entreprise", Map.of("id", 1, "raisonSociale", "SONABHY SA"),
                "medecin", Map.of("id", 1, "nom", "TRAORE", "prenom", "Amadou"),
                "dateProgrammee", "2024-09-25",
                "statut", "PROGRAMMEE",
                "commentaires", "Visite annuelle de routine"
            );

            Map<String, Object> visite2 = Map.of(
                "id", 2,
                "type", "VLT",
                "entreprise", Map.of("id", 2, "raisonSociale", "CFAO Motors Burkina"),
                "dateProgrammee", "2024-09-28",
                "statut", "EN_ATTENTE",
                "commentaires", "Contrôle des conditions de travail"
            );

            visites.add(visite1);
            visites.add(visite2);

            return ResponseEntity.ok(visites);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des visites: " + ex.getMessage());
        }
    }

    // Liste des médecins disponibles
    @GetMapping("/medecins")
    public ResponseEntity<?> getMedecinsZone() {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            // Simulation des données de médecins (à remplacer par des vraies données)
            List<Map<String, Object>> medecins = new ArrayList<>();

            Map<String, Object> medecin1 = Map.of(
                "id", 1,
                "nom", "TRAORE",
                "prenom", "Amadou",
                "specialite", "Médecine du travail",
                "telephone", "70345678",
                "email", "a.traore@ost.bf",
                "disponible", true
            );

            Map<String, Object> medecin2 = Map.of(
                "id", 2,
                "nom", "KONATE",
                "prenom", "Fatou",
                "specialite", "Médecine générale",
                "telephone", "70456789",
                "email", "f.konate@ost.bf",
                "disponible", true
            );

            medecins.add(medecin1);
            medecins.add(medecin2);

            return ResponseEntity.ok(medecins);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des médecins: " + ex.getMessage());
        }
    }

    // Programmer une nouvelle visite
    @PostMapping("/visites")
    public ResponseEntity<?> programmerVisite(@RequestBody Map<String, Object> visiteData) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            // Validation des données
            String type = (String) visiteData.get("type");
            Integer entrepriseId = (Integer) visiteData.get("entrepriseId");
            String dateProgrammee = (String) visiteData.get("dateProgrammee");

            if (type == null || entrepriseId == null || dateProgrammee == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Type, entrepriseId et dateProgrammee sont requis");
            }

            // Simulation de la création (à remplacer par la vraie logique)
            Map<String, Object> nouvelleVisite = Map.of(
                "id", System.currentTimeMillis(),
                "type", type,
                "entrepriseId", entrepriseId,
                "dateProgrammee", dateProgrammee,
                "statut", "PROGRAMMEE",
                "commentaires", visiteData.get("commentaires"),
                "dateCreation", java.time.LocalDateTime.now().toString()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(nouvelleVisite);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la programmation de la visite: " + ex.getMessage());
        }
    }

    // Assigner un médecin à une visite
    @PostMapping("/visites/{visiteId}/assigner-medecin")
    public ResponseEntity<?> assignerMedecin(@PathVariable Long visiteId, @RequestBody Map<String, Object> data) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Integer medecinId = (Integer) data.get("medecinId");

            if (medecinId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("medecinId est requis");
            }

            // Simulation de l'assignation (à remplacer par la vraie logique)
            Map<String, Object> result = Map.of(
                "success", true,
                "message", "Médecin assigné avec succès",
                "visiteId", visiteId,
                "medecinId", medecinId
            );

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de l'assignation du médecin: " + ex.getMessage());
        }
    }

    // Envoyer un message aux employeurs
    @PostMapping("/communications")
    public ResponseEntity<?> envoyerMessage(@RequestBody Map<String, Object> messageData) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            String sujet = (String) messageData.get("sujet");
            String contenu = (String) messageData.get("contenu");
            List<Integer> destinataires = (List<Integer>) messageData.get("destinataires");

            if (sujet == null || contenu == null || destinataires == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Sujet, contenu et destinataires sont requis");
            }

            // Simulation de l'envoi (à remplacer par la vraie logique d'envoi d'emails)
            Map<String, Object> result = Map.of(
                "success", true,
                "message", "Message envoyé avec succès",
                "destinataires", destinataires.size(),
                "dateEnvoi", java.time.LocalDateTime.now().toString()
            );

            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de l'envoi du message: " + ex.getMessage());
        }
    }
}