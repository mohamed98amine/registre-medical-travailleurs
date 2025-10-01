package com.registremedical.controller;

import com.registremedical.entity.Entreprise;
import com.registremedical.repository.EntrepriseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entreprises")
@CrossOrigin(origins = "*")
public class EntrepriseController {

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @GetMapping
    public List<Entreprise> getAllEntreprises() {
        System.out.println("=== GET /api/entreprises appelé ===");
        List<Entreprise> entreprises = entrepriseRepository.findAll();
        System.out.println("Nombre d'entreprises trouvées: " + entreprises.size());
        return entreprises;
    }

    @PostMapping
    public ResponseEntity<?> createEntreprise(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/entreprises appelé ===");
        System.out.println("Données reçues: " + data);
        
        try {
            Entreprise entreprise = new Entreprise();
            
            // Champs obligatoires avec validation
            String nom = (String) data.get("nom");
            if (nom == null || nom.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le nom de l'entreprise est obligatoire");
            }
            entreprise.setNom(nom.trim());
            
            String adresse = (String) data.get("adresse");
            if (adresse == null || adresse.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("L'adresse est obligatoire");
            }
            entreprise.setAdresse(adresse.trim());
            
            String telephone = (String) data.get("telephone");
            if (telephone == null || telephone.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le téléphone est obligatoire");
            }
            entreprise.setTelephone(telephone.trim());
            
            String email = (String) data.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("L'email est obligatoire");
            }
            entreprise.setEmail(email.trim());
            
            // Champs optionnels avec valeurs par défaut
            entreprise.setVille(data.get("ville") != null ? ((String) data.get("ville")).trim() : "Ouagadougou");
            entreprise.setCodePostal(data.get("codePostal") != null ? ((String) data.get("codePostal")).trim() : "01 BP");
            entreprise.setStatut("ACTIVE");
            
            if (data.get("secteurActivite") != null) {
                entreprise.setSecteurActivite(((String) data.get("secteurActivite")).trim());
            }
            if (data.get("effectif") != null) {
                try {
                    String effectifStr = data.get("effectif").toString();
                    entreprise.setEffectif(Integer.parseInt(effectifStr));
                } catch (NumberFormatException e) {
                    System.out.println("Effectif invalide, utilisation de 0 par défaut");
                    entreprise.setEffectif(0);
                }
            }
            
            // Initialiser les champs optionnels pour éviter les erreurs de contrainte
            entreprise.setLatitude(null);
            entreprise.setLongitude(null);
            entreprise.setAdresseComplete(null);
            entreprise.setCoordinatesVerified(false);
            
            // Timestamps
            entreprise.setCreatedAt(LocalDateTime.now());
            entreprise.setUpdatedAt(LocalDateTime.now());
            
            System.out.println("Entreprise créée: " + entreprise.getNom() + " - " + entreprise.getEmail());
            
            Entreprise saved = entrepriseRepository.save(entreprise);
            System.out.println("Entreprise sauvegardée avec ID: " + saved.getId());
            
            return ResponseEntity.ok(saved);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de la création de l'entreprise: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur interne du serveur: " + e.getMessage());
        }
    }
}