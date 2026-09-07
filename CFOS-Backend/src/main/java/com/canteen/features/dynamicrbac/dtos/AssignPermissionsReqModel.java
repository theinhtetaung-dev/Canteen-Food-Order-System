package com.canteen.features.dynamicrbac.dtos;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class AssignPermissionsReqModel {
    @NotNull(message = "Permission IDs are required")
    private List<Integer> permissionIds;
}
