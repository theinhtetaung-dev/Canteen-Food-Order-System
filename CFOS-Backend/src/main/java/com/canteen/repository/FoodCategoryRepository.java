package com.canteen.repository;

import com.canteen.model.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Integer> {

    List<FoodCategory> findByDeleteFlagFalse();

    boolean existsByCategoryNameIgnoreCaseAndDeleteFlagFalse(String categoryName);
}
