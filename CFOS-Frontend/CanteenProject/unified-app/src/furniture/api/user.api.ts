import { api } from "@furniture/api/axios";

export interface StudentUser {
  id: string;
  rollNo: string;
  userName: string;
  phone: string;
  status: 'Active' | 'Inactive';
  joinedOn: string;
  batch: string;
}

export async function fetchStudents(): Promise<StudentUser[]> {
  const { data } = await api.get<any>("/api/users?size=1000");
  const users = data.content || data;
  return users
    .filter((u: any) => u.roleName && u.roleName.toLowerCase() === "user")
    .map((u: any) => ({
      id: u.userName,
      rollNo: u.userName,
      userName: u.fullName || u.userName,
      phone: u.phoneNumber || "+959 000 0000",
      status: 'Active',
      joinedOn: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString(),
      batch: 'All Categories',
    }));
}

export async function fetchKitchenAdmins(): Promise<any[]> {
  const { data } = await api.get<any>("/api/users?size=1000");
  const users = data.content || data;
  return users
    .filter((u: any) => u.roleName && u.roleName.toLowerCase() === "manager")
    .map((u: any) => ({
      id: u.userName,
      adminId: u.userName,
      avatar: (u.fullName || u.userName).substring(0, 2).toUpperCase(),
      isAvatarText: true,
      restaurant: u.canteenName || '—',
      canteenId: u.canteenId ?? null,
      phone: u.phoneNumber || '+959 000 0000',
      status: 'Active',
      joinedOn: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString(),
    }));
}

export async function createKitchenAdmin(payload: {
  staffId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  canteenId: number;
}): Promise<void> {
  await api.post("/api/users", {
    userName: payload.staffId,
    fullName: payload.name,
    email: payload.email,
    password: payload.password,
    phoneNumber: payload.phone,
    roleName: "Manager",
    canteenId: payload.canteenId,
  });
}

export async function resetUserPassword(userId: string): Promise<void> {
  // Typical endpoint for password reset by admin
  await api.post(`/api/users/${userId}/reset-password`);
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/api/users/${userId}`);
}
