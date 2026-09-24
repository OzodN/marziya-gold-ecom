package com.marziyagold.repository;

import com.marziyagold.entity.ProductStone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductStoneRepository extends JpaRepository<ProductStone, Long> {

    List<ProductStone> findByProductIdOrderBySortOrderAsc(Long productId);

    List<ProductStone> findByStoneTypeId(Long stoneTypeId);
}
