package com.registremedical.controller;

import com.registremedical.dto.DashboardStatsDTO;
import com.registremedical.entity.User;
import com.registremedical.repository.TravailleurRepository;
import com.registremedical.repository.VisiteMedicaleRepository;
import com.registremedical.service.UserService;
import com.registremedical.enums.StatutVisite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/employer")
@CrossOrigin(origins = "*")
public class EmployerDashboardController {

    @Autowired
    private UserService userService;

    @Autowired
    private TravailleurRepository travailleurRepository;

    @Autowired
    private VisiteMedicaleRepository visiteMedicaleRepository;

    @GetMapping("/overview")
    public ResponseEntity<Object> overview(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName()).orElse(null);
        if (currentUser == null || !"EMPLOYEUR".equals(currentUser.getRole().name())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        long totalTravailleurs = travailleurRepository.countByEntrepriseEmployeurId(currentUser.getId());
        long visitesProgrammees = visiteMedicaleRepository.countByEntrepriseEmployeurIdAndStatut(currentUser.getId(), StatutVisite.PLANIFIEE);
        long visitesTerminees = visiteMedicaleRepository.countByEntrepriseEmployeurIdAndStatut(currentUser.getId(), StatutVisite.TERMINEE);
        long visitesEnAttente = visitesProgrammees;

        Map<String, Object> payload = new HashMap<>();
        payload.put("travailleurs", totalTravailleurs);
        payload.put("visitesProgrammees", visitesProgrammees);
        payload.put("aptitudes", 0); // TODO: compute real count if available
        payload.put("inaptitudes", 0); // TODO: compute real count if available
        payload.put("visitesEnAttente", visitesEnAttente);
        payload.put("visitesARenouveler", 0); // TODO: compute real count if available

        return ResponseEntity.ok(payload);
    }

    @GetMapping("/visits/upcoming")
    public ResponseEntity<Object> upcoming(Authentication authentication) {
        User currentUser = userService.findByEmail(authentication.getName()).orElse(null);
        if (currentUser == null || !"EMPLOYEUR".equals(currentUser.getRole().name())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(visiteMedicaleRepository.findUpcomingByEmployeurId(currentUser.getId()));
    }
}
