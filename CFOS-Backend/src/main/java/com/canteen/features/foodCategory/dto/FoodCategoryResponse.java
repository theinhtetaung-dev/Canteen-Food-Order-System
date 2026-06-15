package com.canteen.features.foodCategory.dto;



import lombok.Data;

@Data

public class FoodCategoryResponse {

    private Integer categoryId;
    private String categoryName;
    private String description;
    private Integer createdBy;
    private String createdByName;

}
