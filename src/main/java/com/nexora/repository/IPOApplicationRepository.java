package com.nexora.repository;

import com.nexora.entity.IPOApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface IPOApplicationRepository extends JpaRepository<IPOApplication, Long> {
    List<IPOApplication> findByUserId(Long userId);
    List<IPOApplication> findByIpoId(Long ipoId);
    Optional<IPOApplication> findByIpoIdAndUserId(Long ipoId, Long userId);
    boolean existsByIpoIdAndUserId(Long ipoId, Long userId);
}
