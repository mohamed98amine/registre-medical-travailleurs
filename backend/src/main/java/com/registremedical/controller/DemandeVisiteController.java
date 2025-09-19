package com.registremedical.controller;

import com.registremedical.entity.DemandeVisite;
import com.registremedical.entity.Travailleur;
import com.registremedical.entity.User;
import com.registremedical.enums.SpecialiteMedicale;
import com.registremedical.enums.StatutDemande;
import com.registremedical.enums.TypeVisite;
import com.registremedical.repository.DemandeVisiteRepository;
import com.registremedical.repository.TravailleurRepository;
import com.registremedical.repository.UserRepository;
import com.registremedical.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/demandes-visite")
@CrossOrigin(origins = "*")
public class DemandeVisiteController {

    @Autowired
    private DemandeVisiteRepository demandeVisiteRepository;

    @Autowired
    private TravailleurRepository travailleurRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // Créer une demande de visite (employeur)
    @PostMapping
    public ResponseEntity<?> createDemande(@RequestBody Map<String, Object> payload) {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optEmployeur = userRepository.findById(employeurId);
            if (optEmployeur.isEmpty() || !"EMPLOYEUR".equals(optEmployeur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            DemandeVisite demande = new DemandeVisite();
            demande.setEmployeur(optEmployeur.get());
            
            // Type de visite
            String typeVisiteStr = (String) payload.get("typeVisite");
            if (typeVisiteStr != null) {
                demande.setTypeVisite(TypeVisite.valueOf(typeVisiteStr));
            }
            
            // Spécialité
            String specialiteStr = (String) payload.get("specialite");
            if (specialiteStr != null) {
                demande.setSpecialite(SpecialiteMedicale.valueOf(specialiteStr));
            }
            
            // Date souhaitée
            String dateStr = (String) payload.get("dateSouhaitee");
            if (dateStr != null) {
                demande.setDateSouhaitee(LocalDate.parse(dateStr));
            }
            
            // Motif
            demande.setMotif((String) payload.getOrDefault("motif", ""));
            
            // Médecin assigné
            Object medecinIdObj = payload.get("medecinId");
            if (medecinIdObj != null) {
                Long medecinId = Long.valueOf(String.valueOf(medecinIdObj));
                Optional<User> optMedecin = userRepository.findById(medecinId);
                if (optMedecin.isPresent() && "MEDECIN".equals(optMedecin.get().getRole().name())) {
                    demande.setMedecin(optMedecin.get());
                    demande.setStatut(StatutDemande.EN_ATTENTE);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Médecin invalide");
                }
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Médecin requis");
            }
            
            // Travailleurs
            @SuppressWarnings("unchecked")
            List<Long> travailleurIds = (List<Long>) payload.get("travailleurIds");
            if (travailleurIds != null && !travailleurIds.isEmpty()) {
                List<Travailleur> travailleurs = travailleurRepository.findAllById(travailleurIds);
                // Vérifier que les travailleurs appartiennent à l'employeur
                boolean allBelongToEmployeur = travailleurs.stream()
                    .allMatch(t -> t.getEntreprise() != null && 
                             t.getEntreprise().getEmployeur() != null && 
                             t.getEntreprise().getEmployeur().getId().equals(employeurId));
                
                if (!allBelongToEmployeur) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Certains travailleurs ne vous appartiennent pas");
                }
                
                demande.setTravailleurs(travailleurs);
            }

            DemandeVisite saved = demandeVisiteRepository.save(demande);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la création de la demande: " + ex.getMessage());
        }
    }

    // Lister les demandes d'un employeur
    @GetMapping("/employeur")
    public ResponseEntity<?> getDemandesEmployeur() {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optEmployeur = userRepository.findById(employeurId);
            if (optEmployeur.isEmpty() || !"EMPLOYEUR".equals(optEmployeur.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            List<DemandeVisite> demandes = demandeVisiteRepository.findByEmployeurOrderByCreatedAtDesc(optEmployeur.get());
            return ResponseEntity.ok(demandes);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des demandes: " + ex.getMessage());
        }
    }

    // Lister les demandes d'un médecin
    @GetMapping("/medecin")
    public ResponseEntity<?> getDemandesMedecin() {
        final Long medecinId;
        try {
            medecinId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optMedecin = userRepository.findById(medecinId);
            if (optMedecin.isEmpty() || !"MEDECIN".equals(optMedecin.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            List<DemandeVisite> demandes = demandeVisiteRepository.findByMedecinOrderByCreatedAtDesc(optMedecin.get());
            return ResponseEntity.ok(demandes);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des demandes: " + ex.getMessage());
        }
    }

    // Mettre à jour le statut d'une demande (médecin)
    @PutMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        final Long medecinId;
        try {
            medecinId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optMedecin = userRepository.findById(medecinId);
            if (optMedecin.isEmpty() || !"MEDECIN".equals(optMedecin.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            Optional<DemandeVisite> optDemande = demandeVisiteRepository.findById(id);
            if (optDemande.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Demande non trouvée");
            }

            DemandeVisite demande = optDemande.get();
            
            // Vérifier que le médecin est assigné à cette demande
            if (demande.getMedecin() == null || !demande.getMedecin().getId().equals(medecinId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Vous n'êtes pas assigné à cette demande");
            }

            String statutStr = (String) payload.get("statut");
            if (statutStr != null) {
                demande.setStatut(StatutDemande.valueOf(statutStr));
            }

            String commentaires = (String) payload.get("commentaires");
            if (commentaires != null) {
                demande.setCommentaires(commentaires);
            }

            String nouvelleDateStr = (String) payload.get("nouvelleDateProposee");
            if (nouvelleDateStr != null && !nouvelleDateStr.isEmpty()) {
                demande.setNouvelleDateProposee(LocalDate.parse(nouvelleDateStr));
            }

            DemandeVisite saved = demandeVisiteRepository.save(demande);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la mise à jour: " + ex.getMessage());
        }
    }

    // Assigner un médecin à une demande
    @PutMapping("/{id}/assigner")
    public ResponseEntity<?> assignerMedecin(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Optional<DemandeVisite> optDemande = demandeVisiteRepository.findById(id);
            if (optDemande.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Demande non trouvée");
            }

            Long medecinId = Long.valueOf(String.valueOf(payload.get("medecinId")));
            Optional<User> optMedecin = userRepository.findById(medecinId);
            if (optMedecin.isEmpty() || !"MEDECIN".equals(optMedecin.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Médecin invalide");
            }

            DemandeVisite demande = optDemande.get();
            demande.setMedecin(optMedecin.get());
            demande.setStatut(StatutDemande.ACCEPTEE);

            DemandeVisite saved = demandeVisiteRepository.save(demande);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de l'assignation: " + ex.getMessage());
        }
    }

    // Obtenir les médecins par spécialité (accessible sans authentification pour le formulaire)
    @GetMapping("/medecins/specialite/{specialite}")
    @CrossOrigin(origins = "*")
    public ResponseEntity<?> getMedecinsBySpecialite(@PathVariable String specialite) {
        try {
            SpecialiteMedicale specialiteEnum = SpecialiteMedicale.valueOf(specialite);
            List<User> medecins = userRepository.findByRoleAndSpecialite(
                com.registremedical.enums.UserRole.MEDECIN, 
                specialiteEnum
            );
            return ResponseEntity.ok(medecins);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la récupération des médecins: " + ex.getMessage());
        }
    }
}
