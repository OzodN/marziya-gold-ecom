package com.marziyagold.repository;

import com.marziyagold.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySku(String sku);

    Page<Product> findByIsVisibleTrue(Pageable pageable);

    Page<Product> findByCategorySlugAndIsVisibleTrue(String categorySlug, Pageable pageable);

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);
}
