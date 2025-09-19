package com.registremedical.repository;

import com.registremedical.entity.DemandeAffiliation;
import com.registremedical.entity.User;
import com.registremedical.enums.StatutAffiliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeAffiliationRepository extends JpaRepository<DemandeAffiliation, Long> {
    
    List<DemandeAffiliation> findByDirecteurRegionalOrderByDateCreationDesc(User directeurRegional);
    
    List<DemandeAffiliation> findByEmployeurOrderByDateCreationDesc(User employeur);
    
    List<DemandeAffiliation> findByStatutOrderByDateCreationDesc(StatutAffiliation statut);
    
    List<DemandeAffiliation> findByDirecteurRegionalAndStatutOrderByDateCreationDesc(
        User directeurRegional, StatutAffiliation statut);
    
    @Query("SELECT d FROM DemandeAffiliation d WHERE " +
           "LOWER(d.raisonSociale) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.secteurActivite) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.contactDrh) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<DemandeAffiliation> findBySearchTerm(@Param("search") String search);
    
    @Query("SELECT COUNT(d) FROM DemandeAffiliation d WHERE d.directeurRegional = :directeur AND (:statut IS NULL OR d.statut = :statut)")
    Long countByDirecteurAndStatut(@Param("directeur") User directeur, @Param("statut") StatutAffiliation statut);
    
    @Query("SELECT COUNT(d) FROM DemandeAffiliation d WHERE d.employeur = :employeur")
    Long countByEmployeur(@Param("employeur") User employeur);
    
    @Query("SELECT COUNT(d) FROM DemandeAffiliation d WHERE d.employeur = :employeur AND d.statut = :statut")
    Long countByEmployeurAndStatut(@Param("employeur") User employeur, @Param("statut") StatutAffiliation statut);
}
