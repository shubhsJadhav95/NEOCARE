import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Users, Clock, IndianRupee, Save, 
  Calendar, CheckCircle, User, ArrowRight, Activity, PlusCircle,
  Sparkles, AlertCircle, ShieldCheck, Eye, ShieldAlert, UserRound
} from 'lucide-react';
import API from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const DoctorDashboard = () => {
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [stats, setStats] = useState({ totalAppointments: 0, pending: 0, earnings: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [hours, setHours] = useState(user.working_hours || "09:00 AM - 05:00 PM");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Recommendation State
  const [recName, setRecName] = useState('');
  const [recReason, setRecReason] = useState('');

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
    { id: 8, title: "Walking Benefits", text: "A 10-minute walk after dinner helps stabilize blood glucose levels.", icon: <Activity className="text-green-500" /> },
    { id: 9, title: "Salt Reduction", text: "Reducing salt intake by 1g daily can lower the risk of stroke by 10%.", icon: <ShieldAlert className="text-orange-500" /> },
    { id: 10, title: "Mental Check", text: "5 minutes of deep breathing exercises lowers cortisol (stress hormone) instantly.", icon: <UserRound className="text-teal-500" /> }
  ];

  const visibleInsights = [
    allInsights[insightIndex % 10],
    allInsights[(insightIndex + 1) % 10],
    allInsights[(insightIndex + 2) % 10]
  ];

  const fetchData = async () => {
    try {
      const statsRes = await API.get(`/stats/doctor/${user.id}`);
      setStats(statsRes.data);
      const appointmentsRes = await API.get(`/appointments/doctor/${user.id}`);
      setRecentAppointments(appointmentsRes.data.slice(0, 4));
    } catch (err) { 
      console.error("Dashboard Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();

    // --- ROTATION TIMER (10 Seconds) ---
    const insightTimer = setInterval(() => {
        setInsightIndex((prev) => (prev + 3) % 10);
    }, 10000);

    return () => clearInterval(insightTimer);
  }, [user.id]);

  const updateSchedule = async () => {
    setUpdating(true);
    try {
      await API.put(`/auth/update-profile/${user.id}`, { working_hours: hours });
      localStorage.setItem('user', JSON.stringify({ ...user, working_hours: hours }));
      alert("Practice hours updated!");
    } catch (err) { alert("Update failed"); } 
    finally { setUpdating(false); }
  };

  const submitRecommendation = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/recommend-medicine', { 
        medicineName: recName, 
        reason: recReason, 
        doctorId: user.id 
      });
      alert("Medicine recommendation sent to Admin!");
      setRecName(''); setRecReason('');
    } catch (err) { alert("Submission failed"); }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-blue-600 uppercase italic">Syncing Clinical Data...</div>;

  return (
    <DashboardLayout role="doctor">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col lg:flex-row gap-8 text-left min-w-0">
        
        <div className="flex-1 lg:w-2/3 space-y-8 min-w-0">
          <header>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic decoration-blue-600 underline-offset-8 underline decoration-4">Dr. {user.name}</h1>
            <p className="text-slate-500 font-medium mt-2">{t('welcome')} back to your medical suite.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: t('appointments'), val: stats.totalAppointments, icon: <Users/>, color: 'bg-blue-50 text-blue-500' },
              { label: t('pending_requests'), val: stats.pending, icon: <Clock/>, color: 'bg-amber-50 text-amber-500' },
              { label: t('total_earnings'), val: `₹${stats.earnings}`, icon: <IndianRupee/>, color: 'bg-slate-800 text-emerald-400', dark: true }
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className={`${s.dark ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'} p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all`}>
                <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-inner`}>{s.icon}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h2 className="text-2xl font-black italic">{s.val}</h2>
              </motion.div>
            ))}
          </div>

          {/* Medicine Recommendation Widget */}
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 text-blue-400 rounded-2xl"><PlusCircle size={20}/></div>
                <h2 className="text-lg font-black italic tracking-tight uppercase">Suggest Missing Medicine</h2>
            </div>
            <form onSubmit={submitRecommendation} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="space-y-4">
                    <input 
                        value={recName} onChange={(e)=>setRecName(e.target.value)} 
                        placeholder="Name of Medicine" 
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
                        required 
                    />
                    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                        Submit Recommendation
                    </button>
                </div>
                <textarea 
                    value={recReason} onChange={(e)=>setRecReason(e.target.value)} 
                    placeholder="Explain why this should be added to database..." 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/50 h-32 md:h-auto transition-all"
                />
            </form>
          </div>

          {/* --- ROTATING HEALTH INSIGHTS (SINGLE SECTION) --- */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic border-l-4 border-blue-600 pl-4">Clinical Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {visibleInsights.map((insight, idx) => (
                  <motion.div
                    key={`${insightIndex}-${insight.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left min-h-[190px] flex flex-col"
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
        </div>

        {/* SIDEBAR CONTENT */}
        <div className="lg:w-1/3 space-y-6 min-w-0">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl"><Calendar size={20}/></div>
               <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight italic">Availability</h2>
             </div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Practice Hours</p>
             <input type="text" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 mb-4 transition-all" />
             <button onClick={updateSchedule} disabled={updating} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
               {updating ? 'Saving...' : 'Update Schedule'}
             </button>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-3 italic">
              <Activity size={20} className="text-rose-500"/> Recent Activity
            </h2>
            <div className="space-y-6">
              {recentAppointments.length > 0 ? recentAppointments.map((app, idx) => (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={app.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden border shadow-inner">
                    <img src={`https://api.neocare.devcloudzone.store/${app.patient?.profile_photo}`} onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + app.patient?.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="flex-1 border-b border-slate-50 pb-4">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{app.patient?.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(app.date).toLocaleDateString()} • {app.time}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <UserRound size={40} className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;