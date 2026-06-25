package com.canteen.features.foodCategory.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String userName) {
        super("User not found with username: " + userName);
    }

    public UserNotFoundException(Integer id) {
        super("User not found with id: " + id);
    }
}