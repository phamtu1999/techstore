package com.techstore.service.category;

import com.techstore.dto.category.CategoryRequest;
import com.techstore.dto.category.CategoryResponse;
import com.techstore.entity.category.Category;
import com.techstore.exception.AppException;
import com.techstore.exception.ErrorCode;
import com.techstore.repository.category.CategoryRepository;
import com.techstore.repository.product.ProductRepository;


import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::mapToFullDto)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        return mapToFullDto(category);
    }

    @Transactional
    @CacheEvict(value = {"categories", "products_v2"}, allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) {
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .icon(request.getIcon())
                .imageUrl(request.getImageUrl())
                .active(request.isActive())
                .sortOrder(request.getSortOrder())
                .parent(parent)
                .build();

        return mapToFullDto(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = {"categories", "products_v2"}, allEntries = true)
    public CategoryResponse updateCategory(String id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));

        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        category.setImageUrl(request.getImageUrl());
        category.setActive(request.isActive());
        category.setSortOrder(request.getSortOrder());
        category.setParent(parent);

        return mapToFullDto(categoryRepository.save(category));
    }

    @Transactional
    @CacheEvict(value = {"categories", "products_v2"}, allEntries = true)
    public void deleteCategory(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        category.setActive(false);
        categoryRepository.save(category);
    }

    @Transactional
    @CacheEvict(value = {"categories", "products_v2"}, allEntries = true)
    public CategoryResponse toggleStatus(String id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_FOUND));
        category.setActive(!category.isActive());
        return mapToFullDto(categoryRepository.save(category));
    }

    @Cacheable(value = "categories", key = "'tree'")
    public List<CategoryResponse> getCategoryTree() {
        List<Category> allCategories = categoryRepository.findAllByOrderBySortOrderAsc();

        List<CategoryResponse> allDtos = allCategories.stream()
                .filter(Category::isActive)
                .map(this::mapToSimpleDto)
                .collect(Collectors.toList());

        Map<String, List<CategoryResponse>> childrenMap = new HashMap<>();
        List<CategoryResponse> rootNodes = new ArrayList<>();

        for (CategoryResponse dto : allDtos) {
            if (dto.getParentId() == null) {
                rootNodes.add(dto);
            } else {
                childrenMap.computeIfAbsent(dto.getParentId(), k -> new ArrayList<>()).add(dto);
            }
        }

        for (CategoryResponse root : rootNodes) {
            buildChildren(root, childrenMap);
        }

        return rootNodes;
    }

    private void buildChildren(CategoryResponse parent, Map<String, List<CategoryResponse>> childrenMap) {
        List<CategoryResponse> children = childrenMap.get(parent.getId());
        if (children != null) {
            // Sorting children by sortOrder is already done because allCategories was fetched sorted
            parent.setChildren(children);
            for (CategoryResponse child : children) {
                buildChildren(child, childrenMap);
            }
        }
    }

    @Transactional
    @CacheEvict(value = {"categories", "products_v2"}, allEntries = true)
    public void updateSortOrder(List<Map<String, Object>> sortRequests) {
        for (Map<String, Object> request : sortRequests) {
            String id = (String) request.get("id");
            Integer sortOrder = (Integer) request.get("sortOrder");
            categoryRepository.findById(id).ifPresent(category -> {
                category.setSortOrder(sortOrder);
                categoryRepository.save(category);
            });
        }
    }

    @Transactional
    @CacheEvict(value = {"categories", "products_v2"}, allEntries = true)
    public void activateAll() {
        categoryRepository.findAll().forEach(category -> {
            category.setActive(true);
            categoryRepository.save(category);
        });
    }

    private CategoryResponse mapToSimpleDto(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .imageUrl(category.getImageUrl())
                .active(category.isActive())
                .sortOrder(category.getSortOrder())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .build();
    }

    private CategoryResponse mapToFullDto(Category category) {
        long productCount = productRepository.countByCategoryId(category.getId());
        
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .icon(category.getIcon())
                .imageUrl(category.getImageUrl())
                .sortOrder(category.getSortOrder())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .productCount(productCount)
                .active(category.isActive())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
