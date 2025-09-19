package com.registremedical.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "zones_medicales")
public class ZoneMedicale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom de la zone est requis")
    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "description")
    private String description;

    @NotNull(message = "La latitude est requise")
    @DecimalMin(value = "-90.0", message = "La latitude doit être entre -90 et 90")
    @DecimalMax(value = "90.0", message = "La latitude doit être entre -90 et 90")
    @Column(name = "latitude")
    private Double latitude;

    @NotNull(message = "La longitude est requise")
    @DecimalMin(value = "-180.0", message = "La longitude doit être entre -180 et 180")
    @DecimalMax(value = "180.0", message = "La longitude doit être entre -180 et 180")
    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "rayon_km")
    private Double rayonKm = 50.0; // Rayon par défaut de 50 km

    @Column(name = "couleur_carte")
    private String couleurCarte = "#3B82F6"; // Bleu par défaut

    @Column(name = "capacite_max")
    private Integer capaciteMax;

    @Column(name = "nombre_entreprises_actuelles")
    private Integer nombreEntreprisesActuelles = 0;

    @Column(name = "region")
    private String region;

    @Column(name = "actif")
    private Boolean actif = true;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "directeur_regional_id")
    private User directeurRegional;

    @OneToMany(mappedBy = "zoneMedicale", cascade = CascadeType.ALL)
    private List<Entreprise> entreprises;

    // Constructeurs
    public ZoneMedicale() {}

    public ZoneMedicale(String nom, Double latitude, Double longitude) {
        this.nom = nom;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Méthode pour calculer la distance avec une entreprise
    public double calculerDistance(Double latEntreprise, Double longEntreprise) {
        if (latEntreprise == null || longEntreprise == null) {
            return Double.MAX_VALUE;
        }
        
        final int R = 6371; // Rayon de la Terre en km
        
        double latDistance = Math.toRadians(latEntreprise - this.latitude);
        double lonDistance = Math.toRadians(longEntreprise - this.longitude);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(this.latitude)) * Math.cos(Math.toRadians(latEntreprise))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance en km
    }

    // Vérifier si une entreprise est dans la zone
    public boolean contientEntreprise(Double latEntreprise, Double longEntreprise) {
        return calculerDistance(latEntreprise, longEntreprise) <= this.rayonKm;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getRayonKm() {
        return rayonKm;
    }

    public void setRayonKm(Double rayonKm) {
        this.rayonKm = rayonKm;
    }

    public String getCouleurCarte() {
        return couleurCarte;
    }

    public void setCouleurCarte(String couleurCarte) {
        this.couleurCarte = couleurCarte;
    }

    public Integer getCapaciteMax() {
        return capaciteMax;
    }

    public void setCapaciteMax(Integer capaciteMax) {
        this.capaciteMax = capaciteMax;
    }

    public Integer getNombreEntreprisesActuelles() {
        return nombreEntreprisesActuelles;
    }

    public void setNombreEntreprisesActuelles(Integer nombreEntreprisesActuelles) {
        this.nombreEntreprisesActuelles = nombreEntreprisesActuelles;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateModification() {
        return dateModification;
    }

    public void setDateModification(LocalDateTime dateModification) {
        this.dateModification = dateModification;
    }

    public User getDirecteurRegional() {
        return directeurRegional;
    }

    public void setDirecteurRegional(User directeurRegional) {
        this.directeurRegional = directeurRegional;
    }

    public List<Entreprise> getEntreprises() {
        return entreprises;
    }

    public void setEntreprises(List<Entreprise> entreprises) {
        this.entreprises = entreprises;
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
