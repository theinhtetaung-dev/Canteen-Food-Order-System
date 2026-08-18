package com.canteen.features.auth.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserReqModel {
    private Integer roleId;
    private String roleName;

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

    // Optional: links the user to a canteen (used for Canteen Admin creation)
    private Integer canteenId;
}
