package com.registremedical.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "visites")
public class Visite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String type;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false)
    private LocalTime heure;
    
    @Column(nullable = false)
    private String statut;
    
    private String aptitude;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id")
    private Employeur employeur;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    private Medecin medecin;
    
    // Constructeurs
    public Visite() {}
    
    public Visite(String type, LocalDate date, LocalTime heure, String statut, String aptitude, Employeur employeur, Medecin medecin) {
        this.type = type;
        this.date = date;
        this.heure = heure;
        this.statut = statut;
        this.aptitude = aptitude;
        this.employeur = employeur;
        this.medecin = medecin;
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public LocalTime getHeure() {
        return heure;
    }
    
    public void setHeure(LocalTime heure) {
        this.heure = heure;
    }
    
    public String getStatut() {
        return statut;
    }
    
    public void setStatut(String statut) {
        this.statut = statut;
    }
    
    public String getAptitude() {
        return aptitude;
    }
    
    public void setAptitude(String aptitude) {
        this.aptitude = aptitude;
    }
    
    public Employeur getEmployeur() {
        return employeur;
    }
    
    public void setEmployeur(Employeur employeur) {
        this.employeur = employeur;
    }
    
    public Medecin getMedecin() {
        return medecin;
    }
    
    public void setMedecin(Medecin medecin) {
        this.medecin = medecin;
    }
}