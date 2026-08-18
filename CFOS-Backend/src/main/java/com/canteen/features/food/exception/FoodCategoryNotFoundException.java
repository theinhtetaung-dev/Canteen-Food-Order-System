package com.canteen.features.food.exception;

public class FoodCategoryNotFoundException extends RuntimeException {

    public FoodCategoryNotFoundException(Integer id) {
        super("Food Category not found with id: " + id);
    }
}