package com.canteen.features.food.exception;

public class FoodNotFoundException extends RuntimeException {

    public FoodNotFoundException(Integer id) {
        super("Food not found with id: " + id);
    }
}