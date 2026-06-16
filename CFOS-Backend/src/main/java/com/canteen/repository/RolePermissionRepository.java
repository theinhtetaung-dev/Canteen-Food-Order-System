package com.canteen.repository;

import com.canteen.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {
    List<RolePermission> findByRole_RoleId(Integer roleId);
    void deleteByRole_RoleId(Integer roleId);
}
