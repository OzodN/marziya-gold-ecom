package com.marziyagold.repository;

import com.marziyagold.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySlugAndIsVisibleTrue(String slug);

    Optional<Product> findBySku(String sku);

    Page<Product> findByIsVisibleTrue(Pageable pageable);

    Page<Product> findByCategorySlugAndIsVisibleTrue(String categorySlug, Pageable pageable);

    List<Product> findByIdInAndIsVisibleTrue(List<Long> ids);

    List<Product> findByIdIn(List<Long> ids);

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    boolean existsBySkuAndIdNot(String sku, Long id);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN p.stones s " +
           "WHERE p.isVisible = true " +
           "AND (:categorySlug IS NULL OR p.category.slug = :categorySlug) " +
           "AND (:stoneTypeId IS NULL OR s.stoneType.id = :stoneTypeId) " +
           "AND (:q IS NULL OR :q = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> findFiltered(
            @Param("categorySlug") String categorySlug,
            @Param("stoneTypeId") Long stoneTypeId,
            @Param("q") String q,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p " +
           "WHERE (:isVisible IS NULL OR p.isVisible = :isVisible) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:q IS NULL OR :q = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> findAdminFiltered(
            @Param("categoryId") Long categoryId,
            @Param("isVisible") Boolean isVisible,
            @Param("q") String q,
            Pageable pageable
    );
}
