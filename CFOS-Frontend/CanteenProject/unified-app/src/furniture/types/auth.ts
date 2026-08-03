export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  rollNumber: string;
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
}

export interface RegisterPayload {
  rollNumber: string;
  password: string;
}

export interface LoginPayload {
  rollNumber: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name: string;
  email: string;
  phone: string;
}

export interface StoredUser extends User {
  password: string;
}
