package com.registremedical.controller;

import com.registremedical.entity.DemandeAffiliation;
import com.registremedical.entity.User;
import com.registremedical.enums.StatutAffiliation;
import com.registremedical.enums.UserRole;
import com.registremedical.repository.DemandeAffiliationRepository;
import com.registremedical.repository.UserRepository;
import com.registremedical.security.JwtUtils;
import com.registremedical.service.UserService;
import com.registremedical.service.DemandeAffiliationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/demandes-affiliation")
@CrossOrigin(origins = "*")
public class DemandeAffiliationController {

    @Autowired
    private DemandeAffiliationRepository demandeAffiliationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private DemandeAffiliationService demandeAffiliationService;

    // Lister toutes les demandes d'affiliation pour un directeur régional (version simplifiée)
    @GetMapping
    public ResponseEntity<?> getAllDemandes() {
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

            List<DemandeAffiliation> demandes = demandeAffiliationRepository
                .findByDirecteurRegionalOrderByDateCreationDesc(optDirecteur.get());

            // Convertir en format simplifié pour éviter les problèmes de sérialisation JSON
            List<Map<String, Object>> demandesSimples = new java.util.ArrayList<>();
            for (DemandeAffiliation demande : demandes) {
                Map<String, Object> demandeSimple = new java.util.HashMap<>();
                demandeSimple.put("id", demande.getId());
                demandeSimple.put("raisonSociale", demande.getRaisonSociale());
                demandeSimple.put("numeroRccm", demande.getNumeroRccm());
                demandeSimple.put("secteurActivite", demande.getSecteurActivite());
                demandeSimple.put("effectif", demande.getEffectif());
                demandeSimple.put("adresse", demande.getAdresse());
                demandeSimple.put("representantLegal", demande.getRepresentantLegal());
                demandeSimple.put("email", demande.getEmail());
                demandeSimple.put("telephone", demande.getTelephone());
                demandeSimple.put("contactDrh", demande.getContactDrh());
                demandeSimple.put("chiffreAffaireAnnuel", demande.getChiffreAffaireAnnuel());
                demandeSimple.put("commentaires", demande.getCommentaires() != null ? demande.getCommentaires().replaceAll("\"", "'") : null);
                demandeSimple.put("motifRejet", demande.getMotifRejet() != null ? demande.getMotifRejet().replaceAll("\"", "'") : null);
                demandeSimple.put("statut", demande.getStatut().name());
                demandeSimple.put("dateCreation", demande.getDateCreation());
                demandeSimple.put("dateModification", demande.getDateModification());

                Map<String, Object> employeurSimple = new java.util.HashMap<>();
                employeurSimple.put("id", demande.getEmployeur().getId());
                employeurSimple.put("nom", demande.getEmployeur().getNom());
                employeurSimple.put("prenom", demande.getEmployeur().getPrenom());
                employeurSimple.put("email", demande.getEmployeur().getEmail());
                demandeSimple.put("employeur", employeurSimple);

                Map<String, Object> directeurSimple = new java.util.HashMap<>();
                directeurSimple.put("id", demande.getDirecteurRegional().getId());
                directeurSimple.put("nom", demande.getDirecteurRegional().getNom());
                directeurSimple.put("prenom", demande.getDirecteurRegional().getPrenom());
                directeurSimple.put("email", demande.getDirecteurRegional().getEmail());
                demandeSimple.put("directeurRegional", directeurSimple);

                demandesSimples.add(demandeSimple);
            }

            return ResponseEntity.ok(demandesSimples);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des demandes: " + ex.getMessage());
        }
    }

    // Créer des utilisateurs de test (endpoint temporaire)
    @PostMapping("/create-test-users")
    public ResponseEntity<?> createTestUsers() {
        try {
            // Vérifier si l'employeur existe déjà
            Optional<User> existingEmployeur = userRepository.findByEmail("employeur@test.com");
            User employeur;
            if (existingEmployeur.isPresent()) {
                employeur = existingEmployeur.get();
                System.out.println("Employeur existant trouvé: " + employeur.getEmail());
            } else {
                // Créer un employeur de test en utilisant UserService pour l'encodage du mot de passe
                employeur = new User();
                employeur.setNom("Dupont");
                employeur.setPrenom("Jean");
                employeur.setEmail("employeur@test.com");
                employeur.setPassword("password123"); // Mot de passe en clair, sera encodé par UserService
                employeur.setRole(UserRole.EMPLOYEUR);
                employeur.setActive(true);
                employeur.setDateCreation(LocalDateTime.now());
                employeur = userService.save(employeur); // Utiliser UserService au lieu de userRepository
                System.out.println("Employeur créé: " + employeur.getEmail());
            }

            // Vérifier si le directeur existe déjà
            Optional<User> existingDirecteur = userRepository.findByEmail("directeur@test.com");
            User directeur;
            if (existingDirecteur.isPresent()) {
                directeur = existingDirecteur.get();
                System.out.println("Directeur existant trouvé: " + directeur.getEmail());
            } else {
                // Créer un directeur de test en utilisant UserService pour l'encodage du mot de passe
                directeur = new User();
                directeur.setNom("Martin");
                directeur.setPrenom("Pierre");
                directeur.setEmail("directeur@test.com");
                directeur.setPassword("password123"); // Mot de passe en clair, sera encodé par UserService
                directeur.setRole(UserRole.DIRECTEUR_REGIONAL);
                directeur.setActive(true);
                directeur.setDateCreation(LocalDateTime.now());
                directeur = userService.save(directeur); // Utiliser UserService au lieu de userRepository
                System.out.println("Directeur créé: " + directeur.getEmail());
            }

            return ResponseEntity.ok(Map.of(
                "message", "Utilisateurs de test vérifiés/créés avec succès",
                "employeur", Map.of("id", employeur.getId(), "email", employeur.getEmail(), "role", employeur.getRole().name()),
                "directeur", Map.of("id", directeur.getId(), "email", directeur.getEmail(), "role", directeur.getRole().name()),
                "total_users", userRepository.count()
            ));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Erreur lors de la création des utilisateurs de test",
                    "message", ex.getMessage(),
                    "stackTrace", ex.getStackTrace()[0].toString()
                ));
        }
    }

    // Créer une nouvelle demande d'affiliation (EMPLOYEUR)
    @PostMapping
    @Transactional
    public ResponseEntity<?> createDemande(@RequestBody Map<String, Object> payload) {
        System.out.println("=== DÉBUT CRÉATION DEMANDE ===");
        System.out.println("Payload reçu: " + payload);
        
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
            System.out.println("ID Employeur connecté: " + employeurId);
        } catch (RuntimeException ex) {
            System.out.println("Erreur authentification: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optEmployeur = userRepository.findById(employeurId);
            if (optEmployeur.isEmpty()) {
                System.out.println("Employeur non trouvé avec ID: " + employeurId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Employeur non trouvé");
            }
            
            User employeur = optEmployeur.get();
            System.out.println("Employeur trouvé: " + employeur.getEmail() + ", Rôle: " + employeur.getRole());
            
            if (!"EMPLOYEUR".equals(employeur.getRole().name())) {
                System.out.println("Rôle incorrect: " + employeur.getRole().name());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - réservé aux employeurs");
            }

            // Validation des champs requis
            String raisonSociale = (String) payload.get("raisonSociale");
            String numeroRccm = (String) payload.get("numeroRccm");
            String secteurActivite = (String) payload.get("secteurActivite");
            Object effectifObj = payload.get("effectif");
            String adresse = (String) payload.get("adresse");
            String representantLegal = (String) payload.get("representantLegal");
            String email = (String) payload.get("email");
            String telephone = (String) payload.get("telephone");
            String contactDrh = (String) payload.get("contactDrh");

            if (raisonSociale == null || raisonSociale.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("La raison sociale est requise");
            }
            if (numeroRccm == null || numeroRccm.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le numéro RCCM est requis");
            }
            if (secteurActivite == null || secteurActivite.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le secteur d'activité est requis");
            }
            if (effectifObj == null) {
                return ResponseEntity.badRequest().body("L'effectif est requis");
            }
            if (adresse == null || adresse.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("L'adresse est requise");
            }
            if (representantLegal == null || representantLegal.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le représentant légal est requis");
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("L'email est requis");
            }
            if (telephone == null || telephone.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le téléphone est requis");
            }
            if (contactDrh == null || contactDrh.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le contact DRH est requis");
            }

            Integer effectif = ((Number) effectifObj).intValue();
            if (effectif <= 0) {
                return ResponseEntity.badRequest().body("L'effectif doit être supérieur à 0");
            }

            // Assigner spécifiquement au directeur sanefatimata98@gmail.com
            Optional<User> optDirecteurSpecifique = userRepository.findByEmail("sanefatimata98@gmail.com");
            User directeur;

            if (optDirecteurSpecifique.isPresent() && "DIRECTEUR_REGIONAL".equals(optDirecteurSpecifique.get().getRole().name())) {
                directeur = optDirecteurSpecifique.get();
                System.out.println("Directeur spécifique trouvé: " + directeur.getEmail());
            } else {
                // Créer le directeur sanefatimata98@gmail.com s'il n'existe pas
                if (optDirecteurSpecifique.isPresent()) {
                    // L'utilisateur existe mais n'est pas directeur, le mettre à jour
                    directeur = optDirecteurSpecifique.get();
                    directeur.setRole(UserRole.DIRECTEUR_REGIONAL);
                    directeur.setActive(true);
                    directeur = userRepository.save(directeur);
                    System.out.println("Utilisateur existant mis à jour en directeur: " + directeur.getEmail());
                } else {
                    // Créer le nouveau directeur
                    directeur = new User();
                    directeur.setNom("Sane");
                    directeur.setPrenom("Fatimata");
                    directeur.setEmail("sanefatimata98@gmail.com");
                    directeur.setPassword("password123");
                    directeur.setRole(UserRole.DIRECTEUR_REGIONAL);
                    directeur.setActive(true);
                    directeur.setDateCreation(LocalDateTime.now());
                    directeur = userService.save(directeur);
                    System.out.println("Directeur spécifique créé: " + directeur.getEmail());
                }
            }

            System.out.println("Directeur assigné: " + directeur.getEmail() + " (ID: " + directeur.getId() + ")");

            // Champs optionnels
            Double chiffreAffaire = null;
            if (payload.get("chiffreAffaireAnnuel") != null) {
                chiffreAffaire = ((Number) payload.get("chiffreAffaireAnnuel")).doubleValue();
            }
            String commentaires = (String) payload.get("commentaires");

            // Utiliser le service pour créer la demande
            DemandeAffiliation saved = demandeAffiliationService.createDemande(
                raisonSociale.trim(), numeroRccm.trim(), secteurActivite.trim(),
                effectif, adresse.trim(), representantLegal.trim(),
                email.trim(), telephone.trim(), contactDrh.trim(),
                chiffreAffaire, commentaires, employeur, directeur
            );
            
            System.out.println("=== CONTRÔLEUR: Demande créée avec ID: " + saved.getId() + " ===");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Demande d'affiliation créée avec succès",
                "id", saved.getId(),
                "statut", saved.getStatut().name(),
                "raisonSociale", saved.getRaisonSociale(),
                "dateCreation", saved.getDateCreation().toString()
            ));
        } catch (Exception ex) {
            System.out.println("ERREUR lors de la création: " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création de la demande: " + ex.getMessage());
        }
    }

    // Récupérer les demandes d'un employeur connecté (version simplifiée)
    @GetMapping("/mes-demandes")
    public ResponseEntity<?> getMesDemandes() {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optEmployeur = userRepository.findById(employeurId);
            if (optEmployeur.isEmpty() || !"EMPLOYEUR".equals(optEmployeur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - réservé aux employeurs");
            }

            List<DemandeAffiliation> demandes = demandeAffiliationRepository.findByEmployeurOrderByDateCreationDesc(optEmployeur.get());

            // Convertir en format simplifié pour éviter les problèmes de sérialisation JSON
            List<Map<String, Object>> demandesSimples = new java.util.ArrayList<>();
            for (DemandeAffiliation demande : demandes) {
                Map<String, Object> demandeSimple = new java.util.HashMap<>();
                demandeSimple.put("id", demande.getId());
                demandeSimple.put("raisonSociale", demande.getRaisonSociale());
                demandeSimple.put("numeroRccm", demande.getNumeroRccm());
                demandeSimple.put("secteurActivite", demande.getSecteurActivite());
                demandeSimple.put("effectif", demande.getEffectif());
                demandeSimple.put("adresse", demande.getAdresse());
                demandeSimple.put("representantLegal", demande.getRepresentantLegal());
                demandeSimple.put("email", demande.getEmail());
                demandeSimple.put("telephone", demande.getTelephone());
                demandeSimple.put("contactDrh", demande.getContactDrh());
                demandeSimple.put("chiffreAffaireAnnuel", demande.getChiffreAffaireAnnuel());
                demandeSimple.put("commentaires", demande.getCommentaires() != null ? demande.getCommentaires().replaceAll("\"", "'") : null);
                demandeSimple.put("motifRejet", demande.getMotifRejet() != null ? demande.getMotifRejet().replaceAll("\"", "'") : null);
                demandeSimple.put("statut", demande.getStatut().name());
                demandeSimple.put("dateCreation", demande.getDateCreation());
                demandeSimple.put("dateModification", demande.getDateModification());

                Map<String, Object> employeurSimple = new java.util.HashMap<>();
                employeurSimple.put("id", demande.getEmployeur().getId());
                employeurSimple.put("nom", demande.getEmployeur().getNom());
                employeurSimple.put("prenom", demande.getEmployeur().getPrenom());
                employeurSimple.put("email", demande.getEmployeur().getEmail());
                demandeSimple.put("employeur", employeurSimple);

                if (demande.getDirecteurRegional() != null) {
                    Map<String, Object> directeurSimple = new java.util.HashMap<>();
                    directeurSimple.put("id", demande.getDirecteurRegional().getId());
                    directeurSimple.put("nom", demande.getDirecteurRegional().getNom());
                    directeurSimple.put("prenom", demande.getDirecteurRegional().getPrenom());
                    directeurSimple.put("email", demande.getDirecteurRegional().getEmail());
                    demandeSimple.put("directeurRegional", directeurSimple);
                }

                demandesSimples.add(demandeSimple);
            }

            return ResponseEntity.ok(demandesSimples);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des demandes: " + ex.getMessage());
        }
    }

    // Assigner une zone à une demande
    @PostMapping("/{id}/assign-zone")
    public ResponseEntity<?> assignZone(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - réservé aux directeurs régionaux");
            }

            Optional<DemandeAffiliation> optDemande = demandeAffiliationRepository.findById(id);
            if (optDemande.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Demande non trouvée");
            }

            DemandeAffiliation demande = optDemande.get();
            if (!demande.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette demande");
            }

            String zone = (String) payload.get("zone");
            if (zone == null || zone.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Zone manquante");
            }

            // On stocke la zone dans commentaires (ou créer un champ dédié si souhaité)
            String commentaires = (demande.getCommentaires() == null ? "" : demande.getCommentaires() + " | ") + "ZONE=" + zone;
            demande.setCommentaires(commentaires);
            demande.setDateModification(java.time.LocalDateTime.now());
            DemandeAffiliation saved = demandeAffiliationRepository.save(demande);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'assignation: " + ex.getMessage());
        }
    }
    // Obtenir une demande d'affiliation par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getDemandeById(@PathVariable Long id) {
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

            Optional<DemandeAffiliation> optDemande = demandeAffiliationRepository.findById(id);
            if (optDemande.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Demande non trouvée");
            }

            DemandeAffiliation demande = optDemande.get();
            // Vérifier que la demande appartient au directeur régional
            if (!demande.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette demande");
            }

            return ResponseEntity.ok(demande);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération de la demande: " + ex.getMessage());
        }
    }

    // Mettre à jour le statut d'une demande
    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
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

            Optional<DemandeAffiliation> optDemande = demandeAffiliationRepository.findById(id);
            if (optDemande.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Demande non trouvée");
            }

            DemandeAffiliation demande = optDemande.get();
            if (!demande.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette demande");
            }

            String statutStr = (String) payload.get("statut");
            if (statutStr != null) {
                demande.setStatut(StatutAffiliation.valueOf(statutStr));
            }

            String motifRejet = (String) payload.get("motifRejet");
            if (motifRejet != null) {
                demande.setMotifRejet(motifRejet);
            }

            String commentaires = (String) payload.get("commentaires");
            if (commentaires != null) {
                demande.setCommentaires(commentaires);
            }

            demande.setDateModification(LocalDateTime.now());
            DemandeAffiliation saved = demandeAffiliationRepository.save(demande);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Erreur lors de la mise à jour: " + ex.getMessage());
        }
    }

    // Rechercher des demandes
    @GetMapping("/search")
    public ResponseEntity<?> searchDemandes(@RequestParam String search) {
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

            List<DemandeAffiliation> demandes = demandeAffiliationRepository.findBySearchTerm(search);
            return ResponseEntity.ok(demandes);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la recherche: " + ex.getMessage());
        }
    }

    // Statistiques pour le dashboard
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
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

            User directeur = optDirecteur.get();
            
            Map<String, Long> stats = Map.of(
                "total", demandeAffiliationRepository.countByDirecteurAndStatut(directeur, null),
                "nouvelles", demandeAffiliationRepository.countByDirecteurAndStatut(directeur, StatutAffiliation.NOUVELLE),
                "enCours", demandeAffiliationRepository.countByDirecteurAndStatut(directeur, StatutAffiliation.EN_COURS),
                "validees", demandeAffiliationRepository.countByDirecteurAndStatut(directeur, StatutAffiliation.VALIDEE),
                "rejetees", demandeAffiliationRepository.countByDirecteurAndStatut(directeur, StatutAffiliation.REJETEE)
            );

            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des statistiques: " + ex.getMessage());
        }
    }

    // ==================== ENDPOINTS POUR LES EMPLOYEURS ====================

    // Obtenir les demandes de l'employeur connecté
    @GetMapping("/my")
    public ResponseEntity<?> getMyDemandes() {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optEmployeur = userRepository.findById(employeurId);
            if (optEmployeur.isEmpty() || !"EMPLOYEUR".equals(optEmployeur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - réservé aux employeurs");
            }

            List<DemandeAffiliation> demandes = demandeAffiliationRepository
                .findByEmployeurOrderByDateCreationDesc(optEmployeur.get());
            return ResponseEntity.ok(demandes);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des demandes: " + ex.getMessage());
        }
    }
    
    // Statistiques pour l'employeur
    @GetMapping("/my/stats")
    public ResponseEntity<?> getMyStats() {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optEmployeur = userRepository.findById(employeurId);
            if (optEmployeur.isEmpty() || !"EMPLOYEUR".equals(optEmployeur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - réservé aux employeurs");
            }

            User employeur = optEmployeur.get();
            
            Map<String, Long> stats = Map.of(
                "total", demandeAffiliationRepository.countByEmployeur(employeur),
                "nouvelles", demandeAffiliationRepository.countByEmployeurAndStatut(employeur, StatutAffiliation.NOUVELLE),
                "enCours", demandeAffiliationRepository.countByEmployeurAndStatut(employeur, StatutAffiliation.EN_COURS),
                "validees", demandeAffiliationRepository.countByEmployeurAndStatut(employeur, StatutAffiliation.VALIDEE),
                "rejetees", demandeAffiliationRepository.countByEmployeurAndStatut(employeur, StatutAffiliation.REJETEE)
            );

            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des statistiques: " + ex.getMessage());
        }
    }

    // Approuver une demande (DIRECTEUR_REGIONAL)
    @PostMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<?> approveDemande(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - réservé aux directeurs régionaux");
            }

            Optional<DemandeAffiliation> optDemande = demandeAffiliationRepository.findById(id);
            if (optDemande.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Demande non trouvée");
            }

            DemandeAffiliation demande = optDemande.get();
            if (!demande.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette demande");
            }

            // Vérifier que la demande peut être approuvée
            if (demande.getStatut() == StatutAffiliation.VALIDEE) {
                return ResponseEntity.badRequest().body("Cette demande est déjà approuvée");
            }
            if (demande.getStatut() == StatutAffiliation.REJETEE) {
                return ResponseEntity.badRequest().body("Cette demande a été rejetée et ne peut plus être approuvée");
            }

            demande.setStatut(StatutAffiliation.VALIDEE);
            demande.setDateModification(LocalDateTime.now());
            
            if (payload != null && payload.get("commentaires") != null) {
                demande.setCommentaires((String) payload.get("commentaires"));
            }

            DemandeAffiliation saved = demandeAffiliationRepository.save(demande);
            
            System.out.println("Demande approuvée - ID: " + saved.getId() + ", Nouveau statut: " + saved.getStatut());
            
            return ResponseEntity.ok(Map.of(
                "message", "Demande approuvée avec succès",
                "demande", saved
            ));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de l'approbation: " + ex.getMessage());
        }
    }

    // Rejeter une demande (DIRECTEUR_REGIONAL)
    @PostMapping("/{id}/reject")
    @Transactional
    public ResponseEntity<?> rejectDemande(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        final Long directeurId;
        try {
            directeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optDirecteur = userRepository.findById(directeurId);
            if (optDirecteur.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optDirecteur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - réservé aux directeurs régionaux");
            }

            Optional<DemandeAffiliation> optDemande = demandeAffiliationRepository.findById(id);
            if (optDemande.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Demande non trouvée");
            }

            DemandeAffiliation demande = optDemande.get();
            if (!demande.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à cette demande");
            }

            // Vérifier que la demande peut être rejetée
            if (demande.getStatut() == StatutAffiliation.VALIDEE) {
                return ResponseEntity.badRequest().body("Cette demande est déjà approuvée et ne peut plus être rejetée");
            }
            if (demande.getStatut() == StatutAffiliation.REJETEE) {
                return ResponseEntity.badRequest().body("Cette demande est déjà rejetée");
            }

            String motifRejet = (String) payload.get("motifRejet");
            if (motifRejet == null || motifRejet.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le motif de rejet est obligatoire");
            }

            demande.setStatut(StatutAffiliation.REJETEE);
            demande.setMotifRejet(motifRejet.trim());
            demande.setDateModification(LocalDateTime.now());

            if (payload.get("commentaires") != null) {
                demande.setCommentaires((String) payload.get("commentaires"));
            }

            DemandeAffiliation saved = demandeAffiliationRepository.save(demande);

            System.out.println("Demande rejetée - ID: " + saved.getId() + ", Motif: " + saved.getMotifRejet());

            return ResponseEntity.ok(Map.of(
                "message", "Demande rejetée avec succès",
                "demande", saved
            ));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du rejet: " + ex.getMessage());
        }
    }

    // Valider une demande (DIRECTEUR_REGIONAL) - alias pour approve
    @PostMapping("/{id}/valider")
    @Transactional
    public ResponseEntity<?> validerDemande(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        return approveDemande(id, payload);
    }

    // Rejeter une demande (DIRECTEUR_REGIONAL) - alias pour reject
    @PostMapping("/{id}/rejeter")
    @Transactional
    public ResponseEntity<?> rejeterDemande(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return rejectDemande(id, payload);
    }
}
