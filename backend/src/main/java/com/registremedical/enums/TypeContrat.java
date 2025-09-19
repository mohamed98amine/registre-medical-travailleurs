package com.registremedical.enums;

public enum TypeContrat {
    STANDARD("Contrat Standard", 15000),
    INDUSTRIE_PETROLIERE("Contrat Industrie Pétrolière", 45000),
    CONSTRUCTION("Contrat Construction", 35000),
    COMMERCE("Contrat Commerce", 20000),
    SPECIAL("Contrat Spécial", 0); // Tarif négocié

    private final String description;
    private final double tarifParEmploye;

    TypeContrat(String description, double tarifParEmploye) {
        this.description = description;
        this.tarifParEmploye = tarifParEmploye;
    }

    public String getDescription() {
        return description;
    }

    public double getTarifParEmploye() {
        return tarifParEmploye;
    }
}
