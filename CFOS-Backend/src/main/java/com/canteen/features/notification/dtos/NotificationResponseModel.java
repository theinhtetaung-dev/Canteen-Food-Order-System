package com.canteen.features.notification.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseModel {
    private Integer notificationId;
    private String userName;
    private Integer orderId;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
