package com.canteen.features.food.dto;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FoodResponse {

    private Integer foodId;
    private Integer categoryId;
    private String categoryName;

    private String foodName;
    private String description;
    private BigDecimal price;

    private String imageUrl;
    private Boolean isAvailable;

    private Integer createdBy;
    private String createdByName;

    private Integer branchId;
    private String branchName;

    private LocalDateTime createdAt;

    public void setUpdatedAt(LocalDateTime updatedAt) {
    }
}

