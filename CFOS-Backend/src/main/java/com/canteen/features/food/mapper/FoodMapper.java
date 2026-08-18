package com.canteen.features.food.mapper;


import com.canteen.model.Food;
import com.canteen.model.FoodCategory;
import com.canteen.model.User;
import com.canteen.features.food.dto.FoodRequest;
import com.canteen.features.food.dto.FoodResponse;
import org.springframework.stereotype.Component;

@Component
public class FoodMapper {


    public Food toEntity(FoodRequest dto) {

        if (dto == null) return null;

        Food food = new Food();

        food.setFoodName(dto.getFoodName());
        food.setDescription(dto.getDescription());
        food.setPrice(dto.getPrice());
        food.setIsAvailable(dto.getIsAvailable() != null ? dto.getIsAvailable() : true);

        return food;
    }


    public FoodResponse toDTO(Food food) {

        if (food == null) return null;

        FoodResponse dto = new FoodResponse();

        // Basic fields
        dto.setFoodId(food.getFoodId());
        dto.setFoodName(food.getFoodName());
        dto.setDescription(food.getDescription());
        dto.setPrice(food.getPrice());
        dto.setImageUrl(food.getImageUrl());
        dto.setIsAvailable(food.getIsAvailable());


        if (food.getCategory() != null) {
            FoodCategory category = food.getCategory();

            dto.setCategoryId(category.getCategoryId());
            dto.setCategoryName(category.getCategoryName());
        }

        // =========================
        // USER MAPPING (SAFE CHECK)
        // =========================
        if (food.getCreatedBy() != null) {
            User user = food.getCreatedBy();

            dto.setCreatedBy(user.getUserId());
            dto.setCreatedByName(user.getFullName());
        }

        if (food.getBranch() != null) {
            dto.setBranchId(food.getBranch().getBranchId());
            dto.setBranchName(food.getBranch().getBranchName());
        }

        dto.setCreatedAt(food.getCreatedAt());
        dto.setUpdatedAt(food.getUpdatedAt());

        return dto;
    }
}
