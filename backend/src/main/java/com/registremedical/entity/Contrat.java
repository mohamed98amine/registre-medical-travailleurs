package com.registremedical.entity;

import com.registremedical.enums.TypeContrat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contrats")
public class Contrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le numéro de contrat est requis")
    @Column(name = "numero_contrat", unique = true)
    private String numeroContrat;

    @NotNull(message = "La date de signature est requise")
    @Column(name = "date_signature")
    private LocalDate dateSignature;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_contrat")
    private TypeContrat typeContrat;

    @Column(name = "tarif_annuel")
    private Double tarifAnnuel;

    @Column(name = "tarif_mensuel")
    private Double tarifMensuel;

    @Column(name = "zone_medicale")
    private String zoneMedicale;

    @Column(name = "region")
    private String region;

    @Column(name = "version")
    private Integer version = 1;

    @Column(name = "actif")
    private Boolean actif = true;

    @Column(name = "motif_amendement")
    private String motifAmendement;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "demande_affiliation_id")
    private DemandeAffiliation demandeAffiliation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "directeur_regional_id")
    private User directeurRegional;

    @OneToMany(mappedBy = "contrat", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AmendementContrat> amendements = new ArrayList<>();

    // Constructeurs
    public Contrat() {}

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroContrat() {
        return numeroContrat;
    }

    public void setNumeroContrat(String numeroContrat) {
        this.numeroContrat = numeroContrat;
    }

    public LocalDate getDateSignature() {
        return dateSignature;
    }

    public void setDateSignature(LocalDate dateSignature) {
        this.dateSignature = dateSignature;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public TypeContrat getTypeContrat() {
        return typeContrat;
    }

    public void setTypeContrat(TypeContrat typeContrat) {
        this.typeContrat = typeContrat;
    }

    public Double getTarifAnnuel() {
        return tarifAnnuel;
    }

    public void setTarifAnnuel(Double tarifAnnuel) {
        this.tarifAnnuel = tarifAnnuel;
    }

    public Double getTarifMensuel() {
        return tarifMensuel;
    }

    public void setTarifMensuel(Double tarifMensuel) {
        this.tarifMensuel = tarifMensuel;
    }

    public String getZoneMedicale() {
        return zoneMedicale;
    }

    public void setZoneMedicale(String zoneMedicale) {
        this.zoneMedicale = zoneMedicale;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Boolean getActif() {
        return actif;
    }

    public void setActif(Boolean actif) {
        this.actif = actif;
    }

    public String getMotifAmendement() {
        return motifAmendement;
    }

    public void setMotifAmendement(String motifAmendement) {
        this.motifAmendement = motifAmendement;
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

    public DemandeAffiliation getDemandeAffiliation() {
        return demandeAffiliation;
    }

    public void setDemandeAffiliation(DemandeAffiliation demandeAffiliation) {
        this.demandeAffiliation = demandeAffiliation;
    }

    public User getDirecteurRegional() {
        return directeurRegional;
    }

    public void setDirecteurRegional(User directeurRegional) {
        this.directeurRegional = directeurRegional;
    }

    public List<AmendementContrat> getAmendements() {
        return amendements;
    }

    public void setAmendements(List<AmendementContrat> amendements) {
        this.amendements = amendements;
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
