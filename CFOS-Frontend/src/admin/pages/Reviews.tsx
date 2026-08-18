import React from 'react';
// Assuming you have an image for the tea in your assets
import teaImg from '../assets/download 1.png'; 

const Review: React.FC = () => {
  const categories = [
    { label: 'Food Quality', score: 4.8, width: '90%' },
    { label: 'Service', score: 4.6, width: '80%' },
    { label: 'Ambiance', score: 4.7, width: '85%' },
    { label: 'Value for Money', score: 4.9, width: '95%' },
  ];

  const chartData = [
    { month: 'Jan', pos: 130, neg: 100 },
    { month: 'Feb', pos: 160, neg: 75 },
    { month: 'Mar', pos: 130, neg: 100 },
    { month: 'Apr', pos: 75, neg: 20 },
    { month: 'May', pos: 190, neg: 55 },
    { month: 'Jun', pos: 130, neg: 100 },
    { month: 'Jul', pos: 150, neg: 40 },
    { month: 'Aug', pos: 130, neg: 100 },
    { month: 'Sep', pos: 75, neg: 20 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans animate-fade-in">
      
      {/* TOP ROW: RATINGS & STATISTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RATINGS BOX */}
        <section className="bg-[#f4f9f1] p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Ratings</h2>
            <select className="bg-[#e4eedb] border-none text-sm font-semibold rounded-lg px-3 py-1.5 focus:ring-0">
              <option>This Month</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Big Score Card */}
            <div className="bg-[#d9e8cc] rounded-3xl p-6 flex flex-col items-center justify-center min-w-[160px] text-center">
              <span className="text-5xl font-bold text-gray-900 mb-2">4.7</span>
              <div className="flex gap-0.5 text-amber-500 text-xl mb-2">★★★★★</div>
              <span className="text-gray-500 text-sm font-medium">345 Reviews</span>
            </div>

            {/* Category Bars */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              {categories.map((cat) => (
                <div key={cat.label} className="w-full">
                  <div className="flex justify-between text-sm font-bold text-gray-800 mb-1">
                    <span>{cat.label}</span>
                    <span>{cat.score}</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#9ccc65] rounded-full" style={{ width: cat.width }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEW STATISTICS (CHART) */}
        <section className="bg-[#f4f9f1] p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Review Statistics</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <div className="w-3 h-3 rounded-full bg-[#9ccc65]"></div> Positive Review
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <div className="w-3 h-3 rounded-full bg-black"></div> Negative Review
              </div>
              <select className="bg-[#e4eedb] border-none text-xs font-semibold rounded-lg px-2 py-1 focus:ring-0 ml-2">
                <option>This Year</option>
              </select>
            </div>
          </div>

          {/* Simple CSS Bar Chart */}
          <div className="flex-1 flex items-end justify-between px-2 pt-10 pb-2 relative border-l border-b border-gray-200">
            {/* Horizontal Grid Lines Background */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20 px-2">
               {[200, 150, 100, 50, 0].map(val => <div key={val} className="border-t border-black w-full relative"><span className="absolute -left-7 -top-2 text-[10px] text-black font-bold">{val}</span></div>)}
            </div>
            
            {chartData.map((data) => (
              <div key={data.month} className="flex flex-col items-center gap-1 w-full z-10">
                <div className="flex items-end gap-1 h-32">
                  <div className="w-3 bg-[#9ccc65] rounded-t-sm" style={{ height: `${(data.pos / 200) * 100}%` }}></div>
                  <div className="w-3 bg-black rounded-t-sm" style={{ height: `${(data.neg / 200) * 100}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-600 mt-1">{data.month}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* BOTTOM SECTION: FILTER & REVIEWS LIST */}
      <section className="bg-[#e2e8df] p-6 rounded-3xl border border-gray-100 shadow-sm">
        
        {/* Filters Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-gray-100">
            <span className="text-amber-500">★</span> Rating <span className="text-xs">▼</span>
          </button>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-gray-100">
            Category <span className="text-xs">▼</span>
          </button>
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-gray-100">
            All Menu <span className="text-xs">▼</span>
          </button>
          <div className="ml-auto">
             <select className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0">
               <option>This Year</option>
             </select>
          </div>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] p-4 shadow-md border border-gray-50 flex flex-col gap-3 relative overflow-hidden">
               {/* Content Head */}
               <div className="flex gap-3">
                 <img src={teaImg} alt="Tea" className="w-16 h-16 rounded-2xl object-cover" />
                 <div className="flex flex-col justify-center">
                    <h4 className="font-bold text-gray-900">Tea</h4>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">💬 350 Reviews</span>
                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">★ 4.9 <span className="font-normal">Overall Rate</span></span>
                 </div>
               </div>
               
               <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-gray-900">Draven Kai</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Oct 20, 2026</span>
               </div>

               <p className="text-[11px] text-gray-500 leading-tight px-1 pb-2">
                 Lorem Ipsum is simply dummy text of the printing and typesetting industry..
               </p>
               
               {/* Card overlap effect bottom border */}
               <div className="absolute bottom-0 left-0 w-full h-1 bg-black/5"></div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-sm text-gray-500 font-bold">
              Showing <span className="bg-white px-4 py-1 rounded-lg text-gray-900 border border-gray-100">4</span> out of 1234
           </div>
           <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">‹</button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#c5e1a5] rounded-xl shadow-sm font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 font-bold text-gray-400">2</button>
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 font-bold text-gray-400">3</button>
              <span className="text-gray-400 font-bold">....</span>
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 font-bold text-gray-400">12</button>
              <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50">›</button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Review;
