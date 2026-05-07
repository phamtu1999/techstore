package com.techstore.dto.category;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CategoryResponse {
    String id;
    String name;
    String slug;
    String description;
    String icon;
    String imageUrl;
    Integer sortOrder;
    String parentId;
    String parentName;
    Long productCount;
    @com.fasterxml.jackson.annotation.JsonProperty("active")
    Boolean active;
    Instant createdAt;
    List<CategoryResponse> children;
}
