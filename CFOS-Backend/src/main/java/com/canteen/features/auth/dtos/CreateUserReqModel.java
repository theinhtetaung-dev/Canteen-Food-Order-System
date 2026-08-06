package com.canteen.features.auth.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserReqModel {
    private Integer roleId;

    @NotBlank(message = "Username is required")
    @jakarta.validation.constraints.Pattern(regexp = "^\\S+$", message = "Username cannot contain spaces")
    private String userName;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String phoneNumber;
}
