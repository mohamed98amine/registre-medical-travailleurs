package com.registremedical.repository;

import com.registremedical.entity.Employeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeurRepository extends JpaRepository<Employeur, Long> {
    
    /**
     * Trouve tous les employeurs actifs
     */
    List<Employeur> findByStatut(String statut);
    
    /**
     * Trouve les employeurs par nom (recherche partielle)
     */
    List<Employeur> findByNomContainingIgnoreCase(String nom);
    
    /**
     * Trouve un employeur par email
     */
    Employeur findByEmail(String email);
    
    /**
     * Vérifie si un employeur existe avec cet email
     */
    boolean existsByEmail(String email);
    
    /**
     * Trouve les employeurs par statut triés par nom
     */
    List<Employeur> findByStatutOrderByNomAsc(String statut);
}