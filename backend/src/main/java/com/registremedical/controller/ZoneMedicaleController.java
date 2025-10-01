package com.registremedical.controller;

import com.registremedical.entity.ZoneMedicale;
import com.registremedical.entity.Entreprise;
import com.registremedical.entity.User;
import com.registremedical.repository.ZoneMedicaleRepository;
import com.registremedical.repository.EntrepriseRepository;
import com.registremedical.repository.UserRepository;
import com.registremedical.security.JwtUtils;
import com.registremedical.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/zones-medicales")
@CrossOrigin(origins = "http://localhost:5173")
public class ZoneMedicaleController {

    @Autowired
    private ZoneMedicaleRepository zoneMedicaleRepository;

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private MailService mailService;


    // Lister toutes les zones médicales
    @GetMapping
    public ResponseEntity<?> getAllZones() {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            List<ZoneMedicale> zones = zoneMedicaleRepository.findByDirecteurRegionalAndActifTrue(optDirecteur.get());
            
            // Enrichir avec le nombre d'entreprises
            zones.forEach(zone -> {
                Long count = zoneMedicaleRepository.countEntreprisesByZoneId(zone.getId());
                zone.setNombreEntreprisesActuelles(count.intValue());
            });

            return ResponseEntity.ok(zones);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du chargement des zones: " + ex.getMessage());
        }
    }

    // Créer une nouvelle zone médicale
    @PostMapping
    public ResponseEntity<?> createZone(@RequestBody Map<String, Object> zoneData) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            ZoneMedicale zone = new ZoneMedicale();
            zone.setNom((String) zoneData.get("nom"));
            zone.setDescription((String) zoneData.get("description"));
            zone.setLatitude(((Number) zoneData.get("latitude")).doubleValue());
            zone.setLongitude(((Number) zoneData.get("longitude")).doubleValue());
            
            if (zoneData.containsKey("rayonKm")) {
                zone.setRayonKm(((Number) zoneData.get("rayonKm")).doubleValue());
            }
            if (zoneData.containsKey("couleurCarte")) {
                zone.setCouleurCarte((String) zoneData.get("couleurCarte"));
            }
            if (zoneData.containsKey("capaciteMax")) {
                zone.setCapaciteMax(((Number) zoneData.get("capaciteMax")).intValue());
            }
            if (zoneData.containsKey("region")) {
                zone.setRegion((String) zoneData.get("region"));
            }

            zone.setDirecteurRegional(optDirecteur.get());
            zone.setDateCreation(LocalDateTime.now());
            zone.setDateModification(LocalDateTime.now());

            ZoneMedicale savedZone = zoneMedicaleRepository.save(zone);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedZone);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création de la zone: " + ex.getMessage());
        }
    }

    // Obtenir une zone spécifique
    @GetMapping("/{id}")
    public ResponseEntity<?> getZoneById(@PathVariable Long id) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            Optional<ZoneMedicale> optZone = zoneMedicaleRepository.findById(id);
            if (optZone.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Zone non trouvée");
            }

            ZoneMedicale zone = optZone.get();
            if (!zone.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette zone");
            }

            return ResponseEntity.ok(zone);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du chargement de la zone: " + ex.getMessage());
        }
    }

    // Mettre à jour une zone
    @PutMapping("/{id}")
    public ResponseEntity<?> updateZone(@PathVariable Long id, @RequestBody Map<String, Object> zoneData) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            Optional<ZoneMedicale> optZone = zoneMedicaleRepository.findById(id);
            if (optZone.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Zone non trouvée");
            }

            ZoneMedicale zone = optZone.get();
            if (!zone.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette zone");
            }

            // Mise à jour des champs
            if (zoneData.containsKey("nom")) {
                zone.setNom((String) zoneData.get("nom"));
            }
            if (zoneData.containsKey("description")) {
                zone.setDescription((String) zoneData.get("description"));
            }
            if (zoneData.containsKey("latitude")) {
                zone.setLatitude(((Number) zoneData.get("latitude")).doubleValue());
            }
            if (zoneData.containsKey("longitude")) {
                zone.setLongitude(((Number) zoneData.get("longitude")).doubleValue());
            }
            if (zoneData.containsKey("rayonKm")) {
                zone.setRayonKm(((Number) zoneData.get("rayonKm")).doubleValue());
            }
            if (zoneData.containsKey("couleurCarte")) {
                zone.setCouleurCarte((String) zoneData.get("couleurCarte"));
            }
            if (zoneData.containsKey("capaciteMax")) {
                zone.setCapaciteMax(((Number) zoneData.get("capaciteMax")).intValue());
            }
            if (zoneData.containsKey("region")) {
                zone.setRegion((String) zoneData.get("region"));
            }

            ZoneMedicale updatedZone = zoneMedicaleRepository.save(zone);
            return ResponseEntity.ok(updatedZone);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la mise à jour de la zone: " + ex.getMessage());
        }
    }

    // Supprimer une zone (désactivation)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteZone(@PathVariable Long id) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            Optional<ZoneMedicale> optZone = zoneMedicaleRepository.findById(id);
            if (optZone.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Zone non trouvée");
            }

            ZoneMedicale zone = optZone.get();
            if (!zone.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette zone");
            }

            // Désactiver la zone au lieu de la supprimer
            zone.setActif(false);
            zoneMedicaleRepository.save(zone);

            return ResponseEntity.ok().body("Zone désactivée avec succès");

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la suppression de la zone: " + ex.getMessage());
        }
    }

    // Assigner des entreprises à une zone automatiquement basé sur la géolocalisation
    @PostMapping("/{id}/assigner-automatique")
    public ResponseEntity<?> assignerEntreprisesAutomatique(@PathVariable Long id) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            Optional<ZoneMedicale> optZone = zoneMedicaleRepository.findById(id);
            if (optZone.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Zone non trouvée");
            }

            ZoneMedicale zone = optZone.get();
            if (!zone.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette zone");
            }

            // Trouver les entreprises sans zone assignée
            List<Entreprise> entreprisesSansZone = entrepriseRepository.findByZoneMedicaleIsNull();
            
            int nombreAssignees = 0;
            for (Entreprise entreprise : entreprisesSansZone) {
                if (entreprise.getLatitude() != null && entreprise.getLongitude() != null) {
                    // Vérifier si l'entreprise est dans le rayon de la zone
                    if (zone.contientEntreprise(entreprise.getLatitude(), entreprise.getLongitude())) {
                        entreprise.setZoneMedicale(zone);
                        entrepriseRepository.save(entreprise);
                        nombreAssignees++;
                    }
                }
            }

            // Mettre à jour le nombre d'entreprises dans la zone
            Long count = zoneMedicaleRepository.countEntreprisesByZoneId(zone.getId());
            zone.setNombreEntreprisesActuelles(count.intValue());
            zoneMedicaleRepository.save(zone);

            Map<String, Object> result = new HashMap<>();
            result.put("nombreAssignees", nombreAssignees);
            result.put("zone", zone);

            return ResponseEntity.ok(result);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de l'assignation automatique: " + ex.getMessage());
        }
    }

    // Obtenir les entreprises non assignées
    @GetMapping("/entreprises-non-assignees")
    public ResponseEntity<?> getEntreprisesNonAssignees() {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            List<Entreprise> entreprisesSansZone = entrepriseRepository.findByZoneMedicaleIsNull();
            return ResponseEntity.ok(entreprisesSansZone);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du chargement des entreprises: " + ex.getMessage());
        }
    }

    // Assigner manuellement une entreprise à une zone
    @PostMapping("/{zoneId}/assigner-entreprise/{entrepriseId}")
    public ResponseEntity<?> assignerEntrepriseManuelle(@PathVariable Long zoneId, @PathVariable Long entrepriseId) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            Optional<ZoneMedicale> optZone = zoneMedicaleRepository.findById(zoneId);
            Optional<Entreprise> optEntreprise = entrepriseRepository.findById(entrepriseId);

            if (optZone.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Zone non trouvée");
            }
            if (optEntreprise.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Entreprise non trouvée");
            }

            ZoneMedicale zone = optZone.get();
            Entreprise entreprise = optEntreprise.get();

            if (!zone.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette zone");
            }

            entreprise.setZoneMedicale(zone);
            entrepriseRepository.save(entreprise);

            // Mettre à jour le compteur
            Long count = zoneMedicaleRepository.countEntreprisesByZoneId(zone.getId());
            zone.setNombreEntreprisesActuelles(count.intValue());
            zoneMedicaleRepository.save(zone);

            // Notifier le chef de zone
            notifierChefDeZone(zone, entreprise);

            return ResponseEntity.ok().body("Entreprise assignée avec succès");

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de l'assignation: " + ex.getMessage());
        }
    }

    // Méthode pour notifier le chef de zone lors de l'assignation d'une entreprise
    private void notifierChefDeZone(ZoneMedicale zone, Entreprise entreprise) {
        try {
            // Trouver tous les chefs de zone actifs
            List<User> chefsDeZone = userRepository.findByRole(com.registremedical.enums.UserRole.CHEF_DE_ZONE);

            // Pour l'instant, envoyer à tous les chefs de zone (à améliorer avec une logique de région)
            for (User chef : chefsDeZone) {
                if (chef.getActive() != null && chef.getActive()) {
                    String subject = "Nouvelle entreprise assignée à votre zone";
                    String htmlBody = String.format(
                        "<h2>Nouvelle entreprise assignée</h2>" +
                        "<p>Une nouvelle entreprise a été assignée à la zone <strong>%s</strong>.</p>" +
                        "<h3>Détails de l'entreprise :</h3>" +
                        "<ul>" +
                        "<li><strong>Nom :</strong> %s</li>" +
                        "<li><strong>Secteur :</strong> %s</li>" +
                        "<li><strong>Effectif :</strong> %d employés</li>" +
                        "<li><strong>Adresse :</strong> %s, %s</li>" +
                        "<li><strong>Contact :</strong> %s %s (%s)</li>" +
                        "</ul>" +
                        "<p>Veuillez prendre les mesures nécessaires pour l'intégration de cette entreprise dans votre zone.</p>" +
                        "<p>Cordialement,<br>Système de Gestion Médicale</p>",
                        zone.getNom(),
                        entreprise.getNom(),
                        entreprise.getSecteurActivite(),
                        entreprise.getEffectif() != null ? entreprise.getEffectif() : 0,
                        entreprise.getAdresse(),
                        entreprise.getVille(),
                        entreprise.getEmployeur() != null ? entreprise.getEmployeur().getPrenom() : "",
                        entreprise.getEmployeur() != null ? entreprise.getEmployeur().getNom() : "",
                        entreprise.getEmail()
                    );

                    try {
                        mailService.sendEmailWithAttachment(chef.getEmail(), subject, htmlBody, null, null);
                        System.out.println("Notification envoyée au chef de zone: " + chef.getEmail());
                    } catch (Exception emailEx) {
                        System.err.println("Erreur lors de l'envoi d'email à " + chef.getEmail() + ": " + emailEx.getMessage());
                    }
                }
            }
        } catch (Exception ex) {
            System.err.println("Erreur lors de la notification des chefs de zone: " + ex.getMessage());
            // Ne pas interrompre le processus principal si la notification échoue
        }
    }

}
