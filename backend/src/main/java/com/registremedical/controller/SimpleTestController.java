package com.registremedical.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/simple-test")
@CrossOrigin(origins = "*")
public class SimpleTestController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "API fonctionne!");
        response.put("timestamp", new Date().toString());
        return response;
    }

    @PostMapping("/test-post")
    public Map<String, Object> testPost(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        response.put("received", data);
        response.put("status", "success");
        return response;
    }
}