package com.registremedical.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate;

    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }

    // Service de géocodage gratuit (Nominatim OpenStreetMap)
    public Map<String, Double> getCoordinatesFromAddress(String address, String city, String country) {
        try {
            String fullAddress = String.format("%s, %s, %s", address, city, country.equals("Morocco") ? "Burkina Faso" : country);
            
            String url = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", fullAddress)
                    .queryParam("format", "json")
                    .queryParam("limit", "1")
                    .queryParam("addressdetails", "1")
                    .build()
                    .toUriString();

            // Ajouter un User-Agent pour respecter les conditions d'utilisation
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "RegistreMedicalApp/1.0");
            
            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
            
            List<Map<String, Object>> response = restTemplate.exchange(
                    url, 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    List.class
            ).getBody();

            if (response != null && !response.isEmpty()) {
                Map<String, Object> location = response.get(0);
                Double lat = Double.parseDouble(location.get("lat").toString());
                Double lon = Double.parseDouble(location.get("lon").toString());

                Map<String, Double> coordinates = new HashMap<>();
                coordinates.put("latitude", lat);
                coordinates.put("longitude", lon);
                return coordinates;
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du géocodage: " + e.getMessage());
            // En cas d'erreur, retourner des coordonnées par défaut (Centre du Maroc)
            return getDefaultMoroccoCoordinates(city);
        }
        
        return getDefaultMoroccoCoordinates(city);
    }

    // Coordonnées par défaut pour les principales villes du Burkina Faso
    private Map<String, Double> getDefaultMoroccoCoordinates(String city) {
        Map<String, Double> coordinates = new HashMap<>();
        
        if (city == null) {
            // Coordonnées par défaut - Ouagadougou
            coordinates.put("latitude", 12.3714);
            coordinates.put("longitude", -1.5197);
            return coordinates;
        }

        String cityLower = city.toLowerCase();
        
        switch (cityLower) {
            case "ouagadougou":
                coordinates.put("latitude", 12.3714);
                coordinates.put("longitude", -1.5197);
                break;
            case "bobo-dioulasso":
            case "bobo dioulasso":
                coordinates.put("latitude", 11.1781);
                coordinates.put("longitude", -4.2970);
                break;
            case "koudougou":
                coordinates.put("latitude", 12.2530);
                coordinates.put("longitude", -2.3617);
                break;
            case "banfora":
                coordinates.put("latitude", 10.6344);
                coordinates.put("longitude", -4.7614);
                break;
            case "ouahigouya":
                coordinates.put("latitude", 13.5822);
                coordinates.put("longitude", -2.4167);
                break;
            case "pouytenga":
                coordinates.put("latitude", 12.3167);
                coordinates.put("longitude", -0.3167);
                break;
            case "kaya":
                coordinates.put("latitude", 13.0833);
                coordinates.put("longitude", -1.0833);
                break;
            case "tenkodogo":
                coordinates.put("latitude", 11.7833);
                coordinates.put("longitude", -0.3667);
                break;
            case "fada n'gourma":
            case "fada ngourma":
                coordinates.put("latitude", 12.0617);
                coordinates.put("longitude", 0.3581);
                break;
            case "gaoua":
                coordinates.put("latitude", 10.3333);
                coordinates.put("longitude", -3.1833);
                break;
            case "dédougou":
            case "dedougou":
                coordinates.put("latitude", 12.4667);
                coordinates.put("longitude", -3.4833);
                break;
            case "léo":
            case "leo":
                coordinates.put("latitude", 11.1000);
                coordinates.put("longitude", -2.1056);
                break;
            case "dori":
                coordinates.put("latitude", 14.0167);
                coordinates.put("longitude", -0.0333);
                break;
            case "kongoussi":
                coordinates.put("latitude", 13.3167);
                coordinates.put("longitude", -1.5333);
                break;
            case "réo":
            case "reo":
                coordinates.put("latitude", 12.3167);
                coordinates.put("longitude", -2.4667);
                break;
            default:
                // Coordonnées par défaut - Centre du Burkina Faso (Ouagadougou)
                coordinates.put("latitude", 12.3714);
                coordinates.put("longitude", -1.5197);
                break;
        }
        
        return coordinates;
    }

    // Calculer la distance entre deux points GPS (formule de Haversine)
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Rayon de la Terre en km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance en km
    }

    // Vérifier si un point est dans un rayon donné
    public boolean isWithinRadius(double centerLat, double centerLon, double pointLat, double pointLon, double radiusKm) {
        double distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
        return distance <= radiusKm;
    }
}
