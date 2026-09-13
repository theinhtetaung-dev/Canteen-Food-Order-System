package com.canteen.features.auth.dtos;

import java.util.List;
import lombok.Data;

@Data
public class LoginResModel {
    private String token;
    private String userName;
    private String role;
    private Integer roleId;
    private List<String> permissions;
}

