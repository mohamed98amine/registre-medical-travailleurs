package com.registremedical.dto;

public class EntrepriseRequestDTO {
    // Correspond au champ frontend "raisonSociale"
    private String raisonSociale;
    private String nom;
    private String adresse;
    private String ville;
    private String codePostal;
    private String telephone;
    private String email;
    private String siret;
    private String secteurActivite;
    private Integer effectif;
    private String zoneAffectation;
    private Long employeurId;

    // Getters et setters
    public String getRaisonSociale() { return raisonSociale; }
    public void setRaisonSociale(String raisonSociale) { this.raisonSociale = raisonSociale; }
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
    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }
    public String getSecteurActivite() { return secteurActivite; }
    public void setSecteurActivite(String secteurActivite) { this.secteurActivite = secteurActivite; }
    public Integer getEffectif() { return effectif; }
    public void setEffectif(Integer effectif) { this.effectif = effectif; }
    public String getZoneAffectation() { return zoneAffectation; }
    public void setZoneAffectation(String zoneAffectation) { this.zoneAffectation = zoneAffectation; }
    public Long getEmployeurId() { return employeurId; }
    public void setEmployeurId(Long employeurId) { this.employeurId = employeurId; }
}