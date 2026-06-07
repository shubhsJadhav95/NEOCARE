import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Package, ClipboardCheck, TrendingUp, 
  AlertCircle, CheckCircle, XCircle, Eye, X, Truck, Loader2,
  Activity, Clock, Sparkles, ShieldCheck, UserRound
} from 'lucide-react';
import { Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import API from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const PharmacistDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [stats, setStats] = useState({ totalMedicines: 0, activeOrders: 0, totalSales: 0 });
  const [activeOrders, setActiveOrders] = useState([]); 
  const [verificationQueue, setVerificationQueue] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [rejectionOrder, setRejectionOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [processingId, setProcessingId] = useState(null); 

  // --- HEALTH INSIGHTS ROTATION STATE ---
  const [insightIndex, setInsightIndex] = useState(0);
  const allInsights = [
    { id: 1, title: "Hydration Boost", text: "Drinking water before meals can increase metabolism by 24-30% over 1-1.5 hours.", icon: <Activity className="text-blue-500" /> },
    { id: 2, title: "Sleep Hygiene", text: "Quality sleep (7-9 hours) reduces the risk of chronic heart conditions by 35%.", icon: <Clock className="text-indigo-500" /> },
    { id: 3, title: "Morning Sunlight", text: "15 mins of morning sun helps regulate circadian rhythms and boosts Vitamin D.", icon: <Sparkles className="text-amber-500" /> },
    { id: 4, title: "Sugar Alert", text: "Excess sugar intake is linked to high blood pressure and chronic inflammation.", icon: <AlertCircle className="text-rose-500" /> },
    { id: 5, title: "Protein Power", text: "Starting your day with protein can reduce cravings by 60% throughout the day.", icon: <ShieldCheck className="text-emerald-500" /> },
    { id: 6, title: "Fiber Intake", text: "Eating 30g of fiber daily significantly improves gut microbiome diversity.", icon: <Activity className="text-blue-600" /> },
    { id: 7, title: "Blinking Rule", text: "Follow the 20-20-20 rule to reduce digital eye strain during long work hours.", icon: <Activity className="text-purple-500" /> },
    { id: 8, title: "Walking Benefits", text: "A 10-minute walk after dinner helps stabilize blood glucose levels.", icon: <TrendingUp className="text-green-500" /> },
    { id: 9, title: "Salt Reduction", text: "Reducing salt intake by 1g daily can lower the risk of stroke by 10%.", icon: <ShieldCheck className="text-orange-500" /> },
    { id: 10, title: "Mental Check", text: "5 minutes of deep breathing exercises lowers cortisol (stress hormone) instantly.", icon: <UserRound className="text-teal-500" /> }
  ];

  const visibleInsights = [
    allInsights[insightIndex % 10],
    allInsights[(insightIndex + 1) % 10],
    allInsights[(insightIndex + 2) % 10]
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await API.get(`/stats/pharmacist/${user.id}`);
      setStats(statsRes.data);
      const ordersRes = await API.get(`/orders/pharmacist/${user.id}`);
      const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      setVerificationQueue(allOrders.filter(o => o.status === 'pending_verification'));
      setActiveOrders(allOrders.filter(o => o.status === 'pending'));
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user?.id) fetchDashboardData(); 

    // --- ROTATION TIMER (10 Seconds) ---
    const insightTimer = setInterval(() => {
        setInsightIndex((prev) => (prev + 3) % 10);
    }, 10000);

    return () => clearInterval(insightTimer);
  }, [user.id]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setProcessingId(orderId);
    try {
      await API.put(`/orders/update-status/${orderId}`, { status: newStatus });
      fetchDashboardData();
      alert(`Order marked as ${newStatus}`);
    } catch (err) { 
      alert("Failed to update status."); 
    } finally {
      setProcessingId(null);
    }
  };

  const chartData = [
    { name: 'Queue', value: verificationQueue.length },
    { name: 'Ready', value: activeOrders.length },
    { name: 'Stock', value: stats.totalMedicines }
  ];

  const displayEarningsINR = stats.totalSales * 1;

  return (
    <DashboardLayout role="pharmacist">
      <div className="text-left space-y-10 relative min-w-0">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">{user?.shop_name}</h1>
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Business Operations</p>
          </div>
        </header>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-w-0">
          <StatCard label="Inventory" val={stats.totalMedicines} icon={<Package/>} color="text-blue-500" />
          <StatCard label="To Verify" val={verificationQueue.length} icon={<ClipboardCheck/>} color="text-amber-500" />
          <StatCard label="Earnings (INR)" val={`₹${displayEarningsINR.toLocaleString()}`} icon={<TrendingUp/>} color="text-emerald-400" bg="bg-slate-900" dark />
        </div>

        {/* CHART & REVENUE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
            <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col min-w-0 overflow-hidden">
                <h3 className="text-[10px] font-black text-slate-400 uppercase mb-8 tracking-widest text-left">Operational Overview</h3>
                <div className="w-full h-[300px] min-w-0 relative">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '15px', border: 'none'}} />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981'][index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="flex flex-col gap-8 min-w-0">
                 <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-left">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Revenue status</h3>
                    <p className="text-2xl font-black text-slate-800">{stats.totalSales} Credits</p>
                    <p className="text-xs font-bold text-slate-400 italic uppercase">Pre-conversion balance</p>
                 </div>
                 <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-lg text-left">
                    <h3 className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Verification Status</h3>
                    <p className="text-4xl font-black italic tracking-tighter">{verificationQueue.length}</p>
                    <p className="text-[10px] mt-2 font-bold uppercase opacity-80">Awaiting Rx Review</p>
                 </div>
            </div>
        </div>

        {/* PRESCRIPTION VERIFICATION QUEUE */}
        {verificationQueue.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter"><Eye className="text-blue-600" /> Rx Verification Queue</h3>
            <div className="grid grid-cols-1 gap-4">
              {verificationQueue.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-blue-50 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <img 
                      src={`http://localhost:5000/${order.prescription_photo}`} 
                      className="w-16 h-16 bg-slate-100 rounded-2xl object-cover cursor-pointer border" 
                      onClick={() => window.open(`http://localhost:5000/${order.prescription_photo}`, '_blank')} 
                      alt="Rx" 
                    />
                    <div className="text-left">
                      <h4 className="font-bold text-slate-800 uppercase tracking-tighter">{order.medicine?.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Patient ID: {order.patient?.id} | Name: {order.patient?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleUpdateStatus(order.id, 'pending')} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><CheckCircle size={22}/></button>
                    <button onClick={() => setRejectionOrder(order)} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><XCircle size={22}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISPATCH CENTER */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 italic uppercase tracking-tighter"><Truck className="text-amber-500" /> Dispatch Control</h3>
          <div className="grid grid-cols-1 gap-4">
            {activeOrders.length > 0 ? activeOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 flex items-center justify-between group hover:border-blue-300 transition-all shadow-sm">
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Order #00{order.id}</p>
                  <h4 className="font-black text-slate-800 text-lg uppercase italic leading-tight">{order.medicine?.name} <span className="text-blue-600">x{order.quantity}</span></h4>
                  <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mt-1">{order.totalPrice} Credits Total</p>
                </div>
                <button 
                  disabled={processingId === order.id} 
                  onClick={() => handleUpdateStatus(order.id, 'dispatched')} 
                  className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                >
                  {processingId === order.id ? <Loader2 className="animate-spin" size={18} /> : "Transmit to Dispatch"}
                </button>
              </div>
            )) : <div className="p-16 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-100 rounded-[4rem]">No Logistics Active</div>}
          </div>
        </div>

        {/* --- ROTATING HEALTH INSIGHTS (SINGLE SECTION) --- */}
        <div className="pt-10 border-t border-slate-100 min-w-0">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 italic underline underline-offset-8 decoration-blue-500 text-left">Clinical Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {visibleInsights.map((insight, idx) => (
                <motion.div
                  key={`${insightIndex}-${insight.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left min-h-[180px] flex flex-col"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                    {insight.icon}
                  </div>
                  <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-sm mb-2">{insight.title}</h4>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{insight.text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {rejectionOrder && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-10 rounded-[3rem] max-w-sm w-full shadow-2xl">
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase italic tracking-tighter">Decline Transaction</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase mb-6 tracking-widest">State the reason for Rx rejection</p>
                <textarea 
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold mb-6 outline-none focus:border-rose-500 transition-all h-32 text-sm" 
                  placeholder="Missing dosage information / Blurred screenshot..." 
                  value={reason} onChange={(e) => setReason(e.target.value)} 
                />
                <div className="flex gap-3">
                  <button onClick={() => setRejectionOrder(null)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Abort</button>
                  <button 
                    onClick={async () => { 
                      await API.put(`/orders/update-status/${rejectionOrder.id}`, { status: 'rejected', rejectionReason: reason }); 
                      setRejectionOrder(null); 
                      fetchDashboardData(); 
                    }} 
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700"
                  >
                    Confirm Reject
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ label, val, icon, color, bg = "bg-white", dark = false }) => (
  <div className={`${bg} p-8 rounded-[2.5rem] border border-slate-100 relative shadow-sm ${dark ? 'text-white' : ''} text-left`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
    <h2 className="text-4xl font-black italic tracking-tighter leading-none">{val}</h2>
    <div className={`absolute right-6 top-8 opacity-10 ${color}`}>{icon}</div>
  </div>
);

export default PharmacistDashboard;