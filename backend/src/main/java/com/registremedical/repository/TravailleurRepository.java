package com.registremedical.repository;

import com.registremedical.entity.Entreprise;
import com.registremedical.entity.Travailleur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravailleurRepository extends JpaRepository<Travailleur, Long> {
    List<Travailleur> findByEntreprise(Entreprise entreprise);
    List<Travailleur> findByEntrepriseIn(List<Entreprise> entreprises);
    
    // Méthode manquante ajoutée
    @Query("SELECT t FROM Travailleur t WHERE t.entreprise.employeur.id = :employeurId")
    List<Travailleur> findByEntrepriseEmployeurId(@Param("employeurId") Long employeurId);
    
    @Query("SELECT COUNT(t) FROM Travailleur t WHERE t.entreprise.employeur.id = :employeurId")
    long countByEntrepriseEmployeurId(@Param("employeurId") Long employeurId);
    
    @Query("SELECT t.id, t.nom, t.prenom, t.poste, MAX(v.dateVisite), v.aptitude " +
           "FROM Travailleur t LEFT JOIN t.visites v " +
           "WHERE t.entreprise.employeur.id = :employeurId " +
           "GROUP BY t.id, t.nom, t.prenom, t.poste, v.aptitude")
    List<Object[]> findCompactByEmployeurId(@Param("employeurId") Long employeurId);
}