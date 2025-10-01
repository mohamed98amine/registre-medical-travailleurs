package com.registremedical.controller;

import com.registremedical.entity.Medecin;
import com.registremedical.entity.Entreprise;
import com.registremedical.repository.MedecinRepository;
import com.registremedical.repository.EntrepriseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/test-data")
@CrossOrigin(origins = "*")
public class TestDataController {

    @Autowired
    private MedecinRepository medecinRepository;

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    @PostMapping("/create-sample-data")
    public ResponseEntity<?> createSampleData() {
        try {
            // Créer des médecins de test
            if (medecinRepository.count() == 0) {
                createSampleMedecins();
            }

            // Créer des entreprises de test
            if (entrepriseRepository.count() == 0) {
                createSampleEntreprises();
            }

            return ResponseEntity.ok(Map.of(
                "message", "Données de test créées",
                "medecins", medecinRepository.count(),
                "entreprises", entrepriseRepository.count()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur: " + e.getMessage());
        }
    }

    private void createSampleMedecins() {
        String[][] medecinsData = {
            {"OUEDRAOGO", "Dr. Jean", "jean.ouedraogo@medecin.bf", "+226 70 12 34 56", "Médecine du travail"},
            {"KABORE", "Dr. Marie", "marie.kabore@medecin.bf", "+226 70 23 45 67", "Médecine générale"},
            {"SAWADOGO", "Dr. Paul", "paul.sawadogo@medecin.bf", "+226 70 34 56 78", "Cardiologie"},
            {"TRAORE", "Dr. Fatou", "fatou.traore@medecin.bf", "+226 70 45 67 89", "Pneumologie"},
            {"ZONGO", "Dr. Ibrahim", "ibrahim.zongo@medecin.bf", "+226 70 56 78 90", "Médecine du travail"}
        };

        for (String[] data : medecinsData) {
            Medecin medecin = new Medecin();
            medecin.setNom(data[0]);
            medecin.setPrenom(data[1]);
            medecin.setEmail(data[2]);
            medecin.setTelephone(data[3]);
            medecin.setSpecialite(data[4]);
            medecin.setDisponible(true);
            medecin.setCreatedAt(LocalDateTime.now());
            medecin.setUpdatedAt(LocalDateTime.now());
            medecinRepository.save(medecin);
        }
    }

    private void createSampleEntreprises() {
        String[][] entreprisesData = {
            {"BURKINA TECH SARL", "123 Avenue Kwame Nkrumah", "Ouagadougou", "+226 25 12 34 56", "contact@burkinatech.bf", "Informatique", "50"},
            {"FASO MINING SA", "456 Rue de la Paix", "Ouagadougou", "+226 25 23 45 67", "info@fasomining.bf", "Mines", "120"},
            {"SAHEL CONSTRUCTION", "789 Boulevard Charles de Gaulle", "Bobo-Dioulasso", "+226 20 34 56 78", "contact@sahelconstruction.bf", "Construction", "80"},
            {"BURKINA AGRO SARL", "321 Avenue de la Nation", "Koudougou", "+226 25 45 67 89", "info@burkinaagro.bf", "Agriculture", "35"},
            {"FASO TELECOM SA", "654 Rue de l'Indépendance", "Ouagadougou", "+226 25 56 78 90", "contact@fasotelecom.bf", "Télécommunications", "200"}
        };

        for (String[] data : entreprisesData) {
            Entreprise entreprise = new Entreprise();
            entreprise.setNom(data[0]);
            entreprise.setAdresse(data[1]);
            entreprise.setVille(data[2]);
            entreprise.setTelephone(data[3]);
            entreprise.setEmail(data[4]);
            entreprise.setSecteurActivite(data[5]);
            entreprise.setEffectif(Integer.parseInt(data[6]));
            entreprise.setCodePostal("01 BP");
            entreprise.setCreatedAt(LocalDateTime.now());
            entreprise.setUpdatedAt(LocalDateTime.now());
            entrepriseRepository.save(entreprise);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getDataCount() {
        return ResponseEntity.ok(Map.of(
            "medecins", medecinRepository.count(),
            "entreprises", entrepriseRepository.count()
        ));
    }
}