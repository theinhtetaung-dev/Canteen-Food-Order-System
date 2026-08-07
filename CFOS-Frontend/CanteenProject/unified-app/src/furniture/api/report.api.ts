import { api } from "./axios";

export interface ReportPeriodBreakdown {
  periodLabel: string;
  orderCount: number;
  revenue: number;
}

export interface FoodSalesBreakdown {
  foodName: string;
  quantitySold: number;
  revenue: number;
}

export interface ReportResponseModel {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  foodSales: FoodSalesBreakdown[];
  periodBreakdown: ReportPeriodBreakdown[];
}

export async function fetchReport(
  type: string = "daily",
  startDate?: string,
  endDate?: string
): Promise<ReportResponseModel> {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const { data } = await api.get<ReportResponseModel>(`/api/reports?${params.toString()}`);
  return data;
}
