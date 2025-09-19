package com.registremedical.controller;

import com.registremedical.entity.CertificatAptitude;
import com.registremedical.entity.Travailleur;
import com.registremedical.entity.User;
import com.registremedical.enums.Aptitude;
import com.registremedical.repository.CertificatAptitudeRepository;
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
@RequestMapping("/api/certificats")
@CrossOrigin(origins = "*")
public class CertificatAptitudeController {

    @Autowired
    private CertificatAptitudeRepository certificatRepository;

    @Autowired
    private TravailleurRepository travailleurRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // Créer un certificat (médecin)
    @PostMapping
    public ResponseEntity<?> createCertificat(@RequestBody Map<String, Object> payload) {
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

            Long travailleurId = Long.valueOf(String.valueOf(payload.get("travailleurId")));
            Optional<Travailleur> optTravailleur = travailleurRepository.findById(travailleurId);
            if (optTravailleur.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Travailleur non trouvé");
            }

            CertificatAptitude certificat = new CertificatAptitude();
            certificat.setTravailleur(optTravailleur.get());
            certificat.setMedecin(optMedecin.get());
            
            String aptitudeStr = (String) payload.get("aptitude");
            if (aptitudeStr != null) {
                certificat.setAptitude(Aptitude.valueOf(aptitudeStr));
            }
            
            certificat.setObservations((String) payload.getOrDefault("observations", ""));
            certificat.setRestrictions((String) payload.getOrDefault("restrictions", ""));
            
            String dateEmissionStr = (String) payload.get("dateEmission");
            if (dateEmissionStr != null) {
                certificat.setDateEmission(LocalDate.parse(dateEmissionStr));
            } else {
                certificat.setDateEmission(LocalDate.now());
            }
            
            String dateExpirationStr = (String) payload.get("dateExpiration");
            if (dateExpirationStr != null) {
                certificat.setDateExpiration(LocalDate.parse(dateExpirationStr));
            } else {
                // Par défaut, 1 an après la date d'émission
                certificat.setDateExpiration(certificat.getDateEmission().plusYears(1));
            }

            CertificatAptitude saved = certificatRepository.save(certificat);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la création du certificat: " + ex.getMessage());
        }
    }

    // Lister les certificats d'un médecin
    @GetMapping("/medecin")
    public ResponseEntity<?> getCertificatsMedecin() {
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

            List<CertificatAptitude> certificats = certificatRepository.findByMedecinOrderByDateEmissionDesc(optMedecin.get());
            return ResponseEntity.ok(certificats);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des certificats: " + ex.getMessage());
        }
    }

    // Lister les certificats d'un employeur (via ses travailleurs)
    @GetMapping("/employeur")
    public ResponseEntity<?> getCertificatsEmployeur() {
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

            // Récupérer les travailleurs de l'employeur
            List<Travailleur> travailleurs = travailleurRepository.findByEntrepriseEmployeurId(employeurId);
            List<Long> travailleurIds = travailleurs.stream().map(Travailleur::getId).toList();
            
            // Récupérer les certificats de ces travailleurs
            List<CertificatAptitude> certificats = certificatRepository.findByTravailleurIdInOrderByDateEmissionDesc(travailleurIds);
            return ResponseEntity.ok(certificats);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des certificats: " + ex.getMessage());
        }
    }

    // Obtenir le dernier certificat d'un travailleur
    @GetMapping("/travailleur/{travailleurId}/dernier")
    public ResponseEntity<?> getDernierCertificat(@PathVariable Long travailleurId) {
        try {
            Optional<Travailleur> optTravailleur = travailleurRepository.findById(travailleurId);
            if (optTravailleur.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Travailleur non trouvé");
            }

            List<CertificatAptitude> certificats = certificatRepository.findDernierByTravailleur(optTravailleur.get());
            if (certificats.isEmpty()) {
                return ResponseEntity.ok(null);
            }

            return ResponseEntity.ok(certificats.get(0));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération du certificat: " + ex.getMessage());
        }
    }

    // Mettre à jour un certificat
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCertificat(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        final Long medecinId;
        try {
            medecinId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<CertificatAptitude> optCertificat = certificatRepository.findById(id);
            if (optCertificat.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Certificat non trouvé");
            }

            CertificatAptitude certificat = optCertificat.get();
            
            // Vérifier que le médecin est le propriétaire du certificat
            if (!certificat.getMedecin().getId().equals(medecinId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            if (payload.containsKey("aptitude")) {
                String aptitudeStr = (String) payload.get("aptitude");
                if (aptitudeStr != null) {
                    certificat.setAptitude(Aptitude.valueOf(aptitudeStr));
                }
            }
            
            if (payload.containsKey("observations")) {
                certificat.setObservations((String) payload.get("observations"));
            }
            
            if (payload.containsKey("restrictions")) {
                certificat.setRestrictions((String) payload.get("restrictions"));
            }
            
            if (payload.containsKey("dateExpiration")) {
                String dateExpirationStr = (String) payload.get("dateExpiration");
                if (dateExpirationStr != null) {
                    certificat.setDateExpiration(LocalDate.parse(dateExpirationStr));
                }
            }

            CertificatAptitude saved = certificatRepository.save(certificat);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la mise à jour du certificat: " + ex.getMessage());
        }
    }

    // Supprimer un certificat
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCertificat(@PathVariable Long id) {
        final Long medecinId;
        try {
            medecinId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<CertificatAptitude> optCertificat = certificatRepository.findById(id);
            if (optCertificat.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Certificat non trouvé");
            }

            CertificatAptitude certificat = optCertificat.get();
            
            // Vérifier que le médecin est le propriétaire du certificat
            if (!certificat.getMedecin().getId().equals(medecinId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            certificatRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la suppression du certificat: " + ex.getMessage());
        }
    }
}
