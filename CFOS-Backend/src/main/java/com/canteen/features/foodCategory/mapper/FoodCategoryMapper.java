package com.canteen.features.foodCategory.mapper;

import com.canteen.features.foodCategory.dto.FoodCategoryRequest;
import com.canteen.features.foodCategory.dto.FoodCategoryResponse;
import com.canteen.model.FoodCategory;
import com.canteen.model.User;
import org.springframework.stereotype.Component;

@Component
public class FoodCategoryMapper {

    public FoodCategory toEntity(
            FoodCategoryRequest dto,
            User user) {

        FoodCategory category = new FoodCategory();

        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());
        category.setCreatedBy(user);

        return category;
    }

    public FoodCategoryResponse toDTO(FoodCategory category) {

        FoodCategoryResponse dto = new FoodCategoryResponse();

        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());

        if (category.getCreatedBy() != null) {
            dto.setCreatedBy(category.getCreatedBy().getUserId());
            dto.setCreatedByName(category.getCreatedBy().getUserName());
        }

        return dto;
    }

    public void updateEntity(
            FoodCategoryRequest dto,
            FoodCategory category) {

        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());
    }
}
