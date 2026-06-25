
import { Heading } from '../components/ui/Heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, ShoppingBag, DollarSign, Activity } from 'lucide-react';

export const Dashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '$45,231.89', icon: DollarSign, trend: '+20.1% from last month' },
    { title: 'Orders', value: '+2350', icon: ShoppingBag, trend: '+180.1% from last month' },
    { title: 'Active Users', value: '+12,234', icon: Users, trend: '+19% from last month' },
    { title: 'Active Now', value: '+573', icon: Activity, trend: '+201 since last hour' },
  ];

  return (
    <div className="space-y-6">
      <Heading level={2}>Dashboard</Heading>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>A simple placeholder for a chart or graph.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">
             <span className="text-slate-500 dark:text-slate-400 italic">Chart visualization area</span>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">U{i}</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">User Name {i}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">user{i}@example.com</p>
                  </div>
                  <div className="ml-auto font-medium">+$1,999.00</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
