import { useState } from 'react';
import { Heading } from '../components/ui/Heading';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, SlidersHorizontal } from 'lucide-react';

export const DataTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const mockData = Array.from({ length: 7 }).map((_, i) => ({
    id: `ORD-${890 + i + (currentPage - 1) * 7}`,
    customer: `Customer ${i + 1 + (currentPage - 1) * 7}`,
    status: ['Pending', 'Completed', 'Processing'][i % 3],
    total: `$${(Math.random() * 100).toFixed(2)}`,
    date: `2026-06-${(10 + i).toString().padStart(2, '0')}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Heading level={2}>Orders</Heading>
        <Button variant="primary">Create Order</Button>
      </div>

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input placeholder="Search orders..." className="pl-9" />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Order ID</th>
                <th scope="col" className="px-6 py-4 font-medium">Customer</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium">Total</th>
                <th scope="col" className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row) => (
                <tr key={row.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">{row.id}</td>
                  <td className="px-6 py-4">{row.customer}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      row.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{row.total}</td>
                  <td className="px-6 py-4">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Pagination
            current_page={currentPage}
            total_pages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
    </div>
  );
};
