package com.canteen.features.foodCategory.dto;

import lombok.Data;

@Data

public class FoodCategoryRequest {

    private String categoryName;
    private String description;
    private Integer createdBy;

}
