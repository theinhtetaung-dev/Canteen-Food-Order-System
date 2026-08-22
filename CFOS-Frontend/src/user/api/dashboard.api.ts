import { api } from "@user/api/axios";

export interface ChartDataModel {
  label: string;
  value: number;
}

export interface PieChartModel {
  name: string;
  value: number;
  color: string;
}

export interface TopFoodModel {
  categoryName?: string;
  quantitySold: number;
  revenue: number;
}

export interface AdminDashboardResModel {
  salesTrends: ChartDataModel[];
  topSellingFoods: TopFoodModel[];
}

export interface SuperadminDashboardResModel {
  registrationGrowth: ChartDataModel[];
  roleDistribution: PieChartModel[];
}

export async function fetchAdminDashboard(timeRange: string = "today", canteenId?: number): Promise<AdminDashboardResModel> {
  const params = new URLSearchParams();
  params.append("timeRange", timeRange);
  if (canteenId !== undefined && canteenId !== null) {
    params.append("canteenId", canteenId.toString());
  }
  const { data } = await api.get<AdminDashboardResModel>("/api/dashboard/admin", { params });
  return data;
}

export async function fetchSuperadminDashboard(timeRange: string = "today"): Promise<SuperadminDashboardResModel> {
  const params = new URLSearchParams();
  params.append("timeRange", timeRange);
  const { data } = await api.get<SuperadminDashboardResModel>("/api/dashboard/superadmin", { params });
  return data;
}
