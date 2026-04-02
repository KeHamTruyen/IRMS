package com.irms.admin.domain.repository;

import com.irms.admin.domain.entity.RoleType;
import com.irms.admin.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByRole(RoleType role);
    
    List<User> findByIsActive(Boolean isActive);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
}
