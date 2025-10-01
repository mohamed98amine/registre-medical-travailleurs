package com.registremedical.repository;

import com.registremedical.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    @Query("SELECT n FROM Notification n WHERE n.destinataireType = :type AND n.destinataireEmail = :email ORDER BY n.date DESC")
    List<Notification> findByDestinataireTypeAndDestinataireEmail(@Param("type") String destinataireType, @Param("email") String destinataireEmail);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.destinataireType = :type AND n.destinataireEmail = :email AND n.statut = 'NON_LU'")
    Long countUnreadByDestinataireTypeAndDestinataireEmail(@Param("type") String destinataireType, @Param("email") String destinataireEmail);
}