package com.registremedical.controller;

import com.registremedical.entity.User;
import com.registremedical.enums.UserRole;
import com.registremedical.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers(@RequestParam(required = false) String role) {
        if (role != null) {
            try {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                return userService.findByRole(userRole);
            } catch (IllegalArgumentException e) {
                return userService.findAll();
            }
        }
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findByEmail(email);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            User updatedUser = userService.updateUser(id, updates);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().body("Utilisateur supprimé avec succès");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la suppression: " + e.getMessage());
        }
    }

    @GetMapping("/active")
    public List<User> getActiveUsers() {
        return userService.findActiveUsers();
    }

    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable String role) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return userService.findByRole(userRole);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    @PostMapping("/employeurs")
    public ResponseEntity<?> createEmployer(@RequestBody Map<String, Object> data) {
        try {
            String nom = (String) data.get("nom");
            String prenom = (String) data.get("prenom");
            String email = (String) data.get("email");
            String telephone = (String) data.get("telephone");
            String password = (String) data.get("password");

            if (nom == null || email == null || password == null) {
                return ResponseEntity.badRequest().body("Les champs nom, email et password sont requis");
            }

            // Créer l'utilisateur avec le rôle EMPLOYEUR
            User user = new User();
            user.setEmail(email);
            user.setPassword(password);
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setTelephone(telephone);
            user.setRole(UserRole.EMPLOYEUR);
            user.setActive(true);

            User savedUser = userService.save(user);

            // Retourner l'utilisateur créé (sans le mot de passe)
            savedUser.setPassword(null);

            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            System.err.println("Erreur lors de la création employeur: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/employeurs-with-entreprises")
    public ResponseEntity<?> getEmployeursWithEntreprises() {
        try {
            List<User> employeurs = userService.findByRole(UserRole.EMPLOYEUR);

            // Créer une liste d'objets avec les informations d'entreprise
            List<Map<String, Object>> result = new java.util.ArrayList<>();

            for (User employeur : employeurs) {
                if (employeur.getActive()) {
                    Map<String, Object> employeurData = new java.util.HashMap<>();
                    employeurData.put("id", employeur.getId());
                    employeurData.put("nom", employeur.getNom());
                    employeurData.put("prenom", employeur.getPrenom());
                    employeurData.put("email", employeur.getEmail());
                    employeurData.put("telephone", employeur.getTelephone());
                    employeurData.put("role", employeur.getRole());
                    employeurData.put("active", employeur.getActive());
                    employeurData.put("createdAt", employeur.getCreatedAt());
                    employeurData.put("updatedAt", employeur.getUpdatedAt());

                    // Pour l'instant, on ne peut pas récupérer l'entreprise depuis User
                    // car la relation est dans l'autre sens (Entreprise -> User)
                    // On retourne null pour entreprise pour éviter l'erreur
                    employeurData.put("entreprise", null);

                    result.add(employeurData);
                }
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des employeurs avec entreprises: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
}