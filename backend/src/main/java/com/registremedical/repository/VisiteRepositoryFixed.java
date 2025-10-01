package com.registremedical.repository;

import com.registremedical.entity.Visite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisiteRepositoryFixed extends JpaRepository<Visite, Long> {
    List<Visite> findByDate(LocalDate date);
    List<Visite> findByStatut(String statut);
}