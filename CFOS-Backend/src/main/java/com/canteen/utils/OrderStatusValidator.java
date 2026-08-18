package com.canteen.utils;

import org.springframework.stereotype.Component;
import com.canteen.model.Status;

@Component
public class OrderStatusValidator {

    public void validateTransition(Status current, Status target) {

        switch (current) {

            // Pending order can transition to PREPARING or CANCEL
            case PENDING -> allow(target, Status.PREPARING, Status.CANCEL);

            // Preparing order can transition to COMPLETE only
            case PREPARING -> allow(target, Status.COMPLETE);

            // Completed order is final
            case COMPLETE -> allow(target, Status.COMPLETE);

            // Canceled order is final
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