package com.registremedical.controller;

import com.registremedical.entity.Entreprise;
import com.registremedical.entity.User;
import com.registremedical.repository.EntrepriseRepository;
import com.registremedical.repository.UserRepository;
import com.registremedical.security.JwtUtils;
import com.registremedical.service.GeocodingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/geocoding")
@CrossOrigin(origins = "http://localhost:5173")
public class GeocodingController {

    @Autowired
    private GeocodingService geocodingService;

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // Géocoder une adresse spécifique
    @PostMapping("/geocode")
    public ResponseEntity<?> geocodeAddress(@RequestBody Map<String, String> addressData) {
        final Long userId;
        try {
            userId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }

        try {
            Optional<User> optUser = userRepository.findById(userId);
            if (optUser.isEmpty() || !"DIRECTEUR_REGIONAL".equals(optUser.get().getRole().name())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Accès refusé");
            }

            String address = addressData.get("address");
            String city = addressData.get("city");
            String country = addressData.getOrDefault("country", "Morocco");

            Map<String, Double> coordinates = geocodingService.getCoordinatesFromAddress(address, city, country);
            return ResponseEntity.ok(coordinates);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du géocodage: " + ex.getMessage());
        }
    }

    // Géocoder toutes les entreprises sans coordonnées
    @PostMapping("/geocode-all-entreprises")
    public ResponseEntity<?> geocodeAllEntreprises() {
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

            // Trouver toutes les entreprises sans coordonnées
            List<Entreprise> toutes = entrepriseRepository.findAll();
            int geocoded = 0;
            int errors = 0;

            for (Entreprise entreprise : toutes) {
                if (entreprise.getLatitude() == null || entreprise.getLongitude() == null) {
                    try {
                        Map<String, Double> coordinates = geocodingService.getCoordinatesFromAddress(
                            entreprise.getAdresse(),
                            entreprise.getVille(),
                            "Morocco"
                        );

                        entreprise.setLatitude(coordinates.get("latitude"));
                        entreprise.setLongitude(coordinates.get("longitude"));
                        entreprise.setAdresseComplete(
                            entreprise.getAdresse() + ", " + entreprise.getVille() + ", " + entreprise.getCodePostal()
                        );
                        entreprise.setCoordinatesVerified(true);
                        
                        entrepriseRepository.save(entreprise);
                        geocoded++;

                        // Pause pour respecter les limites de l'API
                        Thread.sleep(1000);

                    } catch (Exception e) {
                        System.err.println("Erreur pour l'entreprise " + entreprise.getId() + ": " + e.getMessage());
                        errors++;
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("geocoded", geocoded);
            result.put("errors", errors);
            result.put("message", String.format("%d entreprises géocodées, %d erreurs", geocoded, errors));

            return ResponseEntity.ok(result);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du géocodage en masse: " + ex.getMessage());
        }
    }

    // Géocoder une entreprise spécifique
    @PostMapping("/geocode-entreprise/{id}")
    public ResponseEntity<?> geocodeEntreprise(@PathVariable Long id) {
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

            Optional<Entreprise> optEntreprise = entrepriseRepository.findById(id);
            if (optEntreprise.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Entreprise non trouvée");
            }

            Entreprise entreprise = optEntreprise.get();

            Map<String, Double> coordinates = geocodingService.getCoordinatesFromAddress(
                entreprise.getAdresse(),
                entreprise.getVille(),
                "Morocco"
            );

            entreprise.setLatitude(coordinates.get("latitude"));
            entreprise.setLongitude(coordinates.get("longitude"));
            entreprise.setAdresseComplete(
                entreprise.getAdresse() + ", " + entreprise.getVille() + ", " + entreprise.getCodePostal()
            );
            entreprise.setCoordinatesVerified(true);

            Entreprise savedEntreprise = entrepriseRepository.save(entreprise);
            return ResponseEntity.ok(savedEntreprise);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du géocodage de l'entreprise: " + ex.getMessage());
        }
    }

    // Obtenir les statistiques de géocodage
    @GetMapping("/stats")
    public ResponseEntity<?> getGeocodingStats() {
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

            List<Entreprise> toutes = entrepriseRepository.findAll();
            long totalEntreprises = toutes.size();
            long avecCoordonnees = toutes.stream()
                .mapToLong(e -> (e.getLatitude() != null && e.getLongitude() != null) ? 1 : 0)
                .sum();
            long sansCoordonnees = totalEntreprises - avecCoordonnees;

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEntreprises", totalEntreprises);
            stats.put("avecCoordonnees", avecCoordonnees);
            stats.put("sansCoordonnees", sansCoordonnees);
            stats.put("pourcentageGeocode", totalEntreprises > 0 ? (avecCoordonnees * 100.0 / totalEntreprises) : 0);

            return ResponseEntity.ok(stats);

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors du calcul des statistiques: " + ex.getMessage());
        }
    }
}
