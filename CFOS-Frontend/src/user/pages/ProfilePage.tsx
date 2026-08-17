import { useNavigate } from "react-router-dom";
import { useAuth } from "@user/hooks/useAuth";
import { PageContainer } from "@user/components/layout/PageContainer";
import { ProfileLayout } from "@user/components/auth/ProfileLayout";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <ProfileLayout
          roleBadgeLabel="Student"
          idFieldLabel="User ID"
          showLogoutBanner={true}
          onLogout={handleLogout}
        />
      </div>
    </PageContainer>
  );
}
