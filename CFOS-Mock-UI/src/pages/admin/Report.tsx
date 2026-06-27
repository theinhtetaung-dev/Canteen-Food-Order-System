import { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import toast from 'react-hot-toast';
import { formatDisplayPrice } from '../../lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  Printer, 
  RefreshCw,
  Award
} from 'lucide-react';

interface FoodSalesBreakdown {
  foodName: string;
  quantitySold: number;
  revenue: number;
}

interface ReportPeriodBreakdown {
  periodLabel: string;
  orderCount: number;
  revenue: number;
}

interface ReportResponseModel {
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  foodSales: FoodSalesBreakdown[];
  periodBreakdown: ReportPeriodBreakdown[];
}

const AdminReport = () => {
  const [reportType, setReportType] = useState<string>('daily');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<ReportResponseModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set default dates based on report type
  const setDefaultDates = (type: string) => {
    const end = new Date();
    const start = new Date();
    
    if (type === 'yearly') {
      start.setFullYear(end.getFullYear() - 4); // 5 years
      setStartDate(`${start.getFullYear()}-01-01`);
      setEndDate(`${end.getFullYear()}-12-31`);
    } else if (type === 'monthly') {
      start.setMonth(end.getMonth() - 11); // 12 months
      // Start of start month
      const startYear = start.getFullYear();
      const startMonth = String(start.getMonth() + 1).padStart(2, '0');
      setStartDate(`${startYear}-${startMonth}-01`);
      // End of end month
      const endYear = end.getFullYear();
      const endMonth = String(end.getMonth() + 1).padStart(2, '0');
      setEndDate(`${endYear}-${endMonth}-31`); // Standard high limit or match current date
    } else {
      start.setDate(end.getDate() - 29); // 30 days
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const fetchReport = async (type = reportType, start = startDate, end = endDate) => {
    setIsLoading(true);
    try {
      // GET /api/reports?type={type}&startDate={start}&endDate={end}
      const response = await axiosPrivate.get<ReportResponseModel>('/reports', {
        params: { type, startDate: start, endDate: end }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report data', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setDefaultDates('daily');
    fetchReport('daily', '', '');
  }, []);

  const handleTypeChange = (type: string) => {
    setReportType(type);
    setDefaultDates(type);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

  // Find max revenue in period for chart scaling
  const maxRevenue = reportData?.periodBreakdown.reduce((max, p) => p.revenue > max ? p.revenue : max, 1) || 1;

  // Format date labels for chart readibility
  const formatLabel = (label: string) => {
    if (reportType === 'daily') {
      const parts = label.split('-');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}`; // MM/DD
      }
    }
    return label;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        </div>
        <button
          onClick={handlePrint}
          className="btn btn-outline flex items-center gap-2"
          disabled={isLoading || !reportData}
        >
          <Printer className="h-4 w-4" />
          Print / PDF
        </button>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CFOS Canteen Sales Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Report Scope: <span className="capitalize font-semibold">{reportType}</span> | Duration: {startDate || 'N/A'} to {endDate || 'N/A'}
        </p>
        <p className="text-xs text-gray-400">Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleGenerate} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end print:hidden">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Report Type
          </label>
          <select
            className="input-field"
            value={reportType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="daily">Daily Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            className="input-field"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            End Date
          </label>
          <input
            type="date"
            className="input-field"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary h-[42px] px-6 flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          Generate
        </button>
      </form>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
        </div>
      ) : reportData ? (
        <>
          {/* Key Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</span>
                <span className="text-2xl font-black text-gray-900">${formatDisplayPrice(reportData.totalRevenue)}</span>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Orders</span>
                <span className="text-2xl font-black text-gray-900">{reportData.totalOrders}</span>
              </div>
            </div>

            {/* Items Sold */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Food Items Sold</span>
                <span className="text-2xl font-black text-gray-900">{reportData.totalItemsSold}</span>
              </div>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Revenue Trend Chart
              </h3>
              
              <div className="flex-1 flex items-end gap-1.5 md:gap-3 w-full overflow-x-auto pb-2 min-h-0">
                {reportData.periodBreakdown.map((p) => {
                  const percentage = (p.revenue / maxRevenue) * 100;
                  return (
                    <div 
                      key={p.periodLabel} 
                      className="flex-1 flex flex-col items-center group relative min-w-[20px] max-w-[50px] h-full justify-end"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-28 text-center">
                        <div className="font-bold border-b border-slate-700 pb-1 mb-1">{p.periodLabel}</div>
                        <div>Rev: <span className="font-semibold text-orange-400">${formatDisplayPrice(p.revenue)}</span></div>
                        <div>Orders: <span className="font-semibold text-blue-400">{p.orderCount}</span></div>
                      </div>

                      {/* Bar fill */}
                      <div 
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm group-hover:from-orange-600 group-hover:to-orange-500 transition-all duration-300"
                        style={{ height: `${Math.max(percentage, 3)}%` }} // Minimum height of 3% for styling
                      />

                      {/* Label */}
                      <span className="text-[10px] text-gray-400 font-semibold mt-2 select-none">
                        {formatLabel(p.periodLabel)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Food Ranking Leaderboard */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-500" />
                Best Selling Foods
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
                {reportData.foodSales.map((item, index) => (
                  <div key={item.foodName} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-800' :
                        index === 1 ? 'bg-slate-100 text-slate-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">{item.foodName}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-gray-900">{item.quantitySold} sold</span>
                      <span className="text-[10px] text-gray-400">${formatDisplayPrice(item.revenue)}</span>
                    </div>
                  </div>
                ))}
                {reportData.foodSales.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No items sold in this period.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Period Report Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                Detailed Breakdown Data
              </h3>
            </div>
            <div className="overflow-x-auto max-h-[300px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interval Period</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Orders</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.periodBreakdown.map((row) => (
                    <tr key={row.periodLabel} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900">
                        {row.periodLabel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 text-center">
                        {row.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900 font-bold text-right">
                        ${formatDisplayPrice(row.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 text-gray-500">
          No data available. Please generate a report.
        </div>
      )}
    </div>
  );
};

export default AdminReport;
