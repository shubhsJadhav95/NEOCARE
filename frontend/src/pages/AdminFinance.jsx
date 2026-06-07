import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../utils/api';
import { Check, X, ExternalLink, Clock, TrendingUp, AlertTriangle, Wallet, ArrowDownCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminFinance = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ totalIssued: 0, totalRedeemed: 0, totalPenalty: 0, pendingCount: 0 });
  const [filter, setFilter] = useState('buy');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const res = await API.get('/credits/admin/stats');
      setStats(res.data);
    } catch (err) { console.error("Stats fetch failed"); }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/credits/admin/all?type=${filter}`);
      setRequests(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    if(!window.confirm("Verify payment and update user balance?")) return;
    try {
      await API.put(`/credits/admin/approve/${id}`);
      fetchRequests();
      fetchStats();
    } catch (err) { alert("Action failed"); }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 min-w-0">
        
        {/* SUMMARY CARDS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Issued" val={stats.totalIssued} icon={<Wallet />} color="blue" />
          <StatCard title="Redeemed" val={stats.totalRedeemed} icon={<ArrowDownCircle />} color="emerald" />
          <StatCard title="Penalty Pool" val={stats.totalPenalty} icon={<AlertTriangle />} color="rose" />
          <StatCard title="Waitlist" val={stats.pendingCount} icon={<Clock />} color="amber" />
        </div>

        {/* CONTROLS */}
        <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex gap-2">
            <button onClick={() => setFilter('buy')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${filter === 'buy' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Buy Requests</button>
            <button onClick={() => setFilter('withdraw')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${filter === 'withdraw' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Redemptions</button>
          </div>
          <div className="pr-6">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Ledger Control</span>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden min-w-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="p-8">User Details</th>
                <th className="p-8">Credit Amount</th>
                <th className="p-8">Reference/UPI</th>
                <th className="p-8">Proof</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-600">
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="p-8">
                    <p className="text-slate-900 uppercase">{req.User?.name}</p>
                    <p className="text-[9px] font-black text-slate-400 mt-1 uppercase italic">{req.type} Request</p>
                  </td>
                  <td className="p-8">
                    <span className="text-blue-600 font-black">₹{req.amount.toLocaleString()}</span>
                    {req.penaltyAmount > 0 && <span className="ml-2 text-[9px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md">+{req.penaltyAmount} Penalty</span>}
                  </td>
                  <td className="p-8 font-mono text-xs text-slate-400">
                    {req.transactionId || req.upiId || 'N/A'}
                  </td>
                  <td className="p-8">
                    {req.screenshot ? (
                      <a href={`http://localhost:5000/${req.screenshot}`} target="_blank" className="text-blue-500 text-[10px] uppercase font-black flex items-center gap-1 hover:underline">
                        View Proof <ExternalLink size={10} />
                      </a>
                    ) : '---'}
                  </td>
                  <td className="p-8">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    {req.status === 'pending' && (
                      <button onClick={() => handleApprove(req.id)} className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 hover:scale-105 transition-all">Verify & Approve</button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.2em] italic">No pending {filter} requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, val, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition-all">
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{title}</p>
      <p className={`text-2xl font-black italic truncate ${color === 'rose' ? 'text-rose-600' : 'text-slate-800'}`}>₹{val.toLocaleString()}</p>
    </div>
    <div className={`p-4 rounded-2xl shrink-0 ${
      color === 'blue' ? 'bg-blue-50 text-blue-600' : 
      color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
      color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
    }`}>{icon}</div>
  </div>
);

export default AdminFinance;