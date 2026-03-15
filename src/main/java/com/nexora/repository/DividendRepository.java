package com.nexora.repository;

import com.nexora.entity.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DividendRepository extends JpaRepository<Dividend, Long> {
    List<Dividend> findByStartupIdOrderByAnnouncementDateDesc(Long startupId);
    List<Dividend> findAllByOrderByAnnouncementDateDesc();
    List<Dividend> findByStatus(Dividend.DividendStatus status);
}
