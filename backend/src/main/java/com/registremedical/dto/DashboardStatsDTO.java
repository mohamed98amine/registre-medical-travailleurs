package com.registremedical.dto;

public class DashboardStatsDTO {
    private long totalEntreprises;
    private long totalTravailleurs;
    private long visitesEnAttente;
    private long visitesTerminees;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(long totalEntreprises, long totalTravailleurs, long visitesEnAttente, long visitesTerminees) {
        this.totalEntreprises = totalEntreprises;
        this.totalTravailleurs = totalTravailleurs;
        this.visitesEnAttente = visitesEnAttente;
        this.visitesTerminees = visitesTerminees;
    }

    public long getTotalEntreprises() {
        return totalEntreprises;
    }

    public void setTotalEntreprises(long totalEntreprises) {
        this.totalEntreprises = totalEntreprises;
    }

    public long getTotalTravailleurs() {
        return totalTravailleurs;
    }

    public void setTotalTravailleurs(long totalTravailleurs) {
        this.totalTravailleurs = totalTravailleurs;
    }

    public long getVisitesEnAttente() {
        return visitesEnAttente;
    }

    public void setVisitesEnAttente(long visitesEnAttente) {
        this.visitesEnAttente = visitesEnAttente;
    }

    public long getVisitesTerminees() {
        return visitesTerminees;
    }

    public void setVisitesTerminees(long visitesTerminees) {
        this.visitesTerminees = visitesTerminees;
    }
}
