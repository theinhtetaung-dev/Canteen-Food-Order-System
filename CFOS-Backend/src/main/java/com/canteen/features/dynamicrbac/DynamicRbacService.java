package com.canteen.features.dynamicrbac;

import com.canteen.features.dynamicrbac.dtos.AssignPermissionsReqModel;
import com.canteen.features.dynamicrbac.dtos.PermissionResModel;
import com.canteen.features.dynamicrbac.dtos.RolePermissionResModel;
import com.canteen.model.Permission;
import com.canteen.model.Role;
import com.canteen.model.RolePermission;
import com.canteen.repository.PermissionRepository;
import com.canteen.repository.RolePermissionRepository;
import com.canteen.repository.RoleRepository;
import com.canteen.utils.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DynamicRbacService {

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    public List<PermissionResModel> getAllPermissions() {
        return permissionRepository.findByDeleteFlagFalse().stream().map(this::mapToPermissionResModel).collect(Collectors.toList());
    }

    public RolePermissionResModel getRolePermissions(Integer roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        List<RolePermission> rolePermissions = rolePermissionRepository.findByRole_RoleId(roleId);
        
        List<PermissionResModel> permissions = rolePermissions.stream()
                .map(rp -> mapToPermissionResModel(rp.getPermission()))
                .collect(Collectors.toList());

        RolePermissionResModel res = new RolePermissionResModel();
        res.setRoleId(role.getRoleId());
        res.setRoleName(role.getRoleName());
        res.setPermissions(permissions);
        return res;
    }

    @Transactional
    public void assignPermissionsToRole(Integer roleId, AssignPermissionsReqModel reqModel) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        // Delete existing permissions for this role
        rolePermissionRepository.deleteByRole_RoleId(roleId);

        // Map and save new permissions
        List<Integer> permissionIds = reqModel.getPermissionIds();
        if (permissionIds != null && !permissionIds.isEmpty()) {
            List<Permission> permissions = permissionRepository.findAllById(permissionIds);
            
            List<RolePermission> newRolePermissions = permissions.stream().map(permission -> {
                RolePermission rp = new RolePermission();
                rp.setRole(role);
                rp.setPermission(permission);
                return rp;
            }).collect(Collectors.toList());

            rolePermissionRepository.saveAll(newRolePermissions);
        }
    }

    private PermissionResModel mapToPermissionResModel(Permission permission) {
        PermissionResModel model = new PermissionResModel();
        model.setPermissionId(permission.getPermissionId());
        model.setMenuName(permission.getMenuName());
        model.setActionName(permission.getActionName());
        return model;
    }
}
