package com.canteen.features.dynamicrbac.dtos;

import lombok.Data;
import java.util.List;

@Data
public class RolePermissionResModel {
    private Integer roleId;
    private String roleName;
    private List<PermissionResModel> permissions;
}
