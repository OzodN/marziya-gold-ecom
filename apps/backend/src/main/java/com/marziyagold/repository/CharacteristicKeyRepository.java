package com.marziyagold.repository;

import com.marziyagold.entity.CharacteristicKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CharacteristicKeyRepository extends JpaRepository<CharacteristicKey, Long> {

    List<CharacteristicKey> findByIsFilterableTrueOrderBySortOrderAsc();

    Optional<CharacteristicKey> findByName(String name);

    boolean existsByName(String name);
}
