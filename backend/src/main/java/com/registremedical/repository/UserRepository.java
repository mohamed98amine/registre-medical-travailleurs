package com.registremedical.repository;

import com.registremedical.entity.User;
import com.registremedical.enums.UserRole;
import com.registremedical.enums.SpecialiteMedicale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndSpecialite(UserRole role, SpecialiteMedicale specialite);
    List<User> findByActiveTrue();
}
