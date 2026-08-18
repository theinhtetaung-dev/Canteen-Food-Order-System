import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { axiosPrivate } from '../../api/axios';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, RefreshCw } from 'lucide-react';

interface Permission {
  permissionId: number;
  menuName: string;
  actionName: string;
}

interface Role {
  roleId: number;
  roleName: string;
  description: string;
}

const ROLES: Role[] = [
  { roleId: 1, roleName: 'Admin', description: 'Full system administration, settings, and user access controls.' },
  { roleId: 2, roleName: 'Manager', description: 'Can manage food catalog, categories, orders, and view stats.' },
  { roleId: 3, roleName: 'User', description: 'Can browse menu, manage cart, place orders, and view order history.' },
];

const AdminRbac = () => {
  const { user } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState<number>(2); // Default to Manager (so they can see enabled toggles first)
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedRole = ROLES.find(r => r.roleId === selectedRoleId);
  const isOwnRole = selectedRole?.roleName === user?.role;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch all available system permissions
        const permRes = await axiosPrivate.get<Permission[]>('/rbac/permissions');
        setAllPermissions(permRes.data);

        // 2. Fetch assigned permissions for the default selected role
        await fetchRolePermissions(selectedRoleId);
      } catch (error) {
        console.error('Error loading RBAC data', error);
        toast.error('Failed to load RBAC permissions list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const rolePermRes = await axiosPrivate.get<{ permissions: Permission[] }>(`/rbac/roles/${roleId}/permissions`);
      const assignedIds = new Set(rolePermRes.data.permissions.map(p => p.permissionId));
      setAssignedPermissionIds(assignedIds);
    } catch (error) {
      console.error('Error fetching role permissions', error);
      toast.error('Failed to fetch permissions for the selected role');
    }
  };

  const handleRoleChange = async (roleId: number) => {
    setSelectedRoleId(roleId);
    setIsLoading(true);
    await fetchRolePermissions(roleId);
    setIsLoading(false);
  };

  const handleTogglePermission = async (permissionId: number, isCurrentlyAssigned: boolean) => {
    if (isOwnRole) {
      toast.error('Lockout Prevention: You cannot modify permissions of your own role.');
      return;
    }

    setIsUpdating(true);
    const newAssignedIds = new Set(assignedPermissionIds);
    if (isCurrentlyAssigned) {
      newAssignedIds.delete(permissionId);
    } else {
      newAssignedIds.add(permissionId);
    }

    try {
      // POST /api/rbac/roles/{roleId}/permissions with { permissionIds: [...] }
      await axiosPrivate.post(`/rbac/roles/${selectedRoleId}/permissions`, {
        permissionIds: Array.from(newAssignedIds)
      });

      setAssignedPermissionIds(newAssignedIds);
      toast.success(isCurrentlyAssigned ? 'Permission revoked successfully' : 'Permission assigned successfully');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update role permissions';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Group permissions by menuName (e.g. Food, Order, Payment)
  const groupedPermissions = allPermissions.reduce((acc: Record<string, Permission[]>, perm) => {
    if (!acc[perm.menuName]) {
      acc[perm.menuName] = [];
    }
    acc[perm.menuName].push(perm);
    return acc;
  }, {});

  // Predefined actions sort order for consistent grid layout
  const actionSortOrder = ['Create', 'Read', 'Update', 'Delete'];
  const getSortedPermissions = (perms: Permission[]) => {
    return [...perms].sort((a, b) => {
      const indexA = actionSortOrder.indexOf(a.actionName);
      const indexB = actionSortOrder.indexOf(b.actionName);
      return (indexA > -1 ? indexA : 99) - (indexB > -1 ? indexB : 99);
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Create': return 'text-green-600 bg-green-50 border-green-200';
      case 'Read': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Update': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Delete': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">RBAC Management</h2>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Saving changes...
          </div>
        )}
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map((role) => {
          const isActive = role.roleId === selectedRoleId;
          const isRoleOwn = role.roleName === user?.role;
          return (
            <button
              key={role.roleId}
              onClick={() => handleRoleChange(role.roleId)}
              className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-orange-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-base">{role.roleName}</span>
                {isRoleOwn && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                    Your Role
                  </span>
                )}
              </div>
              <p className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                {role.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Warning Alert for Own Role */}
      {isOwnRole && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Self-Modification Restrict Rule</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              You are currently logged in with the <strong>{user?.role}</strong> role. To prevent accidental lockouts, changing permissions of your own active role is disabled. Select a different role to configure its access policies.
            </p>
          </div>
        </div>
      )}

      {/* Permissions Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedPermissions).map(([menuName, perms]) => (
            <div key={menuName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase">
                  {menuName} Operations
                </h3>
                <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {perms.length} actions
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-4">
                {getSortedPermissions(perms).map((perm) => {
                  const isAssigned = assignedPermissionIds.has(perm.permissionId);
                  return (
                    <div key={perm.permissionId} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getActionColor(perm.actionName)}`}>
                          {perm.actionName}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {perm.menuName}
                        </span>
                      </div>

                      {/* Toggle Switch */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          disabled={isOwnRole || isUpdating}
                          onClick={() => handleTogglePermission(perm.permissionId, isAssigned)}
                          className={`${
                            isAssigned ? 'bg-orange-600' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            isOwnRole ? 'opacity-50 cursor-not-allowed' : ''
                          } ${isUpdating ? 'cursor-wait' : ''}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`${
                              isAssigned ? 'translate-x-5' : 'translate-x-0'
                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRbac;
