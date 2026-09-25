package com.marziyagold.repository;

import com.marziyagold.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByIsVisibleTrueOrderBySortOrderAsc();

    List<Category> findAllByIsVisibleTrueOrderBySortOrderAsc();

    List<Category> findAllByOrderBySortOrderAsc();

    Optional<Category> findByName(String name);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByNameAndIdNot(String name, Long id);
}
