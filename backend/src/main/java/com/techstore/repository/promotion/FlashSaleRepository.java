package com.techstore.repository.promotion;

import com.techstore.entity.promotion.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface FlashSaleRepository extends JpaRepository<FlashSale, String> {

    @Query("SELECT fs FROM FlashSale fs WHERE fs.active = true AND fs.startDate <= :now AND fs.endDate >= :now")
    Optional<FlashSale> findActiveFlashSale(Instant now);
}
