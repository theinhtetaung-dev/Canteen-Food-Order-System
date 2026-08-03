export interface ChartPoint {
  month: string;
  value: number; // Y-coordinate value for SVG calculation
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