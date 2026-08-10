package com.canteen.features.notification.mapper;

import com.canteen.features.notification.dtos.NotificationResponseModel;
import com.canteen.model.Notification;

public class NotificationMapper {
    
    public static NotificationResponseModel toDto(Notification notification) {
        if (notification == null) return null;
        
        NotificationResponseModel dto = new NotificationResponseModel();
        dto.setNotificationId(notification.getNotificationId());
        
        if (notification.getUser() != null) {
            dto.setUserName(notification.getUser().getUserName());
        }
        
        if (notification.getOrder() != null) {
            dto.setOrderId(notification.getOrder().getOrderId());
        }
        
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        
        return dto;
    }
}
