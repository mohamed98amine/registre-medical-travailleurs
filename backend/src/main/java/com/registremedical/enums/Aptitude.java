package com.registremedical.enums;

public enum Aptitude {
    APTE("Apte"),
    INAPTE("Inapte"),
    APTE_AVEC_RESTRICTIONS("Apte avec restrictions");

    private final String description;

    Aptitude(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}