package com.registremedical.controller;

import com.registremedical.entity.Employeur;
import com.registremedical.repository.EmployeurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/employeurs")
@CrossOrigin(origins = "*")
public class EmployeurControllerSimple {

    @Autowired
    private EmployeurRepository employeurRepository;

    @GetMapping
    public ResponseEntity<?> getAllEmployeurs() {
        System.out.println("=== GET /api/employeurs appelé ===");
        try {
            List<Employeur> employeurs = employeurRepository.findAll();
            
            System.out.println("Nombre d'employeurs trouvés: " + employeurs.size());
            
            return ResponseEntity.ok()
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(employeurs);
                
        } catch (Exception e) {
            System.err.println("Erreur lors du chargement des employeurs: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createEmployeur(@RequestBody Map<String, Object> data) {
        System.out.println("=== POST /api/employeurs appelé ===");
        System.out.println("Données reçues: " + data);
        
        try {
            // Validation des données
            String nom = (String) data.get("nom");
            String email = (String) data.get("email");
            String telephone = (String) data.get("telephone");
            String statut = (String) data.getOrDefault("statut", "Actif");
            
            if (nom == null || nom.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Le nom est obligatoire");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Vérifier si l'email existe déjà (si fourni)
            if (email != null && !email.trim().isEmpty() && employeurRepository.existsByEmail(email)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Un employeur avec cet email existe déjà");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Créer l'employeur
            Employeur employeur = new Employeur(nom.trim(), email, telephone, statut);
            Employeur employeurCree = employeurRepository.save(employeur);
            
            System.out.println("Employeur créé avec succès: " + employeurCree);
            
            return ResponseEntity.ok(employeurCree);
            
        } catch (Exception e) {
            System.err.println("Erreur lors de la création de l'employeur: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}