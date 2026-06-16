package com.canteen.features.food.dto;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class FoodRequest {

    private Integer categoryId;

    private String foodName;

    private String description;

    private BigDecimal price;

    private Boolean isAvailable;

    private Integer createdBy;

}