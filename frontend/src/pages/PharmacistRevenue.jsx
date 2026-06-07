import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Download, TrendingUp, DollarSign, Wallet, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import API from '../utils/api';

const PharmacistRevenue = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [data, setData] = useState({ 
    summary: { totalGross: "0.00", adminFees: "0.00", netProfit: "0.00" }, 
    breakdown: [], 
    rawOrders: [] 
  });
  
  const [range, setRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/stats/pharmacist-revenue/${user.id}?range=${range}`);
      
      const breakdownData = Array.isArray(res.data?.breakdown) ? res.data.breakdown : [];
      
      setData({
        summary: res.data?.summary || { totalGross: "0.00", adminFees: "0.00", netProfit: "0.00" },
        breakdown: breakdownData,
        rawOrders: Array.isArray(res.data?.rawOrders) ? res.data.rawOrders : []
      });
      setTimeout(() => setIsReady(true), 600);
    } catch (err) { 
      console.error("Revenue Sync Failed:", err); 
      setData({ summary: { totalGross: "0.00", adminFees: "0.00", netProfit: "0.00" }, breakdown: [], rawOrders: [] });
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (user?.id) fetchRevenue(); 
  }, [range, user?.id]);

  const downloadCSV = () => {
    if (!data.rawOrders || data.rawOrders.length === 0) return alert("No data available to export");
    const headers = "Order ID, Medicine, Quantity, Total Price, Date\n";
    const rows = data.rawOrders.map(o => `${o.id},${o.medicine?.name || 'Unknown'},${o.quantity},${o.totalPrice},${o.createdAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Revenue_Report_${range}.csv`;
    a.click();
  };

  return (
    <DashboardLayout role="pharmacist">
      <div className="text-left min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">Financial Insights</h1>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">Verified earnings for {range}</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={range} 
              onChange={(e) => setRange(e.target.value)} 
              className="bg-white border-2 border-slate-100 p-3 px-5 rounded-2xl font-black text-[10px] uppercase outline-none cursor-pointer hover:border-blue-600 transition-all shadow-sm"
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
            <button 
              onClick={downloadCSV} 
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-black transition-all uppercase shadow-lg"
            >
              <Download size={14}/> Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <FinanceCard label="Gross Sales" val={`₹${data.summary.totalGross}`} icon={<DollarSign/>} color="bg-blue-600" />
          <FinanceCard label="Admin Fee" val={`-₹${data.summary.adminFees}`} icon={<Wallet/>} color="bg-rose-500" />
          <FinanceCard label="My Net Profit" val={`₹${data.summary.netProfit}`} icon={<TrendingUp/>} color="bg-emerald-500" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validating Transactions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-w-0 flex flex-col h-[450px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-widest text-left">Product Sales Distribution</h3>
              
              <div className="w-full flex-1 min-w-0 relative"> 
                {data.breakdown.length > 0 && isReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.breakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)'}} />
                      <Bar dataKey="earnings" radius={[10, 10, 0, 0]} barSize={45}>
                         {data.breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                         ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <AlertCircle size={40} className="mb-4" />
                    <p className="text-sm font-black uppercase tracking-tighter">No Sales Data Found</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Check if orders are marked 'delivered' in the database.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[450px]">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest text-left">Detailed Breakdown</h3>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {data.breakdown.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white">
                      <tr className="text-[10px] font-black text-slate-300 uppercase border-b border-slate-50">
                        <th className="pb-4">Medicine</th>
                        <th className="pb-4 text-right">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.breakdown.map((item, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all">
                          <td className="py-4">
                              <p className="font-bold text-slate-800 text-xs uppercase">{item.name}</p>
                              <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter mt-0.5">{item.count} Sold</p>
                          </td>
                          <td className="py-4 text-right font-black text-slate-800 text-xs italic">₹{parseFloat(item.earnings || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-300 font-black italic text-[10px] uppercase text-center p-10">
                    Records empty.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const FinanceCard = ({ label, val, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm text-left group hover:border-blue-200 transition-all duration-300">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-800 tracking-tighter">{val}</p>
    </div>
  </div>
);

export default PharmacistRevenue;