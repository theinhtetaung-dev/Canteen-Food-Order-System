package com.canteen.features.auth.dtos;

import lombok.Data;

@Data
public class LoginResModel {
    private String token;
    private String userName;
    private String role;
}
