package com.canteen.repository;

import com.canteen.model.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, Integer> {

    List<Food> findByDeleteFlagFalse();

    List<Food> findByCategory_CategoryIdAndDeleteFlagFalse(Integer categoryId);

    List<Food> findByIsAvailableTrueAndDeleteFlagFalse();

    List<Food> findByCategory_CategoryIdAndIsAvailableTrueAndDeleteFlagFalse(Integer categoryId);

    List<Food> findByFoodNameContainingIgnoreCaseAndDeleteFlagFalse(String foodName);

    List<Food> findByCreatedBy_UserIdAndDeleteFlagFalse(Integer userId);
}