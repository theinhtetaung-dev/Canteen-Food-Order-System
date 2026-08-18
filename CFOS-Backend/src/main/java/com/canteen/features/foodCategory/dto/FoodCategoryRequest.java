package com.canteen.features.foodCategory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FoodCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String categoryName;

    private String description;

    private Integer branchId;
}
