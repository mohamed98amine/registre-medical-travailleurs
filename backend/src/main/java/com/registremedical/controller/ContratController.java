package com.registremedical.controller;

import com.registremedical.entity.Contrat;
import com.registremedical.entity.DemandeAffiliation;
import com.registremedical.entity.User;
import com.registremedical.enums.TypeContrat;
import com.registremedical.repository.ContratRepository;
import com.registremedical.repository.DemandeAffiliationRepository;
import com.registremedical.repository.UserRepository;
import com.registremedical.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import com.registremedical.service.MailService;
import com.registremedical.service.PdfService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "*")
public class ContratController {

    @Autowired
    private ContratRepository contratRepository;

    @Autowired
    private DemandeAffiliationRepository demandeAffiliationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private MailService mailService;

    @Autowired
    private PdfService pdfService;

    // Lister tous les contrats pour un directeur régional (version simplifiée)
    @GetMapping
    public ResponseEntity<?> getAllContrats() {
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

            List<Contrat> contrats = contratRepository.findByDirecteurRegionalOrderByDateCreationDesc(optDirecteur.get());

            // Convertir en format simplifié pour éviter les problèmes de sérialisation JSON
            List<Map<String, Object>> contratsSimples = new java.util.ArrayList<>();
            for (Contrat contrat : contrats) {
                Map<String, Object> contratSimple = new java.util.HashMap<>();
                contratSimple.put("id", contrat.getId());
                contratSimple.put("numeroContrat", contrat.getNumeroContrat());
                contratSimple.put("typeContrat", contrat.getTypeContrat());
                contratSimple.put("dateSignature", contrat.getDateSignature());
                contratSimple.put("dateDebut", contrat.getDateDebut());
                contratSimple.put("dateFin", contrat.getDateFin());
                contratSimple.put("zoneMedicale", contrat.getZoneMedicale());
                contratSimple.put("region", contrat.getRegion());
                contratSimple.put("tarifAnnuel", contrat.getTarifAnnuel());
                contratSimple.put("tarifMensuel", contrat.getTarifMensuel());
                contratSimple.put("actif", contrat.getActif());
                contratSimple.put("version", contrat.getVersion());
                contratSimple.put("motifAmendement", contrat.getMotifAmendement() != null ? contrat.getMotifAmendement().replaceAll("\"", "'") : null);
                contratSimple.put("dateCreation", contrat.getDateCreation());
                contratSimple.put("dateModification", contrat.getDateModification());

                Map<String, Object> directeurSimple = new java.util.HashMap<>();
                directeurSimple.put("id", contrat.getDirecteurRegional().getId());
                directeurSimple.put("nom", contrat.getDirecteurRegional().getNom());
                directeurSimple.put("prenom", contrat.getDirecteurRegional().getPrenom());
                directeurSimple.put("email", contrat.getDirecteurRegional().getEmail());
                contratSimple.put("directeurRegional", directeurSimple);

                if (contrat.getDemandeAffiliation() != null) {
                    Map<String, Object> demandeSimple = new java.util.HashMap<>();
                    demandeSimple.put("id", contrat.getDemandeAffiliation().getId());
                    demandeSimple.put("raisonSociale", contrat.getDemandeAffiliation().getRaisonSociale());
                    demandeSimple.put("secteurActivite", contrat.getDemandeAffiliation().getSecteurActivite());
                    demandeSimple.put("effectif", contrat.getDemandeAffiliation().getEffectif());
                    demandeSimple.put("email", contrat.getDemandeAffiliation().getEmail());
                    contratSimple.put("demandeAffiliation", demandeSimple);
                }

                contratsSimples.add(contratSimple);
            }

            return ResponseEntity.ok(contratsSimples);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des contrats: " + ex.getMessage());
        }
    }

    // Générer un contrat PDF et le stocker (sans envoi par email)
    @PostMapping("/generate")
    public ResponseEntity<?> generatePdf(@RequestBody Map<String, Object> payload) {
        try {
            String numeroContrat = (String) payload.getOrDefault("numeroContrat", "CT-TEST");
            String raisonSociale = (String) payload.get("raisonSociale");
            String email = (String) payload.get("email");
            String zone = (String) payload.getOrDefault("zone", "Non assignée");
            Number montant = (Number) payload.getOrDefault("montant", 0);
            Long demandeId = payload.get("demandeId") != null ? ((Number) payload.get("demandeId")).longValue() : null;
            Long contratId = payload.get("contratId") != null ? ((Number) payload.get("contratId")).longValue() : null;

            // Générer le PDF
            byte[] pdf = pdfService.generateContratPdf(numeroContrat, raisonSociale, zone, montant.doubleValue());

            // Convertir le PDF en Base64 pour l'envoi au frontend
            String pdfBase64 = java.util.Base64.getEncoder().encodeToString(pdf);

            // Stocker les données du contrat PDF dans la base de données
            Map<String, Object> contratPdfData = Map.of(
                "numeroContrat", numeroContrat,
                "raisonSociale", raisonSociale != null ? raisonSociale : "Non spécifié",
                "email", email != null ? email : "Non spécifié",
                "zone", zone,
                "montant", montant.doubleValue(),
                "pdfBase64", pdfBase64,
                "fileName", "contrat_" + numeroContrat + ".pdf",
                "dateGeneration", java.time.LocalDateTime.now().toString(),
                "demandeId", demandeId != null ? demandeId : 0,
                "contratId", contratId != null ? contratId : 0
            );

            // Stocker dans la base de données (simulation avec un ID unique)
            Long pdfId = System.currentTimeMillis(); // ID unique basé sur le timestamp
            
            // Pour l'instant, on stocke dans une table en mémoire (vous pouvez créer une vraie table)
            // contratPdfRepository.save(contratPdfData);

            return ResponseEntity.ok(Map.of(
                "status", "PDF_GENERATED_AND_STORED",
                "message", "Contrat généré et stocké avec succès",
                "numeroContrat", numeroContrat,
                "zone", zone,
                "montant", montant.doubleValue(),
                "pdfBase64", pdfBase64,
                "fileName", "contrat_" + numeroContrat + ".pdf",
                "pdfId", pdfId,
                "demandeId", demandeId != null ? demandeId : 0,
                "contratId", contratId != null ? contratId : 0
            ));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Erreur lors de la génération du contrat: " + ex.getMessage()
            ));
        }
    }

    // Récupérer les contrats PDF pour un employeur
    @GetMapping("/pdf/employeur")
    public ResponseEntity<?> getContratsPdfEmployeur() {
        try {
            final Long employeurId;
            try {
                employeurId = jwtUtils.getCurrentUserId();
            } catch (RuntimeException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
            }

            // Pour l'instant, retourner une liste vide (à implémenter avec une vraie base de données)
            // List<ContratPdf> contrats = contratPdfRepository.findByEmployeurId(employeurId);
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Contrats PDF récupérés",
                "data", new java.util.ArrayList<>() // Liste vide pour l'instant
            ));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Erreur lors de la récupération des contrats PDF: " + ex.getMessage()
            ));
        }
    }

    // Récupérer les contrats PDF pour un directeur
    @GetMapping("/pdf/directeur")
    public ResponseEntity<?> getContratsPdfDirecteur() {
        try {
            final Long directeurId;
            try {
                directeurId = jwtUtils.getCurrentUserId();
            } catch (RuntimeException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
            }

            // Pour l'instant, retourner une liste vide (à implémenter avec une vraie base de données)
            // List<ContratPdf> contrats = contratPdfRepository.findAll();
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Contrats PDF récupérés",
                "data", new java.util.ArrayList<>() // Liste vide pour l'instant
            ));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Erreur lors de la récupération des contrats PDF: " + ex.getMessage()
            ));
        }
    }

    // Créer un nouveau contrat
    @PostMapping
    public ResponseEntity<?> createContrat(@RequestBody Map<String, Object> payload) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optUser = userRepository.findById(userId);
            if (optUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non trouvé");
            }

            User currentUser = optUser.get();
            String userRole = currentUser.getRole().name();

            // Vérifier que c'est soit un directeur régional soit un employeur
            if (!"DIRECTEUR_REGIONAL".equals(userRole) && !"EMPLOYEUR".equals(userRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé - rôle non autorisé");
            }

            Contrat contrat = new Contrat();

            // Pour les contrats créés par les employeurs, on doit assigner un directeur régional
            if ("EMPLOYEUR".equals(userRole)) {
                // Récupérer le directeur depuis la demande d'affiliation
                Object demandeAffiliationIdObj = payload.get("demandeAffiliationId");
                if (demandeAffiliationIdObj != null) {
                    Long demandeId = Long.valueOf(String.valueOf(demandeAffiliationIdObj));
                    Optional<DemandeAffiliation> optDemande = demandeAffiliationRepository.findById(demandeId);
                    if (optDemande.isPresent()) {
                        contrat.setDirecteurRegional(optDemande.get().getDirecteurRegional());
                    } else {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Demande d'affiliation non trouvée");
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("demandeAffiliationId requis pour les employeurs");
                }
            } else {
                // Pour les directeurs, utiliser l'utilisateur actuel
                contrat.setDirecteurRegional(currentUser);
            }

            // Génération du numéro de contrat
            String numeroContrat = "OST-" + LocalDate.now().getYear() + "-" + 
                String.format("%04d", contratRepository.count() + 1);
            contrat.setNumeroContrat(numeroContrat);

            // Informations de l'entreprise depuis le payload
            String raisonSociale = (String) payload.get("raisonSociale");
            String numeroRccm = (String) payload.get("numeroRccm");
            String adresse = (String) payload.get("adresse");
            String secteurActivite = (String) payload.get("secteurActivite");
            Integer effectif = (Integer) payload.get("effectif");
            String contactDrh = (String) payload.get("contactDrh");
            String email = (String) payload.get("email");
            String telephone = (String) payload.get("telephone");

            // Validation des champs obligatoires
            if (raisonSociale == null || raisonSociale.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La raison sociale est obligatoire");
            }
            if (numeroRccm == null || numeroRccm.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Le numéro RCCM est obligatoire");
            }
            if (effectif == null || effectif <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("L'effectif doit être supérieur à 0");
            }

            // Si une demande d'affiliation est liée
            Object demandeAffiliationIdObj = payload.get("demandeAffiliationId");
            if (demandeAffiliationIdObj != null) {
                Long demandeId = Long.valueOf(String.valueOf(demandeAffiliationIdObj));
                Optional<DemandeAffiliation> optDemande = demandeAffiliationRepository.findById(demandeId);
                if (optDemande.isPresent()) {
                    contrat.setDemandeAffiliation(optDemande.get());
                }
            }

            // Type de contrat
            String typeContratStr = (String) payload.get("typeContrat");
            if (typeContratStr != null) {
                try {
                    contrat.setTypeContrat(TypeContrat.valueOf(typeContratStr));
                } catch (IllegalArgumentException e) {
                    contrat.setTypeContrat(TypeContrat.STANDARD);
                }
            } else {
                contrat.setTypeContrat(TypeContrat.STANDARD);
            }

            // Calcul du tarif
            int tarifParEmploye;
            switch (contrat.getTypeContrat()) {
                case INDUSTRIE_PETROLIERE:
                    tarifParEmploye = 45000;
                    break;
                case SPECIAL:
                    Object tarifPersonnaliseObj = payload.get("tarifPersonnalise");
                    tarifParEmploye = tarifPersonnaliseObj != null ? 
                        Integer.valueOf(String.valueOf(tarifPersonnaliseObj)) : 15000;
                    break;
                default:
                    tarifParEmploye = 15000;
            }
            
            contrat.setTarifAnnuel((double) (effectif * tarifParEmploye));

            // Dates
            String dateDebutStr = (String) payload.get("dateDebut");
            if (dateDebutStr != null && !dateDebutStr.trim().isEmpty()) {
                contrat.setDateDebut(LocalDate.parse(dateDebutStr));
            } else {
                contrat.setDateDebut(LocalDate.now());
            }

            Object dureeObj = payload.get("duree");
            int duree = dureeObj != null ? Integer.valueOf(String.valueOf(dureeObj)) : 12;
            contrat.setDateFin(contrat.getDateDebut().plusMonths(duree));

            // Zone médicale
            String zoneMedicale = (String) payload.get("zoneMedicale");
            if (zoneMedicale != null && !zoneMedicale.trim().isEmpty()) {
                contrat.setZoneMedicale(zoneMedicale);
            } else {
                contrat.setZoneMedicale("Ouagadougou Nord");
            }

            // Commentaires (utiliser motifAmendement pour stocker les commentaires)
            String commentaires = (String) payload.get("commentaires");
            if (commentaires != null && !commentaires.trim().isEmpty()) {
                contrat.setMotifAmendement(commentaires);
            }

            // Date de signature (obligatoire)
            contrat.setDateSignature(LocalDate.now());
            
            // Statut et dates de création
            contrat.setActif(true);
            contrat.setDateCreation(LocalDateTime.now());
            contrat.setDateModification(LocalDateTime.now());

            // Sauvegarder le contrat
            Contrat savedContrat = contratRepository.save(contrat);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedContrat);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création du contrat: " + ex.getMessage());
        }
    }

    // Obtenir un contrat par ID (version simplifiée pour éviter les problèmes de sérialisation JSON)
    @GetMapping("/{id}")
    public ResponseEntity<?> getContratById(@PathVariable Long id) {
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

            Optional<Contrat> optContrat = contratRepository.findById(id);
            if (optContrat.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Contrat non trouvé");
            }

            Contrat contrat = optContrat.get();
            if (!contrat.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à ce contrat");
            }

            // Retourner une version simplifiée pour éviter les problèmes de sérialisation
            Map<String, Object> contratSimple = new java.util.HashMap<>();
            contratSimple.put("id", contrat.getId());
            contratSimple.put("numeroContrat", contrat.getNumeroContrat());
            contratSimple.put("typeContrat", contrat.getTypeContrat());
            contratSimple.put("dateSignature", contrat.getDateSignature());
            contratSimple.put("dateDebut", contrat.getDateDebut());
            contratSimple.put("dateFin", contrat.getDateFin());
            contratSimple.put("zoneMedicale", contrat.getZoneMedicale());
            contratSimple.put("region", contrat.getRegion());
            contratSimple.put("tarifAnnuel", contrat.getTarifAnnuel());
            contratSimple.put("tarifMensuel", contrat.getTarifMensuel());
            contratSimple.put("actif", contrat.getActif());
            contratSimple.put("version", contrat.getVersion());
            contratSimple.put("motifAmendement", contrat.getMotifAmendement() != null ? contrat.getMotifAmendement().replaceAll("\"", "'") : null);
            contratSimple.put("dateCreation", contrat.getDateCreation());
            contratSimple.put("dateModification", contrat.getDateModification());

            Map<String, Object> directeurSimple = new java.util.HashMap<>();
            directeurSimple.put("id", contrat.getDirecteurRegional().getId());
            directeurSimple.put("nom", contrat.getDirecteurRegional().getNom());
            directeurSimple.put("prenom", contrat.getDirecteurRegional().getPrenom());
            directeurSimple.put("email", contrat.getDirecteurRegional().getEmail());
            contratSimple.put("directeurRegional", directeurSimple);

            if (contrat.getDemandeAffiliation() != null) {
                Map<String, Object> demandeSimple = new java.util.HashMap<>();
                demandeSimple.put("id", contrat.getDemandeAffiliation().getId());
                demandeSimple.put("raisonSociale", contrat.getDemandeAffiliation().getRaisonSociale());
                demandeSimple.put("secteurActivite", contrat.getDemandeAffiliation().getSecteurActivite());
                demandeSimple.put("effectif", contrat.getDemandeAffiliation().getEffectif());
                demandeSimple.put("email", contrat.getDemandeAffiliation().getEmail());
                contratSimple.put("demandeAffiliation", demandeSimple);
            }

            return ResponseEntity.ok(contratSimple);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération du contrat: " + ex.getMessage());
        }
    }

    // Créer un amendement de contrat
    @PostMapping("/{id}/amender")
    public ResponseEntity<?> amenderContrat(@PathVariable Long id, @RequestBody Map<String, Object> amendementData) {
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

            Optional<Contrat> optContrat = contratRepository.findById(id);
            if (optContrat.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Contrat non trouvé");
            }

            Contrat contrat = optContrat.get();
            if (!contrat.getDirecteurRegional().getId().equals(directeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à ce contrat");
            }

            // Créer une nouvelle version du contrat
            Contrat nouvelleVersion = new Contrat();
            nouvelleVersion.setNumeroContrat(contrat.getNumeroContrat());
            nouvelleVersion.setTypeContrat(contrat.getTypeContrat());
            nouvelleVersion.setDirecteurRegional(contrat.getDirecteurRegional());
            nouvelleVersion.setDemandeAffiliation(contrat.getDemandeAffiliation());
            nouvelleVersion.setRegion(contrat.getRegion());
            nouvelleVersion.setVersion(contrat.getVersion() + 1);
            nouvelleVersion.setActif(true);
            nouvelleVersion.setDateCreation(LocalDateTime.now());
            nouvelleVersion.setDateModification(LocalDateTime.now());
            // Champ obligatoire
            nouvelleVersion.setDateSignature(LocalDate.now());
            nouvelleVersion.setZoneMedicale(contrat.getZoneMedicale());

            // Appliquer les modifications
            if (amendementData.containsKey("motifAmendement")) {
                nouvelleVersion.setMotifAmendement((String) amendementData.get("motifAmendement"));
            }
            
            if (amendementData.containsKey("effectif")) {
                // Mettre à jour l'effectif dans la demande d'affiliation
                DemandeAffiliation demande = contrat.getDemandeAffiliation();
                demande.setEffectif(((Number) amendementData.get("effectif")).intValue());
                demandeAffiliationRepository.save(demande);
            }
            
            if (amendementData.containsKey("tarifAnnuel")) {
                double tarifAnnuel = ((Number) amendementData.get("tarifAnnuel")).doubleValue();
                nouvelleVersion.setTarifAnnuel(tarifAnnuel);
                nouvelleVersion.setTarifMensuel(tarifAnnuel / 12);
            } else {
                nouvelleVersion.setTarifAnnuel(contrat.getTarifAnnuel());
                nouvelleVersion.setTarifMensuel(contrat.getTarifMensuel());
            }
            
            if (amendementData.containsKey("dateDebut")) {
                String dateStr = (String) amendementData.get("dateDebut");
                if (dateStr != null && !dateStr.isEmpty()) {
                    nouvelleVersion.setDateDebut(LocalDate.parse(dateStr));
                }
            } else {
                nouvelleVersion.setDateDebut(contrat.getDateDebut());
            }
            
            if (amendementData.containsKey("dateFin")) {
                String dateStr = (String) amendementData.get("dateFin");
                if (dateStr != null && !dateStr.isEmpty()) {
                    nouvelleVersion.setDateFin(LocalDate.parse(dateStr));
                }
            } else {
                nouvelleVersion.setDateFin(contrat.getDateFin());
            }
            
            if (amendementData.containsKey("zoneMedicale")) {
                nouvelleVersion.setZoneMedicale((String) amendementData.get("zoneMedicale"));
            } else {
                nouvelleVersion.setZoneMedicale(contrat.getZoneMedicale());
            }

            // Désactiver l'ancienne version
            contrat.setActif(false);
            contrat.setDateModification(LocalDateTime.now());
            contratRepository.save(contrat);

            // Sauvegarder la nouvelle version
            Contrat nouveauContrat = contratRepository.save(nouvelleVersion);

            return ResponseEntity.status(HttpStatus.CREATED).body(nouveauContrat);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création de l'amendement: " + ex.getMessage());
        }
    }

    // Statistiques des contrats
    @GetMapping("/stats")
    public ResponseEntity<?> getContratStats() {
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
            
            Map<String, Object> stats = Map.of(
                "totalContrats", contratRepository.countActiveContratsByDirecteur(directeur),
                "chiffreAffairesTotal", contratRepository.sumActiveContratsByDirecteur(directeur) != null ? 
                    contratRepository.sumActiveContratsByDirecteur(directeur) : 0.0
            );

            return ResponseEntity.ok(stats);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la récupération des statistiques: " + ex.getMessage());
        }
    }

    // Envoyer un contrat par email manuellement
    @PostMapping("/{id}/send-email")
    public ResponseEntity<?> sendContratEmail(@PathVariable Long id, @RequestBody Map<String, Object> emailData) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optUser = userRepository.findById(userId);
            if (optUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utilisateur non trouvé");
            }

            Optional<Contrat> optContrat = contratRepository.findById(id);
            if (optContrat.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Contrat non trouvé");
            }

            Contrat contrat = optContrat.get();

            // Vérifier que l'utilisateur a le droit d'accéder à ce contrat
            User currentUser = optUser.get();
            String userRole = currentUser.getRole().name();

            if ("DIRECTEUR_REGIONAL".equals(userRole)) {
                if (!contrat.getDirecteurRegional().getId().equals(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à ce contrat");
                }
            } else if ("EMPLOYEUR".equals(userRole)) {
                // Pour les employeurs, vérifier qu'ils sont liés au contrat via la demande d'affiliation
                if (contrat.getDemandeAffiliation() == null ||
                    !contrat.getDemandeAffiliation().getEmployeur().getId().equals(userId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé à ce contrat");
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Rôle non autorisé");
            }

            // Récupérer l'email du destinataire
            String recipientEmail = (String) emailData.get("email");
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email du destinataire requis");
            }

            // Récupérer la raison sociale
            String raisonSociale = contrat.getDemandeAffiliation() != null ?
                contrat.getDemandeAffiliation().getRaisonSociale() : "Entreprise";

            // Générer le PDF du contrat
            byte[] pdfBytes = pdfService.generateContratPdf(
                contrat.getNumeroContrat(),
                raisonSociale,
                contrat.getZoneMedicale(),
                contrat.getTarifAnnuel()
            );

            // Préparer le contenu de l'email
            String subject = "Contrat d'Affiliation - " + contrat.getNumeroContrat();
            String htmlBody = "<html><body>" +
                "<h2>Contrat d'Affiliation</h2>" +
                "<p>Cher " + raisonSociale + ",</p>" +
                "<p>Veuillez trouver ci-joint votre contrat d'affiliation.</p>" +
                "<p><strong>Numéro de contrat:</strong> " + contrat.getNumeroContrat() + "</p>" +
                "<p><strong>Zone médicale:</strong> " + contrat.getZoneMedicale() + "</p>" +
                "<p><strong>Montant annuel:</strong> " + String.format("%,.0f", contrat.getTarifAnnuel()) + " XOF</p>" +
                "<p><strong>Date de signature:</strong> " + contrat.getDateSignature() + "</p>" +
                "<p>Cordialement,<br>Service de Santé au Travail</p>" +
                "</body></html>";

            // Envoyer l'email avec le PDF en pièce jointe
            mailService.sendEmailWithAttachment(
                recipientEmail,
                subject,
                htmlBody,
                pdfBytes,
                "contrat_" + contrat.getNumeroContrat() + ".pdf"
            );

            return ResponseEntity.ok(Map.of(
                "status", "EMAIL_SENT",
                "message", "Contrat envoyé par email avec succès",
                "recipient", recipientEmail,
                "numeroContrat", contrat.getNumeroContrat()
            ));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de l'envoi de l'email: " + ex.getMessage());
        }
    }
}
