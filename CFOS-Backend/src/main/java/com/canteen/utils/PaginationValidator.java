package com.canteen.utils;

import java.util.Set;

public final class PaginationValidator {
    private PaginationValidator() {
    }

    public static void validate(int page, int size, String sortBy, String direction, Set<String> allowedSortFields) {
        if (page < 0) {
            throw new RuntimeException("Page must be greater than or equal to 0");
        }
        if (size <= 0 || size > 10000) {
            throw new RuntimeException("Size must be between 1 and 10000");
        }
        if (!"asc".equalsIgnoreCase(direction) && !"desc".equalsIgnoreCase(direction)) {
            throw new RuntimeException("Direction must be either 'asc' or 'desc'");
        }
        if (!allowedSortFields.contains(sortBy)) {
            throw new RuntimeException("Invalid sortBy field: " + sortBy);
        }
    }
}
