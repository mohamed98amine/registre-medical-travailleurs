package com.registremedical.repository;

import com.registremedical.entity.DemandeVisite;
import com.registremedical.entity.User;
import com.registremedical.enums.StatutDemande;
import com.registremedical.enums.SpecialiteMedicale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DemandeVisiteRepository extends JpaRepository<DemandeVisite, Long> {
    
    // Demandes par employeur
    List<DemandeVisite> findByEmployeurOrderByCreatedAtDesc(User employeur);
    
    // Demandes par médecin
    List<DemandeVisite> findByMedecinOrderByCreatedAtDesc(User medecin);
    
    // Demandes par statut et employeur
    List<DemandeVisite> findByEmployeurAndStatutOrderByCreatedAtDesc(User employeur, StatutDemande statut);
    
    // Demandes par statut et médecin
    List<DemandeVisite> findByMedecinAndStatutOrderByCreatedAtDesc(User medecin, StatutDemande statut);
    
    // Demandes en attente pour une spécialité
    @Query("SELECT d FROM DemandeVisite d WHERE d.specialite = :specialite AND d.statut = 'EN_ATTENTE' ORDER BY d.createdAt ASC")
    List<DemandeVisite> findEnAttenteBySpecialite(@Param("specialite") SpecialiteMedicale specialite);
    
    // Demandes par date
    List<DemandeVisite> findByDateSouhaiteeOrderByCreatedAtDesc(LocalDate date);
    
    // Demandes entre deux dates
    List<DemandeVisite> findByDateSouhaiteeBetweenOrderByCreatedAtDesc(LocalDate startDate, LocalDate endDate);
    
    // Compter les demandes par statut pour un employeur
    long countByEmployeurAndStatut(User employeur, StatutDemande statut);
    
    // Compter les demandes par statut pour un médecin
    long countByMedecinAndStatut(User medecin, StatutDemande statut);
}
