import React from "react";
import { Shield } from "lucide-react";
import { ProfileLayout } from "@user/components/auth/ProfileLayout";

const SUPERADMIN_PERMISSIONS = [
  "Full Menu Management",
  "Staff Payroll & Scheduling",
  "Inventory Procurement",
  "Global Settings Access",
  "User & Role Management",
];

export const AdminProfile: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ProfileLayout
        roleBadgeLabel="Super Admin"
        idFieldLabel="Staff ID"
        showLogoutBanner={true}
        sideCard={{
          icon: Shield,
          title: "Role & Access",
          primaryRole: "Super Administrator",
          permissions: SUPERADMIN_PERMISSIONS,
        }}
      />
    </div>
  );
};

export default AdminProfile;
