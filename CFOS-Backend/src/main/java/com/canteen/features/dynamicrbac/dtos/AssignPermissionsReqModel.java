package com.canteen.features.dynamicrbac.dtos;

import lombok.Data;
import java.util.List;

@Data
public class AssignPermissionsReqModel {
    private List<Integer> permissionIds;
}
