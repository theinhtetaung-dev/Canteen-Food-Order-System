package com.canteen.features.foodCategory.exception;

public class CategoryAlreadyExistsException extends RuntimeException {

    public CategoryAlreadyExistsException(String categoryName) {
        super("Food Category already exists: " + categoryName);
    }
}