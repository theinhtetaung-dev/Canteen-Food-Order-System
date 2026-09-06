import com.canteen.model.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {
    List<RolePermission> findByRole_RoleId(Integer roleId);
    void deleteByRole_RoleId(Integer roleId);

    @Query("SELECT rp FROM RolePermission rp JOIN FETCH rp.permission WHERE rp.role.roleId = :roleId")
    List<RolePermission> findByRoleIdWithPermissions(@Param("roleId") Integer roleId);
}
