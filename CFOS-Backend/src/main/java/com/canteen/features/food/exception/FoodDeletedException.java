package com.canteen.features.food.exception;

public class FoodDeletedException extends RuntimeException {

    public FoodDeletedException(Integer id) {
        super("Food with id " + id + " has been deleted");
    }
}