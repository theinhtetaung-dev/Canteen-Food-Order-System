package com.canteen.features.auth.dtos;

import java.time.LocalDateTime;
import lombok.Data;
import com.canteen.model.UserStatus;

@Data
public class UserResModel {
    private Integer userId;
    private String roleName;
    private String userName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private UserStatus status;
    private Boolean deleteFlag;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer canteenId;
    private String canteenName;
}
