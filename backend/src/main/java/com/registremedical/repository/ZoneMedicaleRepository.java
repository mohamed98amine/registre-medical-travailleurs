package com.registremedical.repository;

import com.registremedical.entity.ZoneMedicale;
import com.registremedical.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZoneMedicaleRepository extends JpaRepository<ZoneMedicale, Long> {
    
    List<ZoneMedicale> findByDirecteurRegionalAndActifTrue(User directeurRegional);
    
    List<ZoneMedicale> findByRegionAndActifTrue(String region);
    
    List<ZoneMedicale> findByActifTrue();
    
    @Query("SELECT z FROM ZoneMedicale z WHERE z.actif = true AND " +
           "SQRT(POWER(69.1 * (z.latitude - :lat), 2) + " +
           "POWER(69.1 * (:lng - z.longitude) * COS(z.latitude / 57.3), 2)) <= :distanceKm")
    List<ZoneMedicale> findZonesWithinDistance(@Param("lat") Double latitude, 
                                              @Param("lng") Double longitude, 
                                              @Param("distanceKm") Double distanceKm);
    
    @Query("SELECT z FROM ZoneMedicale z WHERE z.actif = true ORDER BY " +
           "SQRT(POWER(69.1 * (z.latitude - :lat), 2) + " +
           "POWER(69.1 * (:lng - z.longitude) * COS(z.latitude / 57.3), 2))")
    List<ZoneMedicale> findZonesOrderedByDistance(@Param("lat") Double latitude, 
                                                 @Param("lng") Double longitude);
    
    @Query("SELECT COUNT(e) FROM Entreprise e WHERE e.zoneMedicale.id = :zoneId")
    Long countEntreprisesByZoneId(@Param("zoneId") Long zoneId);
}
