import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Calendar, Package, CheckCircle, Scale, Droplets, TrendingUp, 
  Utensils, Plus, Trash2, Download, Search, FileText, Activity, 
  ArrowUpRight, Heart, Clock, Sparkles, AlertCircle, ShieldCheck, Eye, ShieldAlert, UserRound, Flame, Trophy
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import API from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import EmergencyButton from '../components/EmergencyButton';

// PDF IMPORTS
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FOOD_DATABASE = [
  { name: 'Egg (Boiled)', cal: 78 }, { name: 'Chicken Breast (100g)', cal: 165 },
  { name: 'Roti/Phulka', cal: 71 }, { name: 'Rice (1 cup)', cal: 205 },
  { name: 'Dal (1 bowl)', cal: 150 }, { name: 'Salad Mixed', cal: 40 },
  { name: 'Milk (1 glass)', cal: 120 }, { name: 'Banana', cal: 105 }
];

const PatientDashboard = () => {
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({ appointments: 0, orders: 0, delivered: 0 });
  const [water, setWater] = useState(0);
  const [meals, setMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState('week');
  const [isChartReady, setIsChartReady] = useState(false);

  // BMI State
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiStatus, setBmiStatus] = useState('');

  // --- FITNESS FEATURE: BURN METER LOGIC ---
  const weeklyTarget = 2000; 
  const burnedTotal = user?.totalCaloriesBurned || 0;
  const burnPercentage = Math.min(Math.round((burnedTotal / weeklyTarget) * 100), 100);
  const burnChartData = [
    { name: 'Burned', value: burnedTotal },
    { name: 'Remaining', value: Math.max(weeklyTarget - burnedTotal, 0) }
  ];

  // --- HEALTH INSIGHTS DATA (10 Items) ---
  const allInsights = [
    { id: 1, title: "Hydration Boost", text: "Drinking water before meals can increase metabolism by 24-30% over 1-1.5 hours.", icon: <Activity className="text-blue-500" /> },
    { id: 2, title: "Sleep Hygiene", text: "Quality sleep (7-9 hours) reduces the risk of chronic heart conditions by 35%.", icon: <Clock className="text-indigo-500" /> },
    { id: 3, title: "Morning Sunlight", text: "15 mins of morning sun helps regulate circadian rhythms and boosts Vitamin D.", icon: <Sparkles className="text-amber-500" /> },
    { id: 4, title: "Sugar Alert", text: "Excess sugar intake is linked to high blood pressure and chronic inflammation.", icon: <AlertCircle className="text-rose-500" /> },
    { id: 5, title: "Protein Power", text: "Starting your day with protein can reduce cravings by 60% throughout the day.", icon: <ShieldCheck className="text-emerald-500" /> },
    { id: 6, title: "Fiber Intake", text: "Eating 30g of fiber daily significantly improves gut microbiome diversity.", icon: <Activity className="text-blue-600" /> },
    { id: 7, title: "Blinking Rule", text: "Follow the 20-20-20 rule to reduce digital eye strain during long work hours.", icon: <Eye className="text-purple-500" /> },
    { id: 8, title: "Walking Benefits", text: "A 10-minute walk after dinner helps stabilize blood glucose levels.", icon: <TrendingUp className="text-green-500" /> },
    { id: 9, title: "Salt Reduction", text: "Reducing salt intake by 1g daily can lower the risk of stroke by 10%.", icon: <ShieldAlert className="text-orange-500" /> },
    { id: 10, title: "Mental Check", text: "5 minutes of deep breathing exercises lowers cortisol (stress hormone) instantly.", icon: <UserRound className="text-teal-500" /> }
  ];

  const [insightIndex, setInsightIndex] = useState(0);

  // Logic: Calculate exactly 3 items to show from the 10 using Modulo for wrap-around
  const visibleInsights = [
    allInsights[insightIndex % 10],
    allInsights[(insightIndex + 1) % 10],
    allInsights[(insightIndex + 2) % 10]
  ];

  const totalCaloriesToday = meals.reduce((acc, m) => acc + Number(m.cal || 0), 0);

  useEffect(() => {
    API.get(`/stats/patient/${user.id}`).then(({ data }) => setStats(data));
    fetchHistory();
    const timer = setTimeout(() => setIsChartReady(true), 500);

    // --- ROTATION TIMER (10 Seconds) ---
    const insightTimer = setInterval(() => {
      setInsightIndex((prev) => (prev + 3) % 10);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(insightTimer);
    };
  }, [user.id, filter]);

  const fetchHistory = async () => {
    try {
      const res = await API.get(`/trackers/history/${user.id}?filter=${filter}`);
      const formatted = res.data.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        water: d.waterIntake || 0,
        cal: d.calories || 0
      }));
      setChartData(formatted);

      const today = new Date().toISOString().split('T')[0];
      const current = res.data.find(d => d.date === today);
      if (current) {
        setWater(current.waterIntake || 0);
        const parsedMeals = typeof current.meals === 'string' ? JSON.parse(current.meals) : current.meals;
        setMeals(Array.isArray(parsedMeals) ? parsedMeals : []);
      }
    } catch (err) { setMeals([]); }
  };

  const syncTracker = async (updatedWater, updatedMeals) => {
    try {
      const totalCal = updatedMeals.reduce((acc, m) => acc + Number(m.cal || 0), 0);
      await API.post('/trackers/update', {
        userId: user.id,
        waterIntake: updatedWater,
        calories: totalCal,
        meals: updatedMeals
      });
      fetchHistory();
    } catch (err) { console.error(err); }
  };

  const handleSearch = (val) => {
    setSearchTerm(val);
    if (val.length > 1) {
      const matches = FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(matches);
    } else { setSuggestions([]); }
  };

  const addSelectedMeal = (food) => {
    const newMeals = [...meals, { item: food.name, cal: food.cal }];
    setMeals(newMeals);
    setSearchTerm('');
    setSuggestions([]);
    syncTracker(water, newMeals);
  };

  const removeMeal = (idx) => {
    const newMeals = meals.filter((_, i) => i !== idx);
    setMeals(newMeals);
    syncTracker(water, newMeals);
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    const w = Number(weight), h = Number(height) / 100;
    if (w > 0 && h > 0) {
      const val = (w / (h * h)).toFixed(1);
      setBmi(val);
      setBmiStatus(val < 18.5 ? 'Underweight' : val < 25 ? 'Healthy' : 'Overweight');
    }
  };

  const downloadMedicalReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text("NEOCARE MEDICAL REPORT", 105, 20, { align: 'center' });
      doc.text(`Patient Name: ${user.name}`, 14, 35);
      const tableRows = chartData.map(d => [d.name, `${d.water} glasses`, `${d.cal} kcal`]);
      autoTable(doc, { startY: 55, head: [['Time Period', 'Hydration', 'Calories']], body: tableRows });
      doc.save(`${user.name}_Medical_Records.pdf`);
    } catch (error) { alert("Error generating report."); }
  };

  return (
    <DashboardLayout role="patient">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left min-w-0">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{t('welcome')}, {user.name.split(' ')[0]}!</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">Health Monitoring Station</p>
          </div>
          <button onClick={downloadMedicalReport} className="bg-emerald-600 text-white p-4 px-8 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase shadow-lg hover:bg-emerald-700 transition-all">
            <Download size={16} /> Download PDF Record
          </button>
        </div>

        {/* Stats Section - Updated with Workout Streak */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: t('appointments'), val: stats.appointments, icon: <Calendar/>, col: 'bg-blue-500' },
            { label: t('my_orders'), val: stats.orders, icon: <Package/>, col: 'bg-purple-500' },
            { label: 'Workout Streak', val: `${user?.workoutStreak || 0} Days`, icon: <Activity/>, col: 'bg-orange-500' },
            { label: t('records'), val: stats.delivered, icon: <CheckCircle/>, col: 'bg-emerald-500' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className={`${s.col} text-white w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>{s.icon}</div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              <h2 className="text-2xl font-black text-slate-800">{s.val}</h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* Health Analytics Chart */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter"><TrendingUp className="text-blue-600" /> Analytics</h3>
                <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                  {['week', 'month', 'year'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>{f}</button>
                  ))}
                </div>
              </div>
              
              <div className="w-full" style={{ height: 350, minWidth: 0 }}>
                {isChartReady && chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Area type="monotone" name="Hydration" dataKey="water" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" strokeWidth={4} />
                      <Area type="monotone" name="Calories" dataKey="cal" stroke="#ef4444" fillOpacity={1} fill="url(#colorCal)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* SINGLE ROTATING HEALTH INSIGHTS SECTION */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter ml-2 italic decoration-blue-500 underline underline-offset-8">Health Insights</h3>
              <div className="min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={insightIndex} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {visibleInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left min-h-[190px] flex flex-col"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                          {insight.icon}
                        </div>
                        <h4 className="font-black text-slate-800 uppercase italic tracking-tighter text-sm mb-2">{insight.title}</h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{insight.text}</p>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            {/* NEW FITNESS FEATURE: VISUAL BURN METER */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center relative overflow-hidden group">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Weekly Burn Goal</h3>
               <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={burnChartData} innerRadius={60} outerRadius={80} startAngle={90} endAngle={450} dataKey="value" stroke="none">
                        <Cell fill="#f97316" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <Flame className="text-orange-500 mb-1" size={24} />
                     <span className="text-3xl font-black text-slate-800 leading-none">{burnPercentage}%</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Achieved</span>
                  </div>
               </div>
               <div className="mt-4 space-y-1">
                  <p className="text-sm font-black text-slate-800 uppercase italic">{burnedTotal} / {weeklyTarget} KCAL</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Target: {weeklyTarget} kcal/week</p>
               </div>
               <Trophy className="absolute -right-2 -bottom-2 text-slate-50 w-24 h-24 -rotate-12 group-hover:scale-110 transition-transform" />
            </div>

            {/* Vital Trackers */}
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl space-y-6">
              <h3 className="text-lg font-black italic uppercase tracking-widest text-blue-400">Vital Trackers</h3>
              
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                <div className="flex justify-between mb-4 items-center">
                  <div className="flex items-center gap-2"><Droplets size={18} className="text-blue-400"/><span className="text-xs font-black uppercase tracking-tighter">Hydration</span></div>
                  <span className="font-black text-lg">{water}/8</span>
                </div>
                <div className="flex gap-1.5">{[...Array(8)].map((_, i) => <div key={i} onClick={() => {setWater(i+1); syncTracker(i+1, meals);}} className={`h-3 flex-1 rounded-full cursor-pointer transition-all ${i < water ? 'bg-blue-400' : 'bg-white/10'}`}></div>)}</div>
              </div>

              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4 relative">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2"><Utensils size={18} className="text-rose-400"/><span className="text-xs font-black uppercase tracking-tighter">Calorie Log</span></div>
                  <span className="text-rose-400 font-black text-sm">{totalCaloriesToday} kcal</span>
                </div>
                
                <div className="relative">
                  <input type="text" placeholder="Search food..." className="w-full bg-white/10 rounded-xl px-4 py-2 text-[11px] outline-none text-white border border-white/5 focus:border-blue-500" value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-[500] max-h-48 overflow-y-auto">
                      {suggestions.map((food, i) => (
                        <button key={i} onClick={() => addSelectedMeal(food)} className="w-full text-left p-3 text-[10px] font-bold border-b border-white/5 hover:bg-blue-600 flex justify-between items-center">
                          <span>{food.name}</span><span className="text-blue-400">{food.cal} kcal</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                  {meals.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-[10px] font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="uppercase text-white truncate w-24">{m.item}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-rose-400">{m.cal} kcal</span>
                        <button onClick={() => removeMeal(i)} className="text-slate-500 hover:text-red-500"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BMI Calculator */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3 uppercase italic"><Scale size={20} className="text-rose-500"/> BMI Index</h2>
              <form onSubmit={calculateBMI} className="space-y-4">
                <input type="number" placeholder="Weight (kg)" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none" value={weight} onChange={(e)=>setWeight(e.target.value)} />
                <input type="number" placeholder="Height (cm)" className="w-full bg-slate-50 p-4 rounded-2xl font-bold border border-slate-100 outline-none" value={height} onChange={(e)=>setHeight(e.target.value)} />
                <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black active:scale-95 transition-all">Calculate Index</button>
              </form>
              {bmi && (
                <div className="mt-6 p-5 bg-slate-50 rounded-[2rem] text-center border border-slate-100">
                  <h3 className="text-4xl font-black text-slate-800 mb-2">{bmi}</h3>
                  <span className="text-[9px] font-black uppercase px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-600">{bmiStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      <EmergencyButton /> 
    </DashboardLayout>
  );
};

export default PatientDashboard;