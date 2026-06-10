package com.canteen.features.order.mapper;

import com.canteen.features.order.dtos.OrderRequestModel;
import com.canteen.features.order.dtos.OrderResponseModel;
import com.canteen.features.order.dtos.OrderResponseModel.OrderItemResponse;
import com.canteen.model.Order;
import com.canteen.model.OrderItem;
import com.canteen.model.Food;
import com.canteen.model.Status;

import java.util.ArrayList;
import java.util.stream.Collectors;

public class OrderMapper {

    public static Order toEntity(OrderRequestModel request) {
        if (request == null) return null;

        Order order = new Order();
        order.setOrderStatus(Status.PENDING);
        order.setOrderItems(new ArrayList<>());

        if (request.getOrderItems() != null) {
            for (var itemReq : request.getOrderItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setQuantity(itemReq.getQuantity());
                
                Food food = new Food();
                food.setFoodId(itemReq.getFoodId());
                orderItem.setFood(food);
                
                orderItem.setOrder(order);
                order.getOrderItems().add(orderItem);
            }
        }
        return order;
    }

    public static OrderResponseModel toDto(Order order) {
        if (order == null) return null;
        
        OrderResponseModel dto = new OrderResponseModel();
        dto.setOrderId(order.getOrderId());
        if (order.getUser() != null) {
            dto.setUserName(order.getUser().getUserName());
        }
        dto.setTotalAmount(order.getTotalAmount());
        if (order.getOrderStatus() != null) {
            dto.setOrderStatus(order.getOrderStatus().name());
        }
        if (order.getOrderItems() != null) {
            dto.setOrderItems(order.getOrderItems().stream()
                .map(OrderMapper::toOrderItemDto)
                .collect(Collectors.toList()));
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
        return dto;
    }
}
