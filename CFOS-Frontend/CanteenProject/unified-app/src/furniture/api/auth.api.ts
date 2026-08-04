import { readStorage, writeStorage } from "@furniture/lib/storage";
import { api } from "@furniture/api/axios";
import type {
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  User,
} from "@furniture/types/auth";

const SESSION_KEY = "canteen_session";

export function getSessionUser(): User | null {
  return readStorage<User | null>(SESSION_KEY, null);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  await api.post("/api/users", {
    roleId: 2,
    userName: payload.rollNumber,
    fullName: payload.fullName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    password: payload.password
  });
  // Registration returns no token, redirect handled in UI
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<any>("/api/auth/login", {
    userName: payload.rollNumber,
    password: payload.password
  });
  
  const user: User = {
    id: "0", // Backend doesn't return ID in LoginResModel
    rollNumber: data.userName,
    role: data.role.toLowerCase() as any,
    name: data.userName
  };
  
  // Store session (User)
  writeStorage(SESSION_KEY, user);
  
  // Store token for axios
  if (data.token) {
    localStorage.setItem("canteen_token", data.token);
  }
  
  return user;
}

export async function updateUserProfile(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<User> {
  const { data } = await api.put<User>(`/api/users/${userId}`, payload);
  const updatedSessionUser = { ...getSessionUser(), ...data };
  writeStorage(SESSION_KEY, updatedSessionUser);
  return data;
}
