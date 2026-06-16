package com.canteen.features.dynamicrbac;

import com.canteen.features.dynamicrbac.dtos.AssignPermissionsReqModel;
import com.canteen.features.dynamicrbac.dtos.PermissionResModel;
import com.canteen.features.dynamicrbac.dtos.RolePermissionResModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rbac")
public class DynamicRbacController {

    @Autowired
    private DynamicRbacService dynamicRbacService;

    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionResModel>> getAllPermissions() {
        return ResponseEntity.ok(dynamicRbacService.getAllPermissions());
    }

    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<RolePermissionResModel> getRolePermissions(@PathVariable Integer roleId) {
        return ResponseEntity.ok(dynamicRbacService.getRolePermissions(roleId));
    }

    @PostMapping("/roles/{roleId}/permissions")
    public ResponseEntity<String> assignPermissionsToRole(
            @PathVariable Integer roleId,
            @RequestBody AssignPermissionsReqModel reqModel) {
        dynamicRbacService.assignPermissionsToRole(roleId, reqModel);
        return ResponseEntity.ok("Permissions assigned successfully.");
    }
}
