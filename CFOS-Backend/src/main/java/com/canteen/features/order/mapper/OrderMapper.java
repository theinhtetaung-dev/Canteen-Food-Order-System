package com.canteen.features.order.mapper;

import com.canteen.features.order.dtos.OrderResponseModel;
import com.canteen.features.order.dtos.OrderResponseModel.OrderItemResponse;
import com.canteen.model.Order;
import com.canteen.model.OrderItem;

import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderResponseModel toDto(Order order) {
        if (order == null) return null;
        
        OrderResponseModel dto = new OrderResponseModel();
        dto.setOrderId(order.getOrderId());
        
        if (order.getUser() != null) {
            dto.setUserName(order.getUser().getUserName());
        }
        dto.setTotalAmount(order.getTotalAmount());
        
        if (order.getOrderStatus() != null) {
            dto.setOrderStatus(order.getOrderStatus());
        }
        if (order.getOrderItems() != null) {
            dto.setOrderItems(order.getOrderItems().stream()
                .map(OrderMapper::toOrderItemDto)
                .collect(Collectors.toList()));
            
            if (!order.getOrderItems().isEmpty()) {
                com.canteen.model.OrderItem firstItem = order.getOrderItems().get(0);
                if (firstItem.getFood() != null && firstItem.getFood().getBranch() != null) {
                    dto.setCanteenId(firstItem.getFood().getBranch().getBranchId());
                }
            }
        }
        
        dto.setDeleteFlag(order.getDeleteFlag());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        return dto;
    }

    public static OrderItemResponse toOrderItemDto(OrderItem item) {
        if (item == null) return null;

        OrderItemResponse dto = new OrderItemResponse();
        dto.setOrderItemId(item.getOrderItemId());
        
        if (item.getFood() != null) {
            dto.setFoodName(item.getFood().getFoodName());
        }
        
        dto.setQuantity(item.getQuantity());
        dto.setSnapPrice(item.getSnapPrice());
        dto.setSubTotal(item.getSubTotal());
        dto.setComment(item.getComment());
        return dto;
    }
}