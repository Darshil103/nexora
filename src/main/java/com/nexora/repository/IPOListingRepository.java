package com.nexora.repository;

import com.nexora.entity.IPOListing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface IPOListingRepository extends JpaRepository<IPOListing, Long> {
    List<IPOListing> findByStatusOrderByOpenDateDesc(IPOListing.IPOStatus status);
    Optional<IPOListing> findByStockId(Long stockId);
    List<IPOListing> findAllByOrderByCreatedAtDesc();
    long countByStatus(IPOListing.IPOStatus status);
}
