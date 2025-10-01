package com.registremedical.repository;

import com.registremedical.entity.Visite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisiteRepository extends JpaRepository<Visite, Long> {
    
    @Query("SELECT v FROM Visite v LEFT JOIN FETCH v.employeur LEFT JOIN FETCH v.medecin ORDER BY v.date DESC, v.heure DESC")
    List<Visite> findAllWithEmployeurAndMedecin();
}