package com.registremedical.entity;

import com.registremedical.enums.StatutAffiliation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "demandes_affiliation")
public class DemandeAffiliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La raison sociale est requise")
    @Size(max = 255, message = "La raison sociale ne peut pas dépasser 255 caractères")
    @Column(name = "raison_sociale")
    private String raisonSociale;

    @NotBlank(message = "Le numéro RCCM est requis")
    @Column(name = "numero_rccm")
    private String numeroRccm;

    @NotBlank(message = "Le secteur d'activité est requis")
    @Column(name = "secteur_activite")
    private String secteurActivite;

    @NotNull(message = "L'effectif est requis")
    @Column(name = "effectif")
    private Integer effectif;

    @NotBlank(message = "L'adresse est requise")
    @Column(name = "adresse", columnDefinition = "TEXT")
    private String adresse;

    @NotBlank(message = "Le nom du représentant légal est requis")
    @Column(name = "representant_legal")
    private String representantLegal;

    @NotBlank(message = "L'email est requis")
    @Email(message = "L'email doit être valide")
    @Column(name = "email")
    private String email;

    @NotBlank(message = "Le téléphone est requis")
    @Column(name = "telephone")
    private String telephone;

    @NotBlank(message = "Le nom du contact DRH est requis")
    @Column(name = "contact_drh")
    private String contactDrh;

    @Column(name = "chiffre_affaire_annuel")
    private Double chiffreAffaireAnnuel;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutAffiliation statut = StatutAffiliation.NOUVELLE;

    @Column(name = "motif_rejet")
    private String motifRejet;

    @Column(name = "commentaires", columnDefinition = "TEXT")
    private String commentaires;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employeur_id", nullable = false)
    private User employeur;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "directeur_regional_id", nullable = true)
    private User directeurRegional;

    @OneToMany(mappedBy = "demandeAffiliation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Contrat> contrats = new ArrayList<>();

    // Constructeurs
    public DemandeAffiliation() {}

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRaisonSociale() {
        return raisonSociale;
    }

    public void setRaisonSociale(String raisonSociale) {
        this.raisonSociale = raisonSociale;
    }

    public String getNumeroRccm() {
        return numeroRccm;
    }

    public void setNumeroRccm(String numeroRccm) {
        this.numeroRccm = numeroRccm;
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

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getRepresentantLegal() {
        return representantLegal;
    }

    public void setRepresentantLegal(String representantLegal) {
        this.representantLegal = representantLegal;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getContactDrh() {
        return contactDrh;
    }

    public void setContactDrh(String contactDrh) {
        this.contactDrh = contactDrh;
    }

    public Double getChiffreAffaireAnnuel() {
        return chiffreAffaireAnnuel;
    }

    public void setChiffreAffaireAnnuel(Double chiffreAffaireAnnuel) {
        this.chiffreAffaireAnnuel = chiffreAffaireAnnuel;
    }

    public StatutAffiliation getStatut() {
        return statut;
    }

    public void setStatut(StatutAffiliation statut) {
        this.statut = statut;
    }

    public String getMotifRejet() {
        return motifRejet;
    }

    public void setMotifRejet(String motifRejet) {
        this.motifRejet = motifRejet;
    }

    public String getCommentaires() {
        return commentaires;
    }

    public void setCommentaires(String commentaires) {
        this.commentaires = commentaires;
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

    public User getEmployeur() {
        return employeur;
    }

    public void setEmployeur(User employeur) {
        this.employeur = employeur;
    }

    public List<Contrat> getContrats() {
        return contrats;
    }

    public void setContrats(List<Contrat> contrats) {
        this.contrats = contrats;
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
