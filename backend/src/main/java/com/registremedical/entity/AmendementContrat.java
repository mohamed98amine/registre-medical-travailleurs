package com.registremedical.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "amendements_contrat")
public class AmendementContrat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le motif de l'amendement est requis")
    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;

    @Column(name = "changements", columnDefinition = "TEXT")
    private String changements;

    @Column(name = "nouveau_effectif")
    private Integer nouveauEffectif;

    @Column(name = "nouveau_tarif_annuel")
    private Double nouveauTarifAnnuel;

    @Column(name = "nouveau_tarif_mensuel")
    private Double nouveauTarifMensuel;

    @Column(name = "date_effet")
    private LocalDateTime dateEffet;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id")
    private Contrat contrat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "directeur_regional_id")
    private User directeurRegional;

    // Constructeurs
    public AmendementContrat() {}

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public String getChangements() {
        return changements;
    }

    public void setChangements(String changements) {
        this.changements = changements;
    }

    public Integer getNouveauEffectif() {
        return nouveauEffectif;
    }

    public void setNouveauEffectif(Integer nouveauEffectif) {
        this.nouveauEffectif = nouveauEffectif;
    }

    public Double getNouveauTarifAnnuel() {
        return nouveauTarifAnnuel;
    }

    public void setNouveauTarifAnnuel(Double nouveauTarifAnnuel) {
        this.nouveauTarifAnnuel = nouveauTarifAnnuel;
    }

    public Double getNouveauTarifMensuel() {
        return nouveauTarifMensuel;
    }

    public void setNouveauTarifMensuel(Double nouveauTarifMensuel) {
        this.nouveauTarifMensuel = nouveauTarifMensuel;
    }

    public LocalDateTime getDateEffet() {
        return dateEffet;
    }

    public void setDateEffet(LocalDateTime dateEffet) {
        this.dateEffet = dateEffet;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Contrat getContrat() {
        return contrat;
    }

    public void setContrat(Contrat contrat) {
        this.contrat = contrat;
    }

    public User getDirecteurRegional() {
        return directeurRegional;
    }

    public void setDirecteurRegional(User directeurRegional) {
        this.directeurRegional = directeurRegional;
    }
}
