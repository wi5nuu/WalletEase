package com.payflow.service.interfaces;

import java.util.List;
import java.util.Optional;

/**
 * BaseService - Generic interface demonstrating INHERITANCE (OOP Pillar #2)
 * 
 * This is an ABSTRACTION that defines the contract for all services.
 * Any service can implement this interface to get basic CRUD operations.
 * 
 * POLYMORPHISM: Different service implementations can be used interchangeably.
 * 
 * @param <T> The entity type
 * @param <ID> The ID type
 */
public interface BaseService<T, ID> {

    /**
     * Find entity by ID.
     * 
     * @param id The entity ID
     * @return Optional containing the entity if found
     */
    Optional<T> findById(ID id);

    /**
     * Find all entities.
     * 
     * @return List of all entities
     */
    List<T> findAll();

    /**
     * Save an entity.
     * 
     * @param entity The entity to save
     * @return The saved entity
     */
    T save(T entity);

    /**
     * Delete an entity by ID.
     * 
     * @param id The entity ID
     */
    void deleteById(ID id);

    /**
     * Check if entity exists.
     * 
     * @param id The entity ID
     * @return true if exists
     */
    boolean existsById(ID id);

    /**
     * Count all entities.
     * 
     * @return The count
     */
    long count();
}
