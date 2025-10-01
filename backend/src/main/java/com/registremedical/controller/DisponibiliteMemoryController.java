package com.registremedical.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

// @RestController
// @RequestMapping("/api")
// @CrossOrigin(origins = "*")
public class DisponibiliteMemoryController {

    private static final Map<Long, Map<String, Object>> disponibilites = new ConcurrentHashMap<>();
    private static final Map<Long, Map<String, Object>> indisponibilites = new ConcurrentHashMap<>();
    private static final AtomicLong idCounter = new AtomicLong(1);

    @PostMapping("/add-creneau")
    public ResponseEntity<?> addCreneau(@RequestBody Map<String, Object> data) {
        try {
            Long id = idCounter.getAndIncrement();
            Map<String, Object> creneau = new HashMap<>();
            creneau.put("id", id);
            creneau.put("jour", data.get("jourSemaine"));
            creneau.put("debut", data.get("heureDebut"));
            creneau.put("fin", data.get("heureFin"));
            
            disponibilites.put(id, creneau);
            
            System.out.println("Créneau ajouté: " + creneau);
            System.out.println("Total créneaux: " + disponibilites.size());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Créneau ajouté");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/add-indispo")
    public ResponseEntity<?> addIndispo(@RequestBody Map<String, Object> data) {
        try {
            Long id = idCounter.getAndIncrement();
            Map<String, Object> indispo = new HashMap<>();
            indispo.put("id", id);
            indispo.put("date_debut", data.get("dateDebut"));
            indispo.put("date_fin", data.get("dateFin"));
            indispo.put("motif", data.get("motif"));
            
            indisponibilites.put(id, indispo);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Indisponibilité ajoutée");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/get-creneaux/{userId}")
    public ResponseEntity<?> getCreneaux(@PathVariable Long userId) {
        try {
            List<Map<String, Object>> dispoList = new ArrayList<>(disponibilites.values());
            List<Map<String, Object>> indispoList = new ArrayList<>(indisponibilites.values());
            
            System.out.println("Récupération - Disponibilités: " + dispoList.size());
            System.out.println("Récupération - Indisponibilités: " + indispoList.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("disponibilites", dispoList);
            result.put("indisponibilites", indispoList);
            
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/simple-test")
    public ResponseEntity<?> simpleTest() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "API fonctionne");
        result.put("disponibilites_count", disponibilites.size());
        result.put("indisponibilites_count", indisponibilites.size());
        result.put("timestamp", new Date());
        return ResponseEntity.ok(result);
    }
}