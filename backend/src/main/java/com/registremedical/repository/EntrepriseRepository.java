package com.registremedical.repository;

import com.registremedical.entity.Entreprise;
import com.registremedical.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    List<Entreprise> findByEmployeur(User employeur);
    List<Entreprise> findByEmployeurId(Long employeurId);
    Optional<Entreprise> findByIdAndEmployeurId(Long id, Long employeurId);
    
    @Query("SELECT COUNT(e) FROM Entreprise e WHERE e.employeur.id = :employeurId")
    long countByEmployeurId(@Param("employeurId") Long employeurId);
    
    @Query("SELECT COUNT(DISTINCT e) FROM Entreprise e JOIN e.travailleurs t JOIN t.visites v WHERE v.medecin.id = :medecinId")
    long countDistinctByVisitesMedecinId(@Param("medecinId") Long medecinId);
    
    // Nouvelles méthodes pour la gestion des zones
    List<Entreprise> findByZoneMedicaleIsNull();
    
    List<Entreprise> findByZoneMedicaleId(Long zoneMedicaleId);
    
    @Query("SELECT e FROM Entreprise e WHERE e.latitude IS NOT NULL AND e.longitude IS NOT NULL AND e.zoneMedicale IS NULL")
    List<Entreprise> findEntreprisesWithCoordinatesButNoZone();
}