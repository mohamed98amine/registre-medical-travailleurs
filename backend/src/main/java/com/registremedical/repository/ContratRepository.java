package com.registremedical.repository;

import com.registremedical.entity.Contrat;
import com.registremedical.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContratRepository extends JpaRepository<Contrat, Long> {
    
    List<Contrat> findByDirecteurRegionalOrderByDateCreationDesc(User directeurRegional);
    
    List<Contrat> findByActifTrueOrderByDateCreationDesc();
    
    Optional<Contrat> findByNumeroContrat(String numeroContrat);
    
    @Query("SELECT c FROM Contrat c WHERE c.directeurRegional = :directeur AND c.actif = true")
    List<Contrat> findActiveContratsByDirecteur(@Param("directeur") User directeur);
    
    @Query("SELECT COUNT(c) FROM Contrat c WHERE c.directeurRegional = :directeur AND c.actif = true")
    Long countActiveContratsByDirecteur(@Param("directeur") User directeur);
    
    @Query("SELECT SUM(c.tarifAnnuel) FROM Contrat c WHERE c.directeurRegional = :directeur AND c.actif = true")
    Double sumActiveContratsByDirecteur(@Param("directeur") User directeur);
}
