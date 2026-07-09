package com.canteen.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    PENDING,
    COMPLETE,
    CANCEL;

    @JsonCreator
    public static Status fromString(String value) {
        if (value == null) {
            return null;
        }
        String cleaned = value.trim().toUpperCase();
        if (cleaned.equals("COMPLETED") || cleaned.equals("COMPLETE")) {
            return COMPLETE;
        }
        if (cleaned.equals("CANCELLED") || cleaned.equals("CANCELED") || cleaned.equals("CANCEL")) {
            return CANCEL;
        }
        if (cleaned.equals("PENDING")) {
            return PENDING;
        }
        throw new IllegalArgumentException("No enum constant " + Status.class.getCanonicalName() + "." + value);
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}

