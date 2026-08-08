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

export interface KitchenAdmin {
  id: string;
  staffId: string;
  name: string;
  phone: string;
  status: 'Active' | 'Inactive';
  assignedCanteen: 'Canteen 1 (Main)' | 'Canteen 2 (North)';
  joinedOn: string;
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
      joinedOn: new Date().toLocaleDateString(),
      batch: 'All Categories',
    }));
}

export async function fetchKitchenAdmins(): Promise<KitchenAdmin[]> {
  const { data } = await api.get<any>("/api/users?size=1000");
  const users = data.content || data;
  return users
    .filter((u: any) => u.roleName && u.roleName.toLowerCase() === "manager")
    .map((u: any) => ({
      id: u.userName,
      staffId: u.userName,
      name: u.fullName || u.userName,
      phone: u.phoneNumber || "+959 000 0000",
      status: 'Active',
      assignedCanteen: 'Canteen 1 (Main)',
      joinedOn: new Date().toLocaleDateString(),
    }));
}

export async function createKitchenAdmin(payload: any): Promise<void> {
  await api.post("/api/users", {
    userName: payload.staffId,
    fullName: payload.name,
    email: payload.email,
    password: payload.password,
    phoneNumber: payload.phone,
    roleName: "Manager",
  });
}

export async function resetUserPassword(userId: string): Promise<void> {
  // Typical endpoint for password reset by admin
  await api.post(`/api/users/${userId}/reset-password`);
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/api/users/${userId}`);
}
