package com.techstore.dto.brand;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandRequest {
    @NotBlank(message = "Tên thương hiệu không được để trống")
    String name;

    String slug;

    String logoUrl;

    String description;
    Boolean active;
}
