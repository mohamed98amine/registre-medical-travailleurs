package com.registremedical.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String message;
    
    @Column(nullable = false)
    private LocalDateTime date;
    
    @Column(nullable = false, length = 20)
    private String destinataireType; // "EMPLOYEUR" ou "MEDECIN"
    
    @Column(nullable = false)
    private String destinataireEmail;
    
    @Column(nullable = false, length = 10)
    private String statut = "NON_LU"; // "NON_LU" ou "LU"
    
    // Constructeurs
    public Notification() {}
    
    public Notification(String message, String destinataireType, String destinataireEmail) {
        this.message = message;
        this.destinataireType = destinataireType;
        this.destinataireEmail = destinataireEmail;
        this.date = LocalDateTime.now();
        this.statut = "NON_LU";
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    
    public String getDestinataireType() { return destinataireType; }
    public void setDestinataireType(String destinataireType) { this.destinataireType = destinataireType; }
    
    public String getDestinataireEmail() { return destinataireEmail; }
    public void setDestinataireEmail(String destinataireEmail) { this.destinataireEmail = destinataireEmail; }
    
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}