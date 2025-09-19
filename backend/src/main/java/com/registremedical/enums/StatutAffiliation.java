package com.registremedical.enums;

public enum StatutAffiliation {
    NOUVELLE("Nouvelle"),
    EN_COURS("En cours"),
    VALIDEE("Validée"),
    REJETEE("Rejetée");

    private final String description;

    StatutAffiliation(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
