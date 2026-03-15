package com.nexora.repository;

import com.nexora.entity.Startup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StartupRepository extends JpaRepository<Startup, Long> {
    List<Startup> findByFounderId(Long founderId);
    List<Startup> findByStatus(Startup.StartupStatus status);
    List<Startup> findByIndustry(String industry);
}
