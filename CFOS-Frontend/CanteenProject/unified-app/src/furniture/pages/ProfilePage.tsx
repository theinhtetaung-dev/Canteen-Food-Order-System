import { PageContainer } from "@furniture/components/layout/PageContainer";
import { ProfileForm } from "@furniture/components/auth/ProfileForm";

export default function ProfilePage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="mb-8 text-sm text-gray-500">
          Update your personal details below.
        </p>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <ProfileForm />
        </div>
      </div>
    </PageContainer>
  );
}
