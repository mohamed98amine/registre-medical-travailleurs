package com.registremedical.dto;

import java.time.LocalDate;

public class WorkerCompactDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String poste;
    private LocalDate derniereVisite;
    private String aptitude;

    public WorkerCompactDTO() {
        // Constructeur par défaut nécessaire pour JPA
    }

    public WorkerCompactDTO(Long id, String nom, String prenom, String poste, LocalDate derniereVisite, String aptitude) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.poste = poste;
        this.derniereVisite = derniereVisite;
        this.aptitude = aptitude;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getPoste() { return poste; }
    public void setPoste(String poste) { this.poste = poste; }

    public LocalDate getDerniereVisite() { return derniereVisite; }
    public void setDerniereVisite(LocalDate derniereVisite) { this.derniereVisite = derniereVisite; }

    public String getAptitude() { return aptitude; }
    public void setAptitude(String aptitude) { this.aptitude = aptitude; }
}