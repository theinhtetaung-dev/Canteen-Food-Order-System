package com.canteen.features.dynamicrbac.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class AssignPermissionsReqModel {
    @NotEmpty(message = "Permission IDs are required")
    private List<Integer> permissionIds;
}
