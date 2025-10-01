package com.registremedical.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class TestController {

    @PostMapping("/api/test-post")
    public Map<String, Object> testPost(@RequestBody Map<String, Object> data) {
        System.out.println("=== TEST POST RECU ===");
        System.out.println("Data: " + data);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test réussi!");
        response.put("received", data);
        return response;
    }
    
    @GetMapping("/api/test-get")
    public String testGet() {
        System.out.println("=== TEST GET RECU ===");
        return "Test GET fonctionne!";
    }
}