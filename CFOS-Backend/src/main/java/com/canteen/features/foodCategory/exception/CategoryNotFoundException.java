package com.canteen.features.foodCategory.exception;

public class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(Integer id) {

        super("Food Category not found with id: " + id);

    }

}