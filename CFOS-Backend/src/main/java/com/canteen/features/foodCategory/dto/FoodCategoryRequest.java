package com.canteen.features.foodCategory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data

public class FoodCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String categoryName;
    private String description;
    @NotNull(message = "Created by is required")
    private Integer createdBy;

}
