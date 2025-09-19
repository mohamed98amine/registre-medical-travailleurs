package com.registremedical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entreprises")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Entreprise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String nom;

    @NotBlank
    @Size(max = 200)
    private String adresse;

    @NotBlank
    @Size(max = 50)
    private String ville;

    @NotBlank
    @Size(max = 10)
    private String codePostal;

    @NotBlank
    @Size(max = 20)
    private String telephone;

    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String siret;

    // Champs complémentaires pour supporter la structure du frontend
    @Size(max = 100)
    private String secteurActivite;

    private Integer effectif;

    @Size(max = 100)
    private String zoneAffectation;

    // Coordonnées GPS
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "adresse_complete")
    private String adresseComplete;

    @Column(name = "coordinates_verified")
    private Boolean coordinatesVerified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_medicale_id")
    @JsonIgnoreProperties({"entreprises", "hibernateLazyInitializer", "handler"})
    private ZoneMedicale zoneMedicale;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id", nullable = false)
    @JsonIgnoreProperties({"entreprises", "hibernateLazyInitializer", "handler"})
    private User employeur;

    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Travailleur> travailleurs = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructeurs
    public Entreprise() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Entreprise(String nom, String adresse, String ville, String codePostal, String telephone, String email, String siret, User employeur) {
        this();
        this.nom = nom;
        this.adresse = adresse;
        this.ville = ville;
        this.codePostal = codePostal;
        this.telephone = telephone;
        this.email = email;
        this.siret = siret;
        this.employeur = employeur;
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

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public void setCodePostal(String codePostal) {
        this.codePostal = codePostal;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSiret() {
        return siret;
    }

    public void setSiret(String siret) {
        this.siret = siret;
    }

    public String getSecteurActivite() {
        return secteurActivite;
    }

    public void setSecteurActivite(String secteurActivite) {
        this.secteurActivite = secteurActivite;
    }

    public Integer getEffectif() {
        return effectif;
    }

    public void setEffectif(Integer effectif) {
        this.effectif = effectif;
    }

    public String getZoneAffectation() {
        return zoneAffectation;
    }

    public void setZoneAffectation(String zoneAffectation) {
        this.zoneAffectation = zoneAffectation;
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

    public String getAdresseComplete() {
        return adresseComplete;
    }

    public void setAdresseComplete(String adresseComplete) {
        this.adresseComplete = adresseComplete;
    }

    public Boolean getCoordinatesVerified() {
        return coordinatesVerified;
    }

    public void setCoordinatesVerified(Boolean coordinatesVerified) {
        this.coordinatesVerified = coordinatesVerified;
    }

    public ZoneMedicale getZoneMedicale() {
        return zoneMedicale;
    }

    public void setZoneMedicale(ZoneMedicale zoneMedicale) {
        this.zoneMedicale = zoneMedicale;
    }

    public User getEmployeur() {
        return employeur;
    }

    public void setEmployeur(User employeur) {
        this.employeur = employeur;
    }

    public List<Travailleur> getTravailleurs() {
        return travailleurs;
    }

    public void setTravailleurs(List<Travailleur> travailleurs) {
        this.travailleurs = travailleurs;
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