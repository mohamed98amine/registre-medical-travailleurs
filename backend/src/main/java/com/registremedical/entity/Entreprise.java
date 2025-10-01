package com.registremedical.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "entreprises")
public class Entreprise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String adresse;
    private String ville;
    private String codePostal;
    private String telephone;
    private String email;
    private String secteurActivite;
    private Integer effectif;
    private String statut = "ACTIVE";
    private Double latitude;
    private Double longitude;
    private String adresseComplete;
    private Boolean coordinatesVerified;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id", nullable = true)
    private User employeur;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_medicale_id", nullable = true)
    private ZoneMedicale zoneMedicale;
    
    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
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

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getCodePostal() { return codePostal; }
    public void setCodePostal(String codePostal) { this.codePostal = codePostal; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSecteurActivite() { return secteurActivite; }
    public void setSecteurActivite(String secteurActivite) { this.secteurActivite = secteurActivite; }

    public Integer getEffectif() { return effectif; }
    public void setEffectif(Integer effectif) { this.effectif = effectif; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public String getAdresseComplete() { return adresseComplete; }
    public void setAdresseComplete(String adresseComplete) { this.adresseComplete = adresseComplete; }
    
    public Boolean getCoordinatesVerified() { return coordinatesVerified; }
    public void setCoordinatesVerified(Boolean coordinatesVerified) { this.coordinatesVerified = coordinatesVerified; }
    
    public User getEmployeur() { return employeur; }
    public void setEmployeur(User employeur) { this.employeur = employeur; }
    
    public ZoneMedicale getZoneMedicale() { return zoneMedicale; }
    public void setZoneMedicale(ZoneMedicale zoneMedicale) { this.zoneMedicale = zoneMedicale; }
    
    public List<Travailleur> getTravailleurs() { return travailleurs; }
    public void setTravailleurs(List<Travailleur> travailleurs) { this.travailleurs = travailleurs; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}