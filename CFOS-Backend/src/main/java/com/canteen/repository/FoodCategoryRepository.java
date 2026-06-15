package com.canteen.repository;


import com.canteen.model.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodCategoryRepository extends JpaRepository<FoodCategory, Integer> {

    List<FoodCategory> findByDeleteFlagFalse(); //No deleted categories will be returned

    boolean existsByCategoryNameIgnoreCaseAndDeleteFlagFalse(String categoryName); //Duplicate Check
}

