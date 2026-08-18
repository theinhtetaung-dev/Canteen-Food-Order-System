import React from "react";
import { ProfileLayout } from "@user/components/auth/ProfileLayout";

export const Profile: React.FC = () => {
  return (
    <div className="p-8 bg-[#fdfefb] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <ProfileLayout
          roleBadgeLabel="Canteen Manager"
          idFieldLabel="Staff ID"
          showLogoutBanner={true}
        />
      </div>
    </div>
  );
};

export default Profile;
