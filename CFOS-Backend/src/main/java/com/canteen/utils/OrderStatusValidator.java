package com.canteen.utils;

import org.springframework.stereotype.Component;
import com.canteen.model.Status;

@Component
public class OrderStatusValidator {

    public void validateTransition(Status current, Status target) {

        switch (current) {

            case PENDING -> allow(target, Status.PREPARING, Status.CANCEL);

            case PREPARING -> allow(target, Status.COMPLETE);

            case COMPLETE -> allow(target, Status.COMPLETE);

            case CANCEL -> allow(target, Status.CANCEL);

            default -> throw new IllegalArgumentException("Invalid status change from " + current);
        }
    }

    private void allow(Status target, Status... allowed) {
        for (Status status : allowed) {
            if (status == target) return;
        }
        throw new IllegalArgumentException(
            "Invalid status transition to " + target
        );
    }
}