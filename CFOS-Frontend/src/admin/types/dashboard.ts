export interface ChartPoint {
  month: string;
  value: number;
}

export interface DashboardData {
  adminName: string;
  adminRole: string;
  avatarUrl: string;
  kitchenName: string;
  kitchenSubtitle: string;
  isKitchenOpen: boolean;
  totalOrders: number;
  averageRating: number;
  totalRevenue: number;
  growthPercentage: string;
  chartData: ChartPoint[];
}
