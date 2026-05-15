package com.payflow.repository;

import com.payflow.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Bill entity.
 * Extends JpaRepository for basic CRUD operations.
 */
@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    List<Bill> findByIsActiveTrue();

    List<Bill> findByCategoryAndIsActiveTrue(Bill.Category category);

    @Query("SELECT b FROM Bill b WHERE b.isActive = true AND " +
           "(LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Bill> searchActiveBills(@Param("search") String search);

    Optional<Bill> findByName(String name);

    boolean existsByName(String name);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.isActive = true")
    long countActiveBills();
}
