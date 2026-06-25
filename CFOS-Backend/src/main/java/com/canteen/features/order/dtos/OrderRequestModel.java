package com.canteen.features.order.dtos;

import lombok.Data;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

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
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
