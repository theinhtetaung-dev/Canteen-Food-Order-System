package com.canteen.features.auth.dtos;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class UserResModel {
    private Integer userId;
    private String roleName;
    private String userName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String status;
    private Boolean deleteFlag;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
