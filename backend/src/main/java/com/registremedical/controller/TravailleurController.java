package com.registremedical.controller;

import com.registremedical.entity.Travailleur;
import com.registremedical.repository.TravailleurRepository;
import com.registremedical.repository.EntrepriseRepository;
import com.registremedical.entity.Entreprise;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Optional;
import com.registremedical.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize; // if method security enabled
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
// @PreAuthorize("hasRole('EMPLOYEUR')")
public class TravailleurController {

    @Autowired
    private TravailleurRepository travailleurRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @GetMapping("/travailleurs")
    public ResponseEntity<?> getAllTravailleurs() {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        System.out.println("Fetching travailleurs for employeurId: " + employeurId);
        List<Travailleur> travailleurs = travailleurRepository.findByEntrepriseEmployeurId(employeurId);
        return ResponseEntity.ok(travailleurs);
    }

    @GetMapping("/travailleurs/{id}")
    public ResponseEntity<?> getTravailleurById(@PathVariable Long id) {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        Optional<Travailleur> opt = travailleurRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Travailleur non trouvé");
        }
        Travailleur t = opt.get();
        if (t.getEntreprise() == null || t.getEntreprise().getEmployeur() == null ||
                !t.getEntreprise().getEmployeur().getId().equals(employeurId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
        }
        return ResponseEntity.ok(t);
    }

    @PostMapping("/travailleurs")
    public ResponseEntity<?> createTravailleur(@RequestBody Map<String, Object> payload) {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            // Récupération de l'entreprise et vérification d'appartenance
            Map<String, Object> entrepriseMap = (Map<String, Object>) payload.get("entreprise");
            if (entrepriseMap == null || entrepriseMap.get("id") == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Entreprise manquante");
            }
            Long entrepriseId = Long.valueOf(String.valueOf(entrepriseMap.get("id")));
            Optional<Entreprise> optEntreprise = entrepriseRepository.findById(entrepriseId);
            if (optEntreprise.isEmpty() || optEntreprise.get().getEmployeur() == null ||
                !optEntreprise.get().getEmployeur().getId().equals(employeurId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Entreprise invalide");
            }

            Entreprise entreprise = optEntreprise.get();

            Travailleur t = new Travailleur();
            t.setNom(String.valueOf(payload.getOrDefault("nom", "")).trim());
            t.setPrenom(String.valueOf(payload.getOrDefault("prenom", "")).trim());
            t.setEmail((String) payload.getOrDefault("email", null));
            t.setTelephone((String) payload.getOrDefault("telephone", null));
            t.setAdresse(String.valueOf(payload.getOrDefault("adresse", "")).trim());
            // Valeurs par défaut requises par l'entité
            t.setVille("N/A");
            t.setCodePostal("00000");
            // Dates
            Object dateN = payload.get("dateNaissance");
            if (dateN != null && !String.valueOf(dateN).isBlank()) {
                t.setDateNaissance(LocalDate.parse(String.valueOf(dateN)));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("dateNaissance requise");
            }
            t.setPoste((String) payload.getOrDefault("poste", null));
            t.setEntreprise(entreprise);

            Travailleur saved = travailleurRepository.save(t);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la création du travailleur: " + (ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage()));
        }
    }

    @PutMapping("/travailleurs/{id}")
    public ResponseEntity<?> updateTravailleur(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        Optional<Travailleur> opt = travailleurRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Travailleur non trouvé");
        }
        Travailleur t = opt.get();
        if (t.getEntreprise() == null || t.getEntreprise().getEmployeur() == null ||
                !t.getEntreprise().getEmployeur().getId().equals(employeurId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
        }

        try {
            if (payload.containsKey("nom")) t.setNom(String.valueOf(payload.get("nom")).trim());
            if (payload.containsKey("prenom")) t.setPrenom(String.valueOf(payload.get("prenom")).trim());
            if (payload.containsKey("email")) t.setEmail((String) payload.get("email"));
            if (payload.containsKey("telephone")) t.setTelephone((String) payload.get("telephone"));
            if (payload.containsKey("adresse")) t.setAdresse(String.valueOf(payload.get("adresse")).trim());
            if (payload.containsKey("poste")) t.setPoste((String) payload.get("poste"));
            if (payload.containsKey("dateNaissance")) {
                Object dateN = payload.get("dateNaissance");
                if (dateN != null && !String.valueOf(dateN).isBlank()) {
                    t.setDateNaissance(LocalDate.parse(String.valueOf(dateN)));
                }
            }

            Travailleur saved = travailleurRepository.save(t);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la mise à jour du travailleur: " + (ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage()));
        }
    }

    @GetMapping("/employer/workers/compact")
    public ResponseEntity<?> getCompactWorkers() {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        System.out.println("Fetching compact workers for employeurId: " + employeurId);
        List<Object[]> compactList = travailleurRepository.findCompactByEmployeurId(employeurId);
        List<Map<String, Object>> result = compactList.stream()
            .map(arr -> Map.of(
                "id", arr[0],
                "nom", arr[1],
                "prenom", arr[2],
                "poste", arr[3]
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}