package com.canteen.features.auth.dtos;

import lombok.Data;

@Data
public class UpdateUserResModel {
    private Integer userId;
    private String userName;
    private String message;
}
