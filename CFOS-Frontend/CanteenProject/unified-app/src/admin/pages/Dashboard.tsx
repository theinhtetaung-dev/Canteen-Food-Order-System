import React, { useState, useEffect } from 'react';
import { Store, Users, UserCheck } from 'lucide-react';
import { fetchStudents } from '@furniture/api/user.api';

const loginData = [
  { date: 'May 20', logins: 450, x: 20, y: 62.5 },
  { date: 'May 21', logins: 440, x: 70, y: 66.6 },
  { date: 'May 22', logins: 380, x: 120, y: 91.6 },
  { date: 'May 23', logins: 445, x: 170, y: 64.5 },
  { date: 'May 24', logins: 440, x: 220, y: 66.6 },
  { date: 'May 25', logins: 290, x: 270, y: 129.1 },
  { date: 'May 26', logins: 560, x: 320, y: 16.6 },
  { date: 'May 27', logins: 440, x: 370, y: 66.6 },
  { date: 'May 28', logins: 465, x: 420, y: 56.2 },
  { date: 'May 29', logins: 110, x: 470, y: 204.1 },
];

export const Dashboard: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeUsersToday, setActiveUsersToday] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const users = await fetchStudents();
        setTotalUsers(users.length);
        
        // Mock active users based on total users for realism
        setActiveUsersToday(Math.floor(users.length * 0.8));
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-5xl space-y-8">
      {/* Title Greeting */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, Ta Sone Ta Yout
        </h2>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-[#F8FBF2] p-5 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
          <div className="p-3 bg-[#E1EEB4] rounded-xl text-gray-800">
            <Store className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-extrabold text-gray-700 tracking-wider">TOTAL CANTEEN</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">9</p>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-[#F8FBF2] p-5 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
          <div className="p-3 bg-[#E1EEB4] rounded-xl text-gray-800">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-extrabold text-gray-700 tracking-wider">TOTAL USERS</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{totalUsers}</p>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-[#F8FBF2] p-5 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
          <div className="p-3 bg-[#E1EEB4] rounded-xl text-gray-800">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-extrabold text-gray-700 tracking-wider">USERS ACTIVE TODAY</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{activeUsersToday}</p>
          </div>
        </div>
      </div>

      {/* Logins Overview Line Chart Box */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-900">
            Logins Overview <span className="text-sm font-normal text-gray-400">(Last 10 Days)</span>
          </h3>
        </div>

        {/* Chart with Grid & Axis Labels */}
        <div className="w-full flex">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-xs text-gray-400 pr-3 font-medium h-[250px] -mt-2.5">
            <span>600</span>
            <span>450</span>
            <span>300</span>
            <span>150</span>
            <span>0</span>
          </div>

          {/* SVG Chart Area */}
          <div className="flex-1">
            <div className="h-[250px] relative">
              <svg className="w-full h-full" viewBox="0 0 490 250" preserveAspectRatio="none">
                {/* Horizontal Grid Lines */}
                <line x1="0" y1="0" x2="490" y2="0" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="0" y1="62.5" x2="490" y2="62.5" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="0" y1="125" x2="490" y2="125" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="0" y1="187.5" x2="490" y2="187.5" stroke="#E5E7EB" strokeWidth="1" />
                <line x1="0" y1="250" x2="490" y2="250" stroke="#E5E7EB" strokeWidth="1" />

                {/* Vertical Grid Lines */}
                {loginData.map((d, i) => (
                  <line
                    key={i}
                    x1={d.x}
                    y1="0"
                    x2={d.x}
                    y2="250"
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                ))}

                {/* Chart Line */}
                <polyline
                  fill="none"
                  stroke="#88C425"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={loginData.map((d) => `${d.x},${d.y}`).join(' ')}
                />

                {/* Data Points */}
                {loginData.map((d, idx) => (
                  <circle
                    key={idx}
                    cx={d.x}
                    cy={d.y}
                    r="4"
                    fill="#88C425"
                  />
                ))}
              </svg>
            </div>

            {/* X-Axis Labels aligned with vertical grid lines */}
            <div className="flex justify-between text-xs text-gray-400 pt-3 font-medium px-[2%]">
              {loginData.map((d) => (
                <span key={d.date}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};