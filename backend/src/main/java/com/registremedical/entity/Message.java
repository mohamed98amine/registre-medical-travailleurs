package com.registremedical.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String contenu;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"messagesEnvoyes", "hibernateLazyInitializer", "handler"})
    private User sender;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    @JsonIgnoreProperties({"messagesRecus", "hibernateLazyInitializer", "handler"})
    private Employeur receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visite_medicale_id")
    @JsonIgnoreProperties({"messages", "hibernateLazyInitializer", "handler"})
    private VisiteMedicale visiteMedicale;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi;

    @Column(name = "lu", nullable = false)
    private Boolean lu = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructeurs
    public Message() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.dateEnvoi = LocalDateTime.now();
    }

    public Message(String contenu, User sender, Employeur receiver, VisiteMedicale visiteMedicale) {
        this();
        this.contenu = contenu;
        this.sender = sender;
        this.receiver = receiver;
        this.visiteMedicale = visiteMedicale;
    }

    public Message(String contenu, User sender, Employeur receiver) {
        this(contenu, sender, receiver, null);
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContenu() {
        return contenu;
    }

    public void setContenu(String contenu) {
        this.contenu = contenu;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public Employeur getReceiver() {
        return receiver;
    }

    public void setReceiver(Employeur receiver) {
        this.receiver = receiver;
    }

    public VisiteMedicale getVisiteMedicale() {
        return visiteMedicale;
    }

    public void setVisiteMedicale(VisiteMedicale visiteMedicale) {
        this.visiteMedicale = visiteMedicale;
    }

    public LocalDateTime getDateEnvoi() {
        return dateEnvoi;
    }

    public void setDateEnvoi(LocalDateTime dateEnvoi) {
        this.dateEnvoi = dateEnvoi;
    }

    public Boolean getLu() {
        return lu;
    }

    public void setLu(Boolean lu) {
        this.lu = lu;
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

    // Helper methods
    public String getSenderName() {
        return sender != null ? sender.getFullName() : "Système";
    }

    public String getReceiverName() {
        return receiver != null ? receiver.getFullName() : "Inconnu";
    }
}