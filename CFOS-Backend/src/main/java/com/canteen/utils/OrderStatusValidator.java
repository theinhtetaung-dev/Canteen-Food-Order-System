package com.canteen.utils;

import org.springframework.stereotype.Component;
import com.canteen.model.Status;

@Component
public class OrderStatusValidator {

    public void validateTransition(Status current, Status target) {

        switch (current) {

            // Pending order can be completed or canceled
            case PENDING -> allow(target, Status.COMPLETED, Status.CANCELED);

            // Completed order is final
            case COMPLETED -> allow(target, Status.COMPLETED);

            // Canceled order is final
            case CANCELED -> allow(target, Status.CANCELED);

            default -> throw new RuntimeException("Invalid status change");
        }
    }

    private void allow(Status target, Status... allowed) {
        for (Status status : allowed) {
            if (status == target) return;
        }
        throw new RuntimeException(
            "Invalid status transition from " + target
        );
    }
}