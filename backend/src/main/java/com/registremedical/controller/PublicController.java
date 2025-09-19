package com.registremedical.controller;

import com.registremedical.entity.User;
import com.registremedical.enums.SpecialiteMedicale;
import com.registremedical.enums.UserRole;
import com.registremedical.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private UserRepository userRepository;

    // Obtenir les médecins par spécialité (endpoint public)
    @GetMapping("/medecins/specialite/{specialite}")
    public ResponseEntity<?> getMedecinsBySpecialite(@PathVariable String specialite) {
        try {
            SpecialiteMedicale specialiteEnum = SpecialiteMedicale.valueOf(specialite);
            List<User> medecins = userRepository.findByRoleAndSpecialite(UserRole.MEDECIN, specialiteEnum);
            return ResponseEntity.ok(medecins);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erreur lors de la récupération des médecins: " + ex.getMessage());
        }
    }

    // Obtenir toutes les spécialités disponibles
    @GetMapping("/specialites")
    public ResponseEntity<?> getSpecialites() {
        try {
            SpecialiteMedicale[] specialites = SpecialiteMedicale.values();
            return ResponseEntity.ok(specialites);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des spécialités: " + ex.getMessage());
        }
    }
}
