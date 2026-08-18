import { api } from "@user/api/axios";

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
      id: String(u.userId),
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

export interface ReportUser {
  userId: number;
  userName: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  roleName: string;
  status: 'ACTIVE' | 'INACTIVE';
  deleteFlag: boolean;
  createdAt: string;
  canteenId: number | null;
  canteenName: string | null;
}

export async function fetchAllUsers(): Promise<ReportUser[]> {
  const { data } = await api.get<any>("/api/users?size=1000");
  const users = data.content || data;
  return users.map((u: any) => ({
    userId: u.userId,
    userName: u.userName,
    fullName: u.fullName || u.userName,
    email: u.email || null,
    phoneNumber: u.phoneNumber || null,
    roleName: u.roleName || "User",
    status: u.status || "ACTIVE",
    deleteFlag: !!u.deleteFlag,
    createdAt: u.createdAt || new Date().toISOString(),
    canteenId: u.canteenId || null,
    canteenName: u.canteenName || null,
  }));
}

export async function fetchKitchenAdmins(): Promise<any[]> {
  const { data } = await api.get<any>("/api/users?size=1000");
  const users = data.content || data;
  return users
    .filter((u: any) => u.roleName && u.roleName.toLowerCase() === "manager")
    .map((u: any) => ({
      id: String(u.userId),
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

export async function createProfessor(payload: {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
}): Promise<void> {
  await api.post("/api/users", {
    userName: payload.username,
    fullName: payload.fullName,
    email: payload.email,
    password: "1234567890a",
    phoneNumber: payload.phone,
    roleName: "User",
  });
}


export async function resetUserPassword(userId: string): Promise<void> {
  // Typical endpoint for password reset by admin
  await api.post(`/api/users/${userId}/reset-password`);
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/api/users/${userId}`);
}
