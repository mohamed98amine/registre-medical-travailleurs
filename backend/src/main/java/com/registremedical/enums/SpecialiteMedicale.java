package com.registremedical.enums;

public enum SpecialiteMedicale {
    GENERALISTE("Médecine générale"),
    CARDIOLOGUE("Cardiologie"),
    OPHTHALMOLOGUE("Ophtalmologie"),
    DERMATOLOGUE("Dermatologie"),
    ORTHOPEDISTE("Orthopédie"),
    NEUROLOGUE("Neurologie"),
    PSYCHIATRE("Psychiatrie"),
    PNEUMOLOGUE("Pneumologie"),
    GASTROENTEROLOGUE("Gastro-entérologie"),
    UROLOGUE("Urologie"),
    GYNECOLOGUE("Gynécologie"),
    PEDIATRE("Pédiatrie"),
    RADIOLOGUE("Radiologie"),
    ANESTHESISTE("Anesthésie"),
    CHIRURGIEN("Chirurgie");

    private final String libelle;

    SpecialiteMedicale(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
