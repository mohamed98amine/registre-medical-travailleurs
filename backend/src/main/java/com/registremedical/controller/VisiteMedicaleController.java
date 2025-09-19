package com.registremedical.controller;

import com.registremedical.entity.VisiteMedicale;
import com.registremedical.repository.VisiteMedicaleRepository;
import com.registremedical.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize; // enable if method security configured
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
// @PreAuthorize("hasRole('EMPLOYEUR')")
public class VisiteMedicaleController {

    @Autowired
    private VisiteMedicaleRepository visiteMedicaleRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/visites-medicales")
    public ResponseEntity<?> getAllVisites() {
        final Long employeurId;
        try {
            employeurId = jwtUtils.getCurrentUserId();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Non authentifié: " + ex.getMessage());
        }
        List<VisiteMedicale> visites = visiteMedicaleRepository.findByEmployeurId(employeurId);
        return ResponseEntity.ok(visites);
    }
}