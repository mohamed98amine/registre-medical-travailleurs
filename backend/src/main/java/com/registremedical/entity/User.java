package com.registremedical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.registremedical.enums.UserRole;
import com.registremedical.enums.SpecialiteMedicale;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(unique = true)
    private String email;

    @NotBlank
    @Size(max = 100)
    private String password;

    @NotBlank
    @Size(max = 50)
    private String nom;

    @Size(max = 50)
    private String prenom;

    @Size(max = 20)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    private SpecialiteMedicale specialite;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    // Relations temporairement commentées pour éviter les erreurs de sérialisation
    // @OneToMany(mappedBy = "employeur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @JsonIgnoreProperties({"employeur", "hibernateLazyInitializer", "handler"})
    // private List<Entreprise> entreprises;

    // @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @JsonIgnoreProperties({"medecin", "hibernateLazyInitializer", "handler"})
    // private List<VisiteMedicale> visitesMedicales;

    // Constructeurs
    public User() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public User(String email, String password, String nom, String prenom, String telephone, UserRole role) {
        this();
        this.email = email;
        this.password = password;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.role = role;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public SpecialiteMedicale getSpecialite() {
        return specialite;
    }

    public void setSpecialite(SpecialiteMedicale specialite) {
        this.specialite = specialite;
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

    // Getters et setters pour les relations temporairement commentés
    // public List<Entreprise> getEntreprises() {
    //     return entreprises;
    // }

    // public void setEntreprises(List<Entreprise> entreprises) {
    //     this.entreprises = entreprises;
    // }

    // public List<VisiteMedicale> getVisitesMedicales() {
    //     return visitesMedicales;
    // }

    // public void setVisitesMedicales(List<VisiteMedicale> visitesMedicales) {
    //     this.visitesMedicales = visitesMedicales;
    // }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
