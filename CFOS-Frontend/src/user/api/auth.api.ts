import { readStorage, writeStorage } from "@user/lib/storage";
import { api } from "@user/api/axios";
import type {
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  User,
} from "@user/types/auth";

const SESSION_KEY = "canteen_session";

export function getSessionUser(): User | null {
  return readStorage<User | null>(SESSION_KEY, null);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("canteen_token");
}

export async function registerUser(payload: RegisterPayload): Promise<User> {

  await api.post("/api/users", {
    userName: payload.rollNumber,
    fullName: payload.rollNumber,
    email: `${payload.rollNumber}@student.local`,
    password: payload.password,
  });

  return loginUser(payload);
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<{ token: string; userName: string; role: string }>(
    "/api/auth/login",
    {
      userName: payload.rollNumber,
      password: payload.password,
    }
  );

  localStorage.setItem("canteen_token", data.token);

  let profile;
  try {
    const res = await api.get("/api/users/me");
    profile = res.data;
  } catch (err) {
    console.error("Failed to fetch user profile", err);
  }

  const user: User = {
    id: data.userName,
    rollNumber: data.userName,
    role: data.role.toLowerCase() as any,
    name: profile?.fullName || data.userName,
    email: profile?.email || "",
    phone: profile?.phoneNumber || "",
  };

  writeStorage(SESSION_KEY, user);
  return user;
}

export async function updateUserProfile(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<User> {
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    throw new Error("User not logged in");
  }

  await api.put("/api/users/me", {
    fullName: payload.name,
    email: payload.email,
    phoneNumber: payload.phone,
  });

  const updated = { ...sessionUser, ...payload };
  writeStorage(SESSION_KEY, updated);
  return updated;
}

export async function changePassword(payload: any): Promise<void> {
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    throw new Error("User not logged in");
  }

  await api.post("/api/users/change-password", {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  });
}
