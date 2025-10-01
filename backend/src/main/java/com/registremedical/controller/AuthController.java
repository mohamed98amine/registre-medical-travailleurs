package com.registremedical.controller;

import com.registremedical.dto.LoginRequest;
import com.registremedical.dto.LoginResponse;
import com.registremedical.dto.RegisterRequest;
import com.registremedical.entity.User;
import com.registremedical.service.AuthService;
import com.registremedical.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Créer l'utilisateur
            User user = authService.register(registerRequest);
            
            // Créer une LoginResponse avec token pour l'inscription
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(registerRequest.getEmail());
            loginRequest.setPassword(registerRequest.getPassword());
            
            LoginResponse loginResponse = authService.login(loginRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(loginResponse);
        } catch (Exception e) {
            // Log l'erreur pour le debug
            System.err.println("Erreur lors de l'inscription: " + e.getMessage());
            e.printStackTrace();
            
            // Retourner l'erreur avec le message
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        try {
            User user = userService.findByEmail(authentication.getName()).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            // Pour JWT, la déconnexion se fait côté client en supprimant le token
            // Côté serveur, on peut invalider le token si nécessaire
            return ResponseEntity.ok(java.util.Map.of("message", "Déconnexion réussie"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Erreur lors de la déconnexion"));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getAvailableRoles() {
        try {
            // Retourner tous les rôles disponibles
            java.util.List<java.util.Map<String, String>> roles = new java.util.ArrayList<>();
            for (com.registremedical.enums.UserRole role : com.registremedical.enums.UserRole.values()) {
                java.util.Map<String, String> roleInfo = new java.util.HashMap<>();
                roleInfo.put("value", role.name());
                roleInfo.put("label", role.getDescription());
                roles.add(roleInfo);
            }
            return ResponseEntity.ok(java.util.Map.of("roles", roles));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Map.of("error", "Erreur lors de la récupération des rôles"));
        }
    }
}
