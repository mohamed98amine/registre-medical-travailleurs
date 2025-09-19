package com.registremedical.enums;

public enum StatutVisite {
    PLANIFIEE("Planifiée"),
    EN_COURS("En cours"),
    TERMINEE("Terminée"),
    ANNULEE("Annulée");

    private final String description;

    StatutVisite(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}