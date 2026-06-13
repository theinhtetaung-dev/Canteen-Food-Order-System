package com.canteen.features.order.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class OrderResponseModel {

    private Integer orderId;
    private String userName;
    private BigDecimal totalAmount;
    private String orderStatus;
    private List<OrderItemResponse> orderItems;
    private Boolean deleteFlag = false;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class OrderItemResponse {
        private Integer orderItemId;
        private String foodName;
        private Integer quantity;
        private BigDecimal snapPrice;
        private BigDecimal subTotal;
    }
}
