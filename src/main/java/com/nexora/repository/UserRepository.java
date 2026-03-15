package com.nexora.repository;

import com.nexora.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<User> findByUserType(User.UserType userType);
    List<User> findByKycStatus(User.KycStatus kycStatus);
    long countByUserType(User.UserType userType);
    long countByKycStatus(User.KycStatus kycStatus);
}
