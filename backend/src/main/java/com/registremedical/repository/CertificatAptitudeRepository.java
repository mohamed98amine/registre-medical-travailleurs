package com.registremedical.repository;

import com.registremedical.entity.CertificatAptitude;
import com.registremedical.entity.Travailleur;
import com.registremedical.entity.User;
import com.registremedical.enums.Aptitude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CertificatAptitudeRepository extends JpaRepository<CertificatAptitude, Long> {
    
    // Certificats par travailleur
    List<CertificatAptitude> findByTravailleurOrderByDateEmissionDesc(Travailleur travailleur);
    
    // Certificats par médecin
    List<CertificatAptitude> findByMedecinOrderByDateEmissionDesc(User medecin);
    
    // Certificats par aptitude
    List<CertificatAptitude> findByAptitudeOrderByDateEmissionDesc(Aptitude aptitude);
    
    // Certificats valides (non expirés)
    @Query("SELECT c FROM CertificatAptitude c WHERE c.dateExpiration >= :date ORDER BY c.dateEmission DESC")
    List<CertificatAptitude> findValides(@Param("date") LocalDate date);
    
    // Certificats expirés
    @Query("SELECT c FROM CertificatAptitude c WHERE c.dateExpiration < :date ORDER BY c.dateEmission DESC")
    List<CertificatAptitude> findExpires(@Param("date") LocalDate date);
    
    // Dernier certificat d'un travailleur
    @Query("SELECT c FROM CertificatAptitude c WHERE c.travailleur = :travailleur ORDER BY c.dateEmission DESC")
    List<CertificatAptitude> findDernierByTravailleur(@Param("travailleur") Travailleur travailleur);
    
    // Certificats par période
    List<CertificatAptitude> findByDateEmissionBetweenOrderByDateEmissionDesc(LocalDate startDate, LocalDate endDate);
    
    // Certificats par liste de travailleurs
    @Query("SELECT c FROM CertificatAptitude c WHERE c.travailleur.id IN :travailleurIds ORDER BY c.dateEmission DESC")
    List<CertificatAptitude> findByTravailleurIdInOrderByDateEmissionDesc(@Param("travailleurIds") List<Long> travailleurIds);
}
