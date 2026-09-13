package com.canteen.features.dynamicrbac;

import com.canteen.features.dynamicrbac.dtos.AssignPermissionsReqModel;
import com.canteen.features.dynamicrbac.dtos.PermissionResModel;
import com.canteen.features.dynamicrbac.dtos.RolePermissionResModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/rbac")
public class DynamicRbacController {

    @Autowired
    private DynamicRbacService dynamicRbacService;

    @GetMapping("/permissions")
    public ResponseEntity<?> getAllPermissions(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"SuperAdmin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only SuperAdmin can manage role permissions.");
        }
        return ResponseEntity.ok(dynamicRbacService.getAllPermissions());
    }

    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<?> getRolePermissions(@PathVariable Integer roleId, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"SuperAdmin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only SuperAdmin can manage role permissions.");
        }
        return ResponseEntity.ok(dynamicRbacService.getRolePermissions(roleId));
    }

    @PostMapping("/roles/{roleId}/permissions")
    public ResponseEntity<String> assignPermissionsToRole(
            @PathVariable Integer roleId,
            @Valid @RequestBody AssignPermissionsReqModel reqModel,
            HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"SuperAdmin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only SuperAdmin can modify role permissions.");
        }
        dynamicRbacService.assignPermissionsToRole(roleId, reqModel);
        return ResponseEntity.ok("Permissions assigned successfully.");
    }
}
