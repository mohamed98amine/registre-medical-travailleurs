package com.registremedical.controller;

import com.registremedical.dto.EntrepriseRequestDTO;
import com.registremedical.entity.Entreprise;
import com.registremedical.entity.User;
import com.registremedical.repository.EntrepriseRepository;
import com.registremedical.security.JwtUtils;
import com.registremedical.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/entreprises")
@CrossOrigin(origins = "*")
public class EntrepriseController {

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping
    public ResponseEntity<?> list() {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        User current = userService.findById(userId).orElse(null);
        if (current == null || !"EMPLOYEUR".equals(current.getRole().name())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès réservé aux employeurs");
        }
        return ResponseEntity.ok(entrepriseRepository.findByEmployeurId(current.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        Optional<Entreprise> opt = entrepriseRepository.findByIdAndEmployeurId(id, userId);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Entreprise non trouvée");
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody EntrepriseRequestDTO payload) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        User current = userService.findById(userId).orElse(null);
        if (current == null || !"EMPLOYEUR".equals(current.getRole().name())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès réservé aux employeurs");
        }

        try {
            Entreprise e = new Entreprise();
            // Map frontend fields -> backend entity
            e.setNom(payload.getRaisonSociale());
            e.setSecteurActivite(payload.getSecteurActivite());
            e.setEffectif(payload.getEffectif());
            e.setAdresse(payload.getAdresse());
            e.setTelephone(payload.getTelephone());
            e.setEmail(payload.getEmail());
            e.setZoneAffectation(payload.getZoneAffectation());
            // Valeurs par défaut pour respecter @NotBlank
            String ville = payload.getVille();
            String codePostal = payload.getCodePostal();
            e.setVille(ville != null && !ville.isBlank() ? ville : "N/A");
            e.setCodePostal(codePostal != null && !codePostal.isBlank() ? codePostal : "00000");
            e.setSiret(payload.getSiret());
            e.setEmployeur(current);

            Entreprise saved = entrepriseRepository.save(e);
            return ResponseEntity.created(URI.create("/api/entreprises/" + saved.getId())).body(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la création de l'entreprise: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EntrepriseRequestDTO payload) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        Optional<Entreprise> opt = entrepriseRepository.findByIdAndEmployeurId(id, userId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Entreprise non trouvée");
        }
        try {
            Entreprise e = opt.get();
            // Update mapping
            if (payload.getRaisonSociale() != null) e.setNom(payload.getRaisonSociale());
            if (payload.getSecteurActivite() != null) e.setSecteurActivite(payload.getSecteurActivite());
            if (payload.getEffectif() != null) e.setEffectif(payload.getEffectif());
            if (payload.getAdresse() != null) e.setAdresse(payload.getAdresse());
            if (payload.getTelephone() != null) e.setTelephone(payload.getTelephone());
            if (payload.getEmail() != null) e.setEmail(payload.getEmail());
            if (payload.getZoneAffectation() != null) e.setZoneAffectation(payload.getZoneAffectation());
            if (payload.getVille() != null) e.setVille(payload.getVille().isBlank() ? "N/A" : payload.getVille());
            if (payload.getCodePostal() != null) e.setCodePostal(payload.getCodePostal().isBlank() ? "00000" : payload.getCodePostal());
            if (payload.getSiret() != null) e.setSiret(payload.getSiret());

            Entreprise saved = entrepriseRepository.save(e);
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la mise à jour de l'entreprise: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        Optional<Entreprise> opt = entrepriseRepository.findByIdAndEmployeurId(id, userId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Entreprise non trouvée");
        }
        entrepriseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
