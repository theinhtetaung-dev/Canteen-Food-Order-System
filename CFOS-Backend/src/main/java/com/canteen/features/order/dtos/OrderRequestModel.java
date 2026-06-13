package com.canteen.features.order.dtos;

import lombok.Data;
import java.util.List;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
public class OrderRequestModel {

    @NotNull(message = "Username is required")
    private String userName;

    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequestModel> orderItems;

    @Data
    public static class OrderItemRequestModel {

        @NotNull(message = "Food id is required")
        private Integer foodId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private Integer quantity;
    }
}
