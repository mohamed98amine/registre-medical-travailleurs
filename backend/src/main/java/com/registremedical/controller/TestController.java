package com.registremedical.controller;

import com.registremedical.entity.DemandeAffiliation;
import com.registremedical.entity.User;
import com.registremedical.enums.UserRole;
import com.registremedical.repository.DemandeAffiliationRepository;
import com.registremedical.repository.UserRepository;
import com.registremedical.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DemandeAffiliationRepository demandeAffiliationRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        try {
            List<User> users = userRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("total", users.size());
            response.put("users", users);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/directeurs")
    public ResponseEntity<?> getDirecteurs() {
        try {
            List<User> directeurs = userRepository.findByRole(UserRole.DIRECTEUR_REGIONAL);
            Map<String, Object> response = new HashMap<>();
            response.put("total", directeurs.size());
            response.put("directeurs", directeurs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/employeurs")
    public ResponseEntity<?> getEmployeurs() {
        try {
            List<User> employeurs = userRepository.findByRole(UserRole.EMPLOYEUR);
            Map<String, Object> response = new HashMap<>();
            response.put("total", employeurs.size());
            response.put("employeurs", employeurs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @GetMapping("/demandes")
    public ResponseEntity<?> getDemandes() {
        try {
            List<DemandeAffiliation> demandes = demandeAffiliationRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("total", demandes.size());
            response.put("demandes", demandes);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    @PostMapping("/create-demande-simple")
    public ResponseEntity<?> createDemandeSimple(@RequestBody Map<String, Object> payload) {
        try {
            // Vérifier les utilisateurs disponibles
            List<User> employeurs = userRepository.findByRole(UserRole.EMPLOYEUR);
            List<User> directeurs = userRepository.findByRole(UserRole.DIRECTEUR_REGIONAL);

            Map<String, Object> response = new HashMap<>();
            response.put("employeurs_disponibles", employeurs.size());
            response.put("directeurs_disponibles", directeurs.size());

            if (employeurs.isEmpty()) {
                response.put("erreur", "Aucun employeur trouvé");
                return ResponseEntity.badRequest().body(response);
            }

            if (directeurs.isEmpty()) {
                response.put("erreur", "Aucun directeur régional trouvé");
                return ResponseEntity.badRequest().body(response);
            }

            // Créer une demande simple
            DemandeAffiliation demande = new DemandeAffiliation();
            demande.setRaisonSociale((String) payload.getOrDefault("raisonSociale", "Test SARL"));
            demande.setNumeroRccm((String) payload.getOrDefault("numeroRccm", "BF-TEST-001"));
            demande.setSecteurActivite((String) payload.getOrDefault("secteurActivite", "Test"));
            demande.setEffectif((Integer) payload.getOrDefault("effectif", 5));
            demande.setAdresse((String) payload.getOrDefault("adresse", "Adresse test"));
            demande.setRepresentantLegal((String) payload.getOrDefault("representantLegal", "Test Rep"));
            demande.setEmail((String) payload.getOrDefault("email", "test@test.com"));
            demande.setTelephone((String) payload.getOrDefault("telephone", "123456789"));
            demande.setContactDrh((String) payload.getOrDefault("contactDrh", "Test DRH"));
            demande.setStatut(com.registremedical.enums.StatutAffiliation.NOUVELLE);
            demande.setDateCreation(LocalDateTime.now());
            demande.setEmployeur(employeurs.get(0));
            demande.setDirecteurRegional(directeurs.get(0));

            DemandeAffiliation saved = demandeAffiliationRepository.save(demande);
            response.put("demande_creee", true);
            response.put("demande_id", saved.getId());
            response.put("demande", saved);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("erreur", e.getMessage());
            errorResponse.put("classe_erreur", e.getClass().getSimpleName());
            errorResponse.put("stack_trace", e.getStackTrace());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
