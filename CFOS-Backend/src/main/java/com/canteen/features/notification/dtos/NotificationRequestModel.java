package com.canteen.features.notification.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NotificationRequestModel {
    private Integer orderId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Message is required")
    private String message;
}
