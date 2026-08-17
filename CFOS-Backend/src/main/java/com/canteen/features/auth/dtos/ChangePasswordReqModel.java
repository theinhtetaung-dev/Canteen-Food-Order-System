package com.canteen.features.auth.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordReqModel {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    private String newPassword;
}
