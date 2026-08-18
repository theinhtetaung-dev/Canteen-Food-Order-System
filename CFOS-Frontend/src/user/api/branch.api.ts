import { api } from "@user/api/axios";

export interface Branch {
  branchId: number;
  branchName: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchBranches(): Promise<Branch[]> {
  const { data } = await api.get<Branch[]>("/api/branches");
  return data;
}

export async function createBranch(payload: { branchName: string; location: string }): Promise<Branch> {
  const { data } = await api.post<Branch>("/api/branches", payload);
  return data;
}

export async function updateBranch(id: number, payload: { branchName: string; location: string }): Promise<Branch> {
  const { data } = await api.put<Branch>(`/api/branches/${id}`, payload);
  return data;
}

export async function deleteBranch(id: number): Promise<void> {
  await api.delete(`/api/branches/${id}`);
}
