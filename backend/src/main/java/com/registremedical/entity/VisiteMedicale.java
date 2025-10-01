package com.registremedical.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.registremedical.enums.TypeVisite;
import com.registremedical.enums.StatutVisite;
import com.registremedical.enums.Aptitude;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "visites_medicales")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VisiteMedicale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type_visite", nullable = false)
    private TypeVisite typeVisite;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travailleur_id", nullable = false)
    @JsonBackReference
    private Travailleur travailleur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    @JsonIgnoreProperties({"visitesMedicales", "hibernateLazyInitializer", "handler"})
    private Medecin medecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id")
    @JsonIgnoreProperties({"visitesMedicales", "hibernateLazyInitializer", "handler"})
    private Employeur employeur;

    @NotNull
    @Column(name = "date_visite", nullable = false)
    private LocalDateTime dateVisite;

    @Size(max = 500)
    private String observations;

    @Enumerated(EnumType.STRING)
    private Aptitude aptitude;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutVisite statut;

    @Size(max = 500)
    private String commentaires;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructeurs
    public VisiteMedicale() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public VisiteMedicale(TypeVisite typeVisite, Travailleur travailleur, Medecin medecin, 
                         LocalDateTime dateVisite, String observations, Aptitude aptitude, 
                         StatutVisite statut, String commentaires) {
        this();
        this.typeVisite = typeVisite;
        this.travailleur = travailleur;
        this.medecin = medecin;
        this.dateVisite = dateVisite;
        this.observations = observations;
        this.aptitude = aptitude;
        this.statut = statut;
        this.commentaires = commentaires;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TypeVisite getTypeVisite() {
        return typeVisite;
    }

    public void setTypeVisite(TypeVisite typeVisite) {
        this.typeVisite = typeVisite;
    }

    public Travailleur getTravailleur() {
        return travailleur;
    }

    public void setTravailleur(Travailleur travailleur) {
        this.travailleur = travailleur;
    }

    public Medecin getMedecin() {
        return medecin;
    }

    public void setMedecin(Medecin medecin) {
        this.medecin = medecin;
    }

    public Employeur getEmployeur() {
        return employeur;
    }

    public void setEmployeur(Employeur employeur) {
        this.employeur = employeur;
    }

    public LocalDateTime getDateVisite() {
        return dateVisite;
    }

    public void setDateVisite(LocalDateTime dateVisite) {
        this.dateVisite = dateVisite;
    }

    public String getObservations() {
        return observations;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

    public Aptitude getAptitude() {
        return aptitude;
    }

    public void setAptitude(Aptitude aptitude) {
        this.aptitude = aptitude;
    }

    public StatutVisite getStatut() {
        return statut;
    }

    public void setStatut(StatutVisite statut) {
        this.statut = statut;
    }

    public String getCommentaires() {
        return commentaires;
    }

    public void setCommentaires(String commentaires) {
        this.commentaires = commentaires;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}