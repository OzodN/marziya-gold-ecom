package com.marziyagold.repository;

import com.marziyagold.entity.StoneType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoneTypeRepository extends JpaRepository<StoneType, Long> {

    List<StoneType> findByIsActiveTrue();

    Optional<StoneType> findByName(String name);

    boolean existsByName(String name);
}
