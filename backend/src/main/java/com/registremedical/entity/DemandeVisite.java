package com.registremedical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.registremedical.enums.SpecialiteMedicale;
import com.registremedical.enums.StatutDemande;
import com.registremedical.enums.TypeVisite;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "demandes_visite")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DemandeVisite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employeur_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User employeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User medecin;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TypeVisite typeVisite;

    @NotNull
    @Enumerated(EnumType.STRING)
    private SpecialiteMedicale specialite;

    @NotNull
    private LocalDate dateSouhaitee;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String motif;

    @NotNull
    @Enumerated(EnumType.STRING)
    private StatutDemande statut;

    @Column(columnDefinition = "TEXT")
    private String commentaires;

    @Column(name = "nouvelle_date_proposee")
    private LocalDate nouvelleDateProposee;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "demande_travailleurs",
        joinColumns = @JoinColumn(name = "demande_id"),
        inverseJoinColumns = @JoinColumn(name = "travailleur_id")
    )
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<Travailleur> travailleurs;

    // Constructeurs
    public DemandeVisite() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.statut = StatutDemande.EN_ATTENTE;
    }

    public DemandeVisite(User employeur, TypeVisite typeVisite, SpecialiteMedicale specialite, 
                        LocalDate dateSouhaitee, String motif, List<Travailleur> travailleurs) {
        this();
        this.employeur = employeur;
        this.typeVisite = typeVisite;
        this.specialite = specialite;
        this.dateSouhaitee = dateSouhaitee;
        this.motif = motif;
        this.travailleurs = travailleurs;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getEmployeur() {
        return employeur;
    }

    public void setEmployeur(User employeur) {
        this.employeur = employeur;
    }

    public User getMedecin() {
        return medecin;
    }

    public void setMedecin(User medecin) {
        this.medecin = medecin;
    }

    public TypeVisite getTypeVisite() {
        return typeVisite;
    }

    public void setTypeVisite(TypeVisite typeVisite) {
        this.typeVisite = typeVisite;
    }

    public SpecialiteMedicale getSpecialite() {
        return specialite;
    }

    public void setSpecialite(SpecialiteMedicale specialite) {
        this.specialite = specialite;
    }

    public LocalDate getDateSouhaitee() {
        return dateSouhaitee;
    }

    public void setDateSouhaitee(LocalDate dateSouhaitee) {
        this.dateSouhaitee = dateSouhaitee;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public StatutDemande getStatut() {
        return statut;
    }

    public void setStatut(StatutDemande statut) {
        this.statut = statut;
    }

    public String getCommentaires() {
        return commentaires;
    }

    public void setCommentaires(String commentaires) {
        this.commentaires = commentaires;
    }

    public LocalDate getNouvelleDateProposee() {
        return nouvelleDateProposee;
    }

    public void setNouvelleDateProposee(LocalDate nouvelleDateProposee) {
        this.nouvelleDateProposee = nouvelleDateProposee;
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

    public List<Travailleur> getTravailleurs() {
        return travailleurs;
    }

    public void setTravailleurs(List<Travailleur> travailleurs) {
        this.travailleurs = travailleurs;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
