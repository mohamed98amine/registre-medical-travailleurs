package com.registremedical.repository;

import com.registremedical.entity.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Long> {

    List<Medecin> findByDisponibleTrue();

    @Query("SELECT m FROM Medecin m WHERE m.disponible = true ORDER BY m.nom, m.prenom")
    List<Medecin> findAvailableMedecins();

    List<Medecin> findBySpecialiteContainingIgnoreCase(String specialite);

    Medecin findByEmail(String email);
}