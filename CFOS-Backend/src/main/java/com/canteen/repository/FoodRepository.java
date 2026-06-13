package com.canteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.canteen.model.Food;

@Repository
public interface FoodRepository extends JpaRepository<Food, Integer> {
}
