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
  localStorage.removeItem("canteen_token");
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  // Call the real backend to register a user.
  await api.post("/api/users", {
    userName: payload.rollNumber,
    fullName: payload.rollNumber,
    email: `${payload.rollNumber}@canteen.com`,
    password: payload.password,
  });

  // After registration, log the user in automatically to get the token
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

  const user: User = {
    id: data.userName,
    rollNumber: data.userName,
    role: data.role.toLowerCase() as any,
    name: data.userName,
  };

  writeStorage(SESSION_KEY, user);
  return user;
}

export async function updateUserProfile(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<User> {
  const sessionUser = getSessionUser();
  if (sessionUser) {
    const updated = { ...sessionUser, ...payload };
    writeStorage(SESSION_KEY, updated);
    return updated;
  }
  throw new Error("User not logged in");
}
