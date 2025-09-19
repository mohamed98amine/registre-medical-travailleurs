package com.registremedical.enums;

public enum TypeVisite {
    VMA("Visite Médicale d'Embauche"),
    EMBANCHE("Visite d'Embauche"),
    REPRISE("Visite de Reprise"),
    FIN_CONTRAT("Visite de Fin de Contrat");

    private final String description;

    TypeVisite(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}