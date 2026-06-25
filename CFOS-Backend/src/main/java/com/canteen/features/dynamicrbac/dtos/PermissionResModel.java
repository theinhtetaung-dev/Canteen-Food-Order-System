package com.canteen.features.dynamicrbac.dtos;

import lombok.Data;

@Data
public class PermissionResModel {
    private Integer permissionId;
    private String menuName;
    private String actionName;
}
