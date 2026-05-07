package com.techstore.repository.product;

import com.techstore.entity.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product>, ProductListingRepository {

    @EntityGraph(attributePaths = {"category", "brand"})
    Page<Product> findAll(Pageable pageable);

    // ✅ Fix N+1 Query cho Specification: JOIN FETCH category và brand ngay từ đầu
    @EntityGraph(attributePaths = {"category", "brand"})
    Page<Product> findAll(Specification<Product> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "brand"})
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = {"category", "brand"})
    @Query("SELECT p FROM Product p WHERE p.slug = :slug")
    Optional<Product> fetchBySlugWithDetails(@Param("slug") String slug);

    @EntityGraph(attributePaths = {"category", "brand"})
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> fetchByIdWithDetails(@Param("id") String id);

    @EntityGraph(attributePaths = {"category", "brand"})
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    long countByCategoryId(String categoryId);
    long countByActive(boolean active);
}
