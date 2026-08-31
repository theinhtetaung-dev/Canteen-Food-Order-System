import React, { useState, useMemo, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Receipt,
  Users,
  Shield,
  ShieldCheck,
  RotateCcw,
  Layers,
  Activity,
  CheckCircle2,
  Info,
  AlertTriangle
} from 'lucide-react';

// Database Schema mappings
interface Role {
  roleId: number;
  roleName: string;
  description: string;
}

interface Permission {
  permissionId: number;
  menuName: string;
  actionName: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  label: string;
  description: string;
}

interface RolePermission {
  roleId: number;
  permissionId: number;
}

// 1. Roles Seed Data (Tbl_Role)
const ROLES: Role[] = [
  { roleId: 2, roleName: 'Admin', description: 'System Administrator with full access options.' },
  { roleId: 3, roleName: 'Canteen Admin', description: 'Manage food menu items, categories, and process incoming canteen orders.' },
  { roleId: 4, roleName: 'Student / User', description: 'Browse menu categories, place orders, and review personal transaction logs.' },
  { roleId: 5, roleName: 'Professor', description: 'Browse menu categories and view personal transaction logs.' },
];

// 2. Permissions Seed Data (Tbl_Permission)
const ALL_PERMISSIONS: Permission[] = [
  // Dashboard Module
  { permissionId: 1, menuName: 'Dashboard', actionName: 'READ', label: 'View Dashboard', description: 'Access dashboard metrics and summary cards' },
  
  // Canteen Management Module
  { permissionId: 2, menuName: 'Canteen Management', actionName: 'CREATE', label: 'Create Canteen', description: 'Add new canteens/branches' },
  { permissionId: 3, menuName: 'Canteen Management', actionName: 'READ', label: 'Read Canteen', description: 'View canteens and locations' },
  { permissionId: 4, menuName: 'Canteen Management', actionName: 'UPDATE', label: 'Update Canteen', description: 'Edit canteen details' },
  { permissionId: 5, menuName: 'Canteen Management', actionName: 'DELETE', label: 'Delete Canteen', description: 'Remove canteens from system' },

  // Food Category & Menu Module
  { permissionId: 6, menuName: 'Food Category & Menu', actionName: 'CREATE', label: 'Create Menu', description: 'Create food categories and menu items' },
  { permissionId: 7, menuName: 'Food Category & Menu', actionName: 'READ', label: 'Read Menu', description: 'View menu catalog and category listings' },
  { permissionId: 8, menuName: 'Food Category & Menu', actionName: 'UPDATE', label: 'Update Menu', description: 'Edit item prices, descriptions and availability' },
  { permissionId: 9, menuName: 'Food Category & Menu', actionName: 'DELETE', label: 'Delete Menu', description: 'Remove menu categories and food items' },

  // Orders & POS Module
  { permissionId: 10, menuName: 'Orders & POS', actionName: 'CREATE', label: 'Create Order', description: 'Create and place new orders' },
  { permissionId: 11, menuName: 'Orders & POS', actionName: 'READ', label: 'View Orders', description: 'Access transaction lists and order logs' },
  { permissionId: 12, menuName: 'Orders & POS', actionName: 'UPDATE', label: 'Process/Update Order', description: 'Update order status and handle refunds' },
  { permissionId: 13, menuName: 'Orders & POS', actionName: 'DELETE', label: 'Delete Order', description: 'Cancel and hard-delete orders' },

  // User Management Module
  { permissionId: 14, menuName: 'User Management', actionName: 'CREATE', label: 'Add User/Admin', description: 'Add new kitchen admins and student accounts' },
  { permissionId: 15, menuName: 'User Management', actionName: 'READ', label: 'View Users', description: 'Read student and admin details and status' },
  { permissionId: 16, menuName: 'User Management', actionName: 'UPDATE', label: 'Update User/Reset', description: 'Edit user accounts and reset passwords' },
  { permissionId: 17, menuName: 'User Management', actionName: 'DELETE', label: 'Delete User', description: 'Remove users from system' },

  // Role & Permission System Module
  { permissionId: 18, menuName: 'Role & Permission System', actionName: 'CREATE', label: 'Create Roles', description: 'Create new user system roles' },
  { permissionId: 19, menuName: 'Role & Permission System', actionName: 'READ', label: 'Read Roles & Perms', description: 'View system permissions and roles matrix' },
  { permissionId: 20, menuName: 'Role & Permission System', actionName: 'UPDATE', label: 'Edit Permissions', description: 'Toggle permissions for specific roles' },
  { permissionId: 21, menuName: 'Role & Permission System', actionName: 'DELETE', label: 'Delete Roles', description: 'Delete user system roles' },
];

// Initial Junction Table mapping (Tbl_RolePermission seed)
const INITIAL_ROLE_PERMISSIONS: RolePermission[] = [
  // Canteen Admin: Dashboard Read, Canteen Management Read & Update, Food Category & Menu All, Orders All, User Management Read & Update
  { roleId: 3, permissionId: 1 },  // Dashboard READ
  { roleId: 3, permissionId: 3 },  // Canteen READ
  { roleId: 3, permissionId: 4 },  // Canteen UPDATE
  { roleId: 3, permissionId: 6 },  // Food CREATE
  { roleId: 3, permissionId: 7 },  // Food READ
  { roleId: 3, permissionId: 8 },  // Food UPDATE
  { roleId: 3, permissionId: 9 },  // Food DELETE
  { roleId: 3, permissionId: 10 }, // Orders CREATE
  { roleId: 3, permissionId: 11 }, // Orders READ
  { roleId: 3, permissionId: 12 }, // Orders UPDATE
  { roleId: 3, permissionId: 13 }, // Orders DELETE
  { roleId: 3, permissionId: 15 }, // User READ
  { roleId: 3, permissionId: 16 }, // User UPDATE
  { roleId: 3, permissionId: 19 }, // Role READ

  // Student / User: Dashboard Read, Canteen Read, Food Read, Orders Create & Read, User Read
  { roleId: 4, permissionId: 1 },  // Dashboard READ
  { roleId: 4, permissionId: 3 },  // Canteen READ
  { roleId: 4, permissionId: 7 },  // Food READ
  { roleId: 4, permissionId: 10 }, // Orders CREATE
  { roleId: 4, permissionId: 11 }, // Orders READ
  { roleId: 4, permissionId: 15 }, // User READ

  // Professor: Dashboard Read, Food Read
  { roleId: 5, permissionId: 1 },  // Dashboard READ
  { roleId: 5, permissionId: 7 },  // Food READ
];

const swalSuccessClass = {
  popup: 'rounded-2xl border border-gray-100 p-6 shadow-xl bg-white font-sans',
  title: 'text-lg font-bold text-gray-900',
  htmlContainer: 'text-xs text-gray-500 mt-2 font-medium leading-relaxed',
};

// Custom iOS style Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label 
      className={`flex items-center gap-3 cursor-pointer select-none transition-opacity ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'
      }`}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          className="sr-only"
          disabled={disabled}
        />
        <div
          className={`w-10 h-5.5 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-[#7ca038]' : 'bg-slate-200'
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-4.5' : 'translate-x-0'
          }`}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </label>
  );
};

export const Permissions: React.FC = () => {
  const [activeRoleId, setActiveRoleId] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // DB States
  const [savedRolePermissions, setSavedRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);
  // UI Draft State
  const [draftRolePermissions, setDraftRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);

  useEffect(() => {
    const fetchAllRolePermissions = async () => {
      setIsLoading(true);
      try {
        const { api } = await import('@user/api/axios');
        const tempPermissions: RolePermission[] = [];
        for (const r of ROLES) {
          const { data } = await api.get(`/api/rbac/roles/${r.roleId}/permissions`);
          if (data && data.permissions) {
            data.permissions.forEach((p: any) => {
              tempPermissions.push({ roleId: r.roleId, permissionId: p.permissionId });
            });
          }
        }
        setSavedRolePermissions(tempPermissions);
        setDraftRolePermissions(tempPermissions);
      } catch (err) {
        console.error("Failed to load permissions from server", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllRolePermissions();
  }, []);

  // Sync Draft State with active RoleID or database updates
  const activePermissions = useMemo(() => {
    return draftRolePermissions
      .filter((rp) => rp.roleId === activeRoleId)
      .map((rp) => rp.permissionId);
  }, [draftRolePermissions, activeRoleId]);

  // Compute Unsaved Changes by comparing Saved vs Draft
  const hasUnsavedChanges = useMemo(() => {
    if (draftRolePermissions.length !== savedRolePermissions.length) return true;
    
    // Sort & Check if every draft element is present in saved
    const draftKeys = draftRolePermissions.map(rp => `${rp.roleId}-${rp.permissionId}`).sort();
    const savedKeys = savedRolePermissions.map(rp => `${rp.roleId}-${rp.permissionId}`).sort();
    
    return !draftKeys.every((val, index) => val === savedKeys[index]);
  }, [draftRolePermissions, savedRolePermissions]);

  // Modules Grouping Helper
  const modulesList = useMemo(() => {
    const uniqueMenuNames = Array.from(new Set(ALL_PERMISSIONS.map(p => p.menuName)));
    
    const iconMap: Record<string, React.ReactNode> = {
      'Dashboard': <LayoutDashboard className="w-5 h-5 text-indigo-500" />,
      'Canteen Management': <Store className="w-5 h-5 text-emerald-500" />,
      'Food Category & Menu': <UtensilsCrossed className="w-5 h-5 text-amber-500" />,
      'Orders & POS': <Receipt className="w-5 h-5 text-blue-500" />,
      'User Management': <Users className="w-5 h-5 text-rose-500" />,
      'Role & Permission System': <Shield className="w-5 h-5 text-purple-500" />,
    };

    const descMap: Record<string, string> = {
      'Dashboard': 'Access to view administrative logs, analytical trends, and sales summaries.',
      'Canteen Management': 'Add, edit, structure, or disable canteen profiles, details, and schedules.',
      'Food Category & Menu': 'Handle item catalogs, categorization, pricing grids, and availability cycles.',
      'Orders & POS': 'Manage POS checkout processes, handle checkout, order processing, and sales queues.',
      'User Management': 'Administer student registration profiles, kitchen managers, and system admins.',
      'Role & Permission System': 'Maintain configuration matrices, role settings, and feature toggles.',
    };

    return uniqueMenuNames.map(menuName => {
      const perms = ALL_PERMISSIONS.filter(p => p.menuName === menuName);
      return {
        menuName,
        icon: iconMap[menuName] || <Shield className="w-5 h-5 text-slate-500" />,
        description: descMap[menuName] || 'Configure permission toggles and custom flags.',
        permissions: perms
      };
    });
  }, []);

  // Compute KPI Statistics
  const activeRoleName = useMemo(() => {
    return ROLES.find(r => r.roleId === activeRoleId)?.roleName || 'Role';
  }, [activeRoleId]);

  const stats = useMemo(() => {
    const roleDraftPerms = draftRolePermissions.filter(rp => rp.roleId === activeRoleId);
    const totalActiveCount = roleDraftPerms.length;
    
    // Modules count where at least one permission ID is checked
    const enabledModulesCount = modulesList.filter(mod => {
      return mod.permissions.some(p => roleDraftPerms.some(rp => rp.permissionId === p.permissionId));
    }).length;

    return {
      enabledModulesCount,
      totalActiveCount
    };
  }, [draftRolePermissions, activeRoleId, modulesList]);

  // Master Toggles
  const handleGrantAll = () => {
    const otherRoles = draftRolePermissions.filter(rp => rp.roleId !== activeRoleId);
    const allActivePermissions = ALL_PERMISSIONS.map(p => ({ roleId: activeRoleId, permissionId: p.permissionId }));
    
    setDraftRolePermissions([...otherRoles, ...allActivePermissions]);
  };

  const handleRevokeAll = () => {
    const otherRoles = draftRolePermissions.filter(rp => rp.roleId !== activeRoleId);
    setDraftRolePermissions(otherRoles);
  };

  // Switch Toggles
  const handleTogglePermission = (permissionId: number, isChecked: boolean) => {
    if (isChecked) {
      // Toggle ON: Add a simulated junction row Tbl_RolePermission
      setDraftRolePermissions(prev => [...prev, { roleId: activeRoleId, permissionId }]);
    } else {
      // Toggle OFF: Remove row from junction table Tbl_RolePermission
      setDraftRolePermissions(prev => prev.filter(rp => !(rp.roleId === activeRoleId && rp.permissionId === permissionId)));
    }
  };

  // Module Level "Select All"
  const handleModuleSelectAll = (menuName: string, checked: boolean) => {
    const modPermIds = ALL_PERMISSIONS.filter(p => p.menuName === menuName).map(p => p.permissionId);
    const otherPerms = draftRolePermissions.filter(rp => !(rp.roleId === activeRoleId && modPermIds.includes(rp.permissionId)));
    
    if (checked) {
      const addedPerms = modPermIds.map(id => ({ roleId: activeRoleId, permissionId: id }));
      setDraftRolePermissions([...otherPerms, ...addedPerms]);
    } else {
      setDraftRolePermissions(otherPerms);
    }
  };

  // Reset Changes
  const handleReset = () => {
    setDraftRolePermissions([...savedRolePermissions]);
  };

  // Save changes to database simulation
  const handleSaveMatrix = async () => {
    setIsSaving(true);
    try {
      const { api } = await import('@user/api/axios');
      const activePermIds = draftRolePermissions
        .filter((rp) => rp.roleId === activeRoleId)
        .map((rp) => rp.permissionId);

      await api.post(`/api/rbac/roles/${activeRoleId}/permissions`, {
        permissionIds: activePermIds
      });

      setSavedRolePermissions([...draftRolePermissions]);
      
      Swal.fire({
        title: 'Permissions Saved!',
        text: `Access rights for "${activeRoleName}" have been updated successfully.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
        buttonsStyling: false,
        width: '420px',
        customClass: swalSuccessClass
      });
    } catch (err) {
      console.error("Failed to save permissions", err);
      Swal.fire({
        title: 'Save Failed',
        text: 'An error occurred while saving the permissions.',
        icon: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6 relative pb-28 font-sans">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Role Permission & Access Control
        </h2>
      </div>

      {/* Role Selector Segmented Control / Tabs */}
      <div className="bg-slate-100/80 border border-slate-200/40 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1">
        {ROLES.map((role) => {
          const isActive = role.roleId === activeRoleId;
          return (
            <button
              key={role.roleId}
              onClick={() => setActiveRoleId(role.roleId)}
              className={`flex-1 px-5 py-3 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                isActive
                  ? 'bg-white text-[#7ca038] shadow-sm ring-1 ring-slate-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <span>{role.roleName}</span>
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-[#7ca038]/70' : 'text-slate-400'}`}>
                {role.roleId === 3 ? 'Canteen Only' : role.roleId === 4 ? 'Student Tier' : 'Professor Tier'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Role Description Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 flex gap-3.5 items-start">
        <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
          <Info className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Active Configuration Profile: {activeRoleName}
          </h4>
          <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
            {ROLES.find(r => r.roleId === activeRoleId)?.description}
          </p>
        </div>
      </div>

      {/* Summary KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modules Enabled</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.enabledModulesCount} / 6</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Permissions</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalActiveCount} / 21</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center sm:text-left">Quick Actions</span>
          <div className="flex gap-2">
            <button
              onClick={handleGrantAll}
              className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg transition-colors uppercase tracking-wider"
            >
              Grant All
            </button>
            <button
              onClick={handleRevokeAll}
              className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg transition-colors uppercase tracking-wider"
            >
              Revoke All
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Matrix grouped by MenuName */}
      <div className="space-y-5">
        {modulesList.map((module) => {
          // Check if all available actions in this module are checked
          const modActivePerms = module.permissions.map(p => p.permissionId);
          const isAllChecked = modActivePerms.every(id => activePermissions.includes(id));
          const isSomeChecked = modActivePerms.some(id => activePermissions.includes(id)) && !isAllChecked;

          return (
            <div 
              key={module.menuName}
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300/80 transition-all duration-200"
            >
              {/* Module Header Card */}
              <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/40 border-b border-slate-100">
                <div className="flex gap-3.5 items-start">
                  <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0 mt-0.5">
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
                      {module.menuName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed max-w-xl">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Local select all toggles */}
                <div className="self-end sm:self-center">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllChecked}
                      ref={el => {
                        if (el) {
                          el.indeterminate = isSomeChecked;
                        }
                      }}
                      onChange={(e) => handleModuleSelectAll(module.menuName, e.target.checked)}
                      className="rounded text-[#7ca038] focus:ring-[#7ca038]/30 border-slate-300 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select All</span>
                  </label>
                </div>
              </div>

              {/* Toggles switches grid */}
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80">
                  {/* CREATE ACTION */}
                  {(() => {
                    const perm = module.permissions.find(p => p.actionName === 'CREATE');
                    return perm ? (
                      <ToggleSwitch
                        checked={activePermissions.includes(perm.permissionId)}
                        onChange={(val) => handleTogglePermission(perm.permissionId, val)}
                        label="Create"
                      />
                    ) : (
                      <div className="opacity-25 flex items-center gap-3 select-none">
                        <div className="w-10 h-5.5 rounded-full bg-slate-200" />
                        <span className="text-xs font-semibold text-slate-400">Create (N/A)</span>
                      </div>
                    );
                  })()}

                  {/* READ ACTION */}
                  {(() => {
                    const perm = module.permissions.find(p => p.actionName === 'READ');
                    return perm ? (
                      <ToggleSwitch
                        checked={activePermissions.includes(perm.permissionId)}
                        onChange={(val) => handleTogglePermission(perm.permissionId, val)}
                        label="Read / View"
                      />
                    ) : (
                      <div className="opacity-25 flex items-center gap-3 select-none">
                        <div className="w-10 h-5.5 rounded-full bg-slate-200" />
                        <span className="text-xs font-semibold text-slate-400">Read / View (N/A)</span>
                      </div>
                    );
                  })()}

                  {/* UPDATE ACTION */}
                  {(() => {
                    const perm = module.permissions.find(p => p.actionName === 'UPDATE');
                    return perm ? (
                      <ToggleSwitch
                        checked={activePermissions.includes(perm.permissionId)}
                        onChange={(val) => handleTogglePermission(perm.permissionId, val)}
                        label="Update / Edit"
                      />
                    ) : (
                      <div className="opacity-25 flex items-center gap-3 select-none">
                        <div className="w-10 h-5.5 rounded-full bg-slate-200" />
                        <span className="text-xs font-semibold text-slate-400">Update / Edit (N/A)</span>
                      </div>
                    );
                  })()}

                  {/* DELETE ACTION */}
                  {(() => {
                    const perm = module.permissions.find(p => p.actionName === 'DELETE');
                    return perm ? (
                      <ToggleSwitch
                        checked={activePermissions.includes(perm.permissionId)}
                        onChange={(val) => handleTogglePermission(perm.permissionId, val)}
                        label="Delete"
                      />
                    ) : (
                      <div className="opacity-25 flex items-center gap-3 select-none">
                        <div className="w-10 h-5.5 rounded-full bg-slate-200" />
                        <span className="text-xs font-semibold text-slate-400">Delete (N/A)</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Floating Footer Save Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-4 md:left-[calc(256px+2.5rem)] right-4 md:right-[2.5rem] z-50 pointer-events-none flex justify-center">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-2xl w-full pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800">Unsaved Changes</h5>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  You have changed the access matrix for "{activeRoleName}".
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Changes
              </button>
              <button
                onClick={handleSaveMatrix}
                disabled={isSaving}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#7ca038] hover:bg-[#6a8b2e] text-white text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-75"
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Save Permission Matrix
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
