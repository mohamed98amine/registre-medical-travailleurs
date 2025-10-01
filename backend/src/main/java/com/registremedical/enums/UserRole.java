package com.registremedical.enums;

public enum UserRole {
    EMPLOYEUR("Employeur"),
    MEDECIN("Médecin"),
    DIRECTEUR_REGIONAL("Directeur Régional"),
    CHEF_DE_ZONE("Chef de Zone Médicale"),
    ADMIN("Administrateur");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}