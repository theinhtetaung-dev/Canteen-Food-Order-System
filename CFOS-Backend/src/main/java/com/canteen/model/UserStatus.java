package com.canteen.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserStatus {
    ACTIVE,
    INACTIVE;

    @JsonCreator
    public static UserStatus fromString(String value) {
        if (value == null) {
            return null;
        }
        for (UserStatus status : UserStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("No enum constant " + UserStatus.class.getCanonicalName() + "." + value);
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}

