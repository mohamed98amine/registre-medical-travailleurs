package com.registremedical.repository;

import com.registremedical.entity.VisiteMedicale;
import com.registremedical.enums.StatutVisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisiteMedicaleRepository extends JpaRepository<VisiteMedicale, Long> {
    List<VisiteMedicale> findByStatut(StatutVisite statut);
    
    @Query("SELECT COUNT(v) FROM VisiteMedicale v WHERE v.travailleur.entreprise.employeur.id = :employeurId AND v.statut = :statut")
    long countByEntrepriseEmployeurIdAndStatut(@Param("employeurId") Long employeurId, @Param("statut") StatutVisite statut);
    
    @Query("SELECT COUNT(v) FROM VisiteMedicale v WHERE v.medecin.id = :medecinId")
    long countByMedecinId(@Param("medecinId") Long medecinId);
    
    @Query("SELECT COUNT(v) FROM VisiteMedicale v WHERE v.medecin.id = :medecinId AND v.statut = :statut")
    long countByMedecinIdAndStatut(@Param("medecinId") Long medecinId, @Param("statut") StatutVisite statut);
    
    @Query("SELECT v FROM VisiteMedicale v WHERE v.travailleur.entreprise.employeur.id = :employeurId")
    List<VisiteMedicale> findByEmployeurId(@Param("employeurId") Long employeurId);
    
    @Query("SELECT v FROM VisiteMedicale v WHERE v.travailleur.entreprise.employeur.id = :employeurId AND v.statut = :statut ORDER BY v.dateVisite ASC")
    List<VisiteMedicale> findByEmployeurAndStatutOrdered(@Param("employeurId") Long employeurId, @Param("statut") StatutVisite statut);
    
    @Query("SELECT v FROM VisiteMedicale v WHERE v.travailleur.entreprise.employeur.id = :employeurId AND v.statut = 'PLANIFIEE' AND v.dateVisite >= CURRENT_DATE ORDER BY v.dateVisite ASC")
    List<VisiteMedicale> findUpcomingByEmployeurId(@Param("employeurId") Long employeurId);
}