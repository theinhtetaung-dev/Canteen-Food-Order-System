package com.canteen.features.auth.dtos;

import lombok.Data;

@Data
public class CreateUserResModel {
    private String userName;
    private String fullName;
    private String message;
}
