import { readStorage, writeStorage } from "@furniture/lib/storage";
import type {
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  StoredUser,
  User,
} from "@furniture/types/auth";

const USERS_KEY = "canteen_users";
const SESSION_KEY = "canteen_session";

// Hardcoded privileged accounts
const PRIVILEGED_ACCOUNTS: StoredUser[] = [
  {
    id: "superadmin-001",
    rollNumber: "superadmin",
    password: "Superadmin1",
    role: "superadmin",
    name: "Super Administrator",
  },
  {
    id: "admin-001",
    rollNumber: "admin",
    password: "Admin1234",
    role: "admin",
    name: "Kitchen Administrator",
  },
];

function getUsers(): StoredUser[] {
  return readStorage<StoredUser[]>(USERS_KEY, []);
}

function saveUsers(users: StoredUser[]): void {
  writeStorage(USERS_KEY, users);
}

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    rollNumber: user.rollNumber,
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
}

export function getSessionUser(): User | null {
  return readStorage<User | null>(SESSION_KEY, null);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  await delay(400);

  // Prevent registering with reserved usernames
  if (["superadmin", "admin"].includes(payload.rollNumber.toLowerCase())) {
    throw new Error("This roll number is reserved.");
  }

  const users = getUsers();

  if (users.some((u) => u.rollNumber === payload.rollNumber)) {
    throw new Error("This roll number is already registered.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    rollNumber: payload.rollNumber,
    password: payload.password,
    role: "user",
  };

  users.push(user);
  saveUsers(users);
  writeStorage(SESSION_KEY, toPublicUser(user));
  return toPublicUser(user);
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  await delay(400);

  // Check privileged accounts first
  const privileged = PRIVILEGED_ACCOUNTS.find(
    (a) => a.rollNumber === payload.rollNumber && a.password === payload.password
  );
  if (privileged) {
    const publicUser = toPublicUser(privileged);
    writeStorage(SESSION_KEY, publicUser);
    return publicUser;
  }

  // Check regular users
  const user = getUsers().find(
    (u) =>
      u.rollNumber === payload.rollNumber && u.password === payload.password,
  );

  if (!user) {
    throw new Error("Invalid roll number or password.");
  }

  writeStorage(SESSION_KEY, toPublicUser(user));
  return toPublicUser(user);
}

export async function updateUserProfile(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<User> {
  await delay(300);
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    throw new Error("User not found.");
  }

  users[index] = { ...users[index], ...payload };
  saveUsers(users);
  const updated = toPublicUser(users[index]);
  writeStorage(SESSION_KEY, updated);
  return updated;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
