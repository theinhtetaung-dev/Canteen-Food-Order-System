package com.canteen.features.auth.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.canteen.model.UserStatus;

@Data
public class UpdateUserReqModel {
    @NotNull(message = "Role ID is required")
    private Integer roleId;

    @NotBlank(message = "Username is required")
    private String userName;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email format")
    private String email;

    private String phoneNumber;

    @NotNull(message = "Status is required")
    private UserStatus status;
}
