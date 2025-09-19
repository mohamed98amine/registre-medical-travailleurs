package com.registremedical.enums;

public enum StatutDemande {
    EN_ATTENTE("En attente"),
    ACCEPTEE("Acceptée"),
    REFUSEE("Refusée"),
    NOUVELLE_DATE_PROPOSEE("Nouvelle date proposée"),
    INFOS_DEMANDEES("Informations demandées"),
    TERMINEE("Terminée"),
    ANNULEE("Annulée");

    private final String libelle;

    StatutDemande(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
