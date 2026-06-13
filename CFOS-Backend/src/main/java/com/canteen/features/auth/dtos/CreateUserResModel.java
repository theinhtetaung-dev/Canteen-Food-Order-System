package com.canteen.features.auth.dtos;

import lombok.Data;

@Data
public class CreateUserResModel {
    private Integer userId;
    private String userName;
    private String message;
}
