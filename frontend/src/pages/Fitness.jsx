import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Play, Clock, Flame, Dumbbell, Flower2, 
  Search, Filter, ChevronRight, PlayCircle, Trophy, Activity,
  CheckCircle, Loader2, Sparkles, Lock, Tv, Maximize, Share2, Monitor
} from 'lucide-react';
import API from '../utils/api';

const VIDEOS = {
  yoga: [
    { id: 1, title: "10 Min Morning Yoga", duration: "10m", cal: "50", level: "Beginner", url: "https://www.youtube.com/embed/VaoV1PrYftY", keywords: ["general", "morning"] },
    { id: 2, title: "Yoga for Back Pain", duration: "20m", cal: "90", level: "Beginner", url: "https://www.youtube.com/embed/2eA2Koq6pTI", keywords: ["back", "pain", "spine", "orthopedic"] },
    { id: 3, title: "Deep Stress Release", duration: "15m", cal: "60", level: "Intermediate", url: "https://www.youtube.com/embed/sTANio_2E0Q", keywords: ["stress", "anxiety", "mental", "relax"] },
    { id: 4, title: "Sun Salutation A", duration: "12m", cal: "110", level: "Intermediate", url: "https://www.youtube.com/embed/7Vp8YmK8TfM", keywords: ["energy", "flow"] },
    { id: 5, title: "Yoga for Flexibility", duration: "30m", cal: "150", level: "All Levels", url: "https://www.youtube.com/embed/OQ6NfFIrd2c", keywords: ["stretch", "flexibility"] },
    { id: 6, title: "Core Power Yoga", duration: "25m", cal: "200", level: "Advanced", url: "https://www.youtube.com/embed/9kOCY0KNByw", keywords: ["core", "strength", "abs"] },
    { id: 7, title: "Evening Wind Down", duration: "10m", cal: "40", level: "Beginner", url: "https://www.youtube.com/embed/v7AYKMP6rOE", keywords: ["sleep", "evening", "insomnia"] },
    { id: 8, title: "Yoga for Athletes", duration: "20m", cal: "130", level: "Intermediate", url: "https://www.youtube.com/embed/7X8m6t_PjG8", keywords: ["sport", "athlete", "recovery"] },
    { id: 9, title: "Mindful Breathing", duration: "05m", cal: "20", level: "Beginner", url: "https://www.youtube.com/embed/6p_yaNFSYao", keywords: ["breath", "meditation", "lungs", "asthma"] },
    { id: 10, title: "Full Body Flow", duration: "45m", cal: "300", level: "Advanced", url: "https://www.youtube.com/embed/6hZzzM8uAn0", keywords: ["intense", "fullbody"] }
  ],
  exercise: [
    { id: 11, title: "Full Body HIIT", duration: "20m", cal: "250", level: "Intermediate", url: "https://www.youtube.com/embed/ml6cT4AZdqI", keywords: ["cardio", "weightloss", "fat"] },
    { id: 12, title: "Fat Burn Cardio", duration: "15m", cal: "180", level: "Beginner", url: "https://www.youtube.com/embed/vwXzXp_SWS0", keywords: ["heart", "cardiology", "burn"] },
    { id: 13, title: "Absolute Abs", duration: "10m", cal: "100", level: "Intermediate", url: "https://www.youtube.com/embed/AnYl6Nk9GOA", keywords: ["stomach", "abs", "core"] },
    { id: 14, title: "Strength Training", duration: "30m", cal: "220", level: "Advanced", url: "https://www.youtube.com/embed/p_mMM9S98mU", keywords: ["muscle", "lifting", "strength"] },
    { id: 15, title: "Leg Workout", duration: "15m", cal: "150", level: "Intermediate", url: "https://www.youtube.com/embed/XpEofVvUqHk", keywords: ["legs", "glutes", "lowerbody"] },
    { id: 16, title: "No Equipment Arms", duration: "12m", cal: "110", level: "Beginner", url: "https://www.youtube.com/embed/6m6S28C_Lts", keywords: ["arms", "upperbody", "biceps"] },
    { id: 17, title: "Low Impact Cardio", duration: "20m", cal: "140", level: "Senior Friendly", url: "https://www.youtube.com/embed/gC_L9qAHVJ8", keywords: ["senior", "joint", "gentle", "arthritis"] },
    { id: 18, title: "Tabata Burn", duration: "04m", cal: "80", level: "Advanced", url: "https://www.youtube.com/embed/m756_E-f8vE", keywords: ["fast", "metabolism", "quick"] },
    { id: 19, title: "Stretching Routine", duration: "10m", cal: "50", level: "All Levels", url: "https://www.youtube.com/embed/L_xrDAtykMI", keywords: ["stiffness", "flexibility", "sore"] },
    { id: 20, title: "Weight Loss Dance", duration: "30m", cal: "280", level: "Beginner", url: "https://www.youtube.com/embed/8DZktowZo_k", keywords: ["fun", "dance", "weightloss"] }
  ]
};

const Fitness = () => {
  const [category, setCategory] = useState('yoga');
  const [activeVideo, setActiveVideo] = useState(VIDEOS.yoga[0]);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendedId, setRecommendedId] = useState(null);
  const [todayBurn, setTodayBurn] = useState(0);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const completedCount = user?.completedWorkouts || 0;
  const DAILY_TARGET = 300;

  // --- FETCH DAILY PROGRESS FROM TRACKER ---
  useEffect(() => {
    const fetchDailyProgress = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await API.get(`/trackers/history/${user.id}?filter=week`);
        const todayData = res.data.find(d => d.date === today);
        if (todayData) setTodayBurn(todayData.calories || 0);
      } catch (err) {
        console.error("Error fetching daily burn data", err);
      }
    };
    fetchDailyProgress();
  }, [user.id]);

  // --- FEATURE 3 LOGIC: AI PERSONALIZATION ENGINE ---
  useEffect(() => {
    const lastSearch = localStorage.getItem('lastConditionSearch');
    if (lastSearch) {
      const match = VIDEOS[category].find(v => 
        v.keywords.some(k => lastSearch.includes(k)) || 
        v.title.toLowerCase().includes(lastSearch)
      );
      if (match) setRecommendedId(match.id);
    }
  }, [category]);

  const sortedVideos = [...VIDEOS[category]].sort((a, b) => {
    if (a.id === recommendedId) return -1;
    if (b.id === recommendedId) return 1;
    return 0;
  });

  const filteredVideos = sortedVideos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  // --- FEATURE 1 LOGIC: STREAK & REWARD SYNC ---
  const handleCompleteWorkout = async () => {
    setIsSubmitting(true);
    try {
      const res = await API.post('/auth/complete-workout', {
        userId: user.id,
        calories: activeVideo.cal
      });
      alert(res.data.message);
      const updatedUser = { 
        ...user, 
        credits: res.data.credits,
        workoutStreak: res.data.streak,
        completedWorkouts: (user.completedWorkouts || 0) + 1 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTodayBurn(prev => prev + parseInt(activeVideo.cal));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to log workout progress.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FEATURE 5 LOGIC: CAST TO TV (FULLSCREEN TRIGGER) ---
  const handleCinemaMode = () => {
    const iframe = document.getElementById('neo-fitness-player');
    if (iframe.requestFullscreen) iframe.requestFullscreen();
    else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
  };

  const handleShareToTV = () => {
    const shareUrl = activeVideo.url.replace("embed/", "watch?v=");
    if (navigator.share) {
      navigator.share({ title: `NeoCare Fitness: ${activeVideo.title}`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Video link copied! Open this URL on your Smart TV browser.");
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8 text-left min-w-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter decoration-blue-600 underline decoration-4 underline-offset-8">Fitness Hub</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4 italic">NeoCare Personalized Wellness</p>
          </div>
          <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <button 
              onClick={() => {setCategory('yoga'); setActiveVideo(VIDEOS.yoga[0]);}}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${category === 'yoga' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Flower2 size={14}/> Yoga
            </button>
            <button 
              onClick={() => {setCategory('exercise'); setActiveVideo(VIDEOS.exercise[0]);}}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all flex items-center gap-2 ${category === 'exercise' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Dumbbell size={14}/> Exercise
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Player Section */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-video relative group">
               <iframe
                id="neo-fitness-player"
                src={activeVideo.url}
                className="w-full h-full"
                title="NeoFitness Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={handleCinemaMode} className="p-4 bg-black/40 backdrop-blur-md text-white rounded-2xl hover:bg-blue-600 transition-all border border-white/10" title="Cinema Mode">
                  <Maximize size={20} />
                </button>
                <button onClick={handleShareToTV} className="p-4 bg-black/40 backdrop-blur-md text-white rounded-2xl hover:bg-emerald-600 transition-all border border-white/10" title="Cast to TV">
                  <Tv size={20} />
                </button>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    {activeVideo.id === recommendedId && (
                      <span className="bg-amber-100 text-amber-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                        <Sparkles size={10}/> AI Recommended
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase italic truncate">{activeVideo.title}</h2>
                  <div className="flex flex-wrap gap-4 mt-2">
                     <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase"><Clock size={14}/> {activeVideo.duration}</span>
                     <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase"><Flame size={14}/> {activeVideo.cal} Kcal</span>
                     <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase"><Trophy size={14}/> {activeVideo.level}</span>
                  </div>
               </div>
               
               <button 
                onClick={handleCompleteWorkout}
                disabled={isSubmitting}
                className={`w-full md:w-auto px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 shrink-0 ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-100'}`}
               >
                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>}
                Mark Session Complete
               </button>
            </div>

            <div className="bg-blue-600 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1">Big Screen Experience</h3>
                  <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">Connect to Smart TV or Tablet for immersive training</p>
               </div>
               <div className="flex gap-4 relative z-10 w-full md:w-auto">
                  <button onClick={handleCinemaMode} className="flex-1 md:flex-none bg-white text-blue-600 px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <Monitor size={16}/> Cinema Mode
                  </button>
                  <button onClick={handleShareToTV} className="flex-1 md:flex-none bg-blue-900/40 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase border border-white/20 hover:bg-blue-900/60 transition-all flex items-center justify-center gap-2">
                    <Tv size={16}/> Push to TV
                  </button>
               </div>
               <Tv className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 -rotate-12" />
            </div>
          </div>

          {/* Playlist Section */}
          <div className="lg:col-span-4 space-y-6 min-w-0">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-[520px]">
              <div className="px-2 mb-6">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Progress</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase">{completedCount}/5 to unlock Pro</p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.min((completedCount / 5) * 100, 100)}%` }} 
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                <input 
                  type="text" 
                  placeholder="Search routine..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl outline-none font-bold text-xs border border-slate-100 focus:border-blue-500 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-2">
                <AnimatePresence mode="popLayout">
                  <motion.div key={category} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    {filteredVideos.map((vid) => {
                      const isLocked = vid.level === "Advanced" && completedCount < 5;
                      return (
                        <div
                          key={vid.id}
                          onClick={() => !isLocked && setActiveVideo(vid)}
                          className={`p-4 rounded-2xl border transition-all flex items-center gap-4 group ${
                            isLocked 
                              ? 'opacity-40 cursor-not-allowed bg-slate-50' 
                              : activeVideo.id === vid.id ? 'bg-blue-50 border-blue-200 cursor-pointer' : 'bg-white border-slate-50 hover:border-blue-100 cursor-pointer'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isLocked
                              ? 'bg-slate-200 text-slate-400'
                              : activeVideo.id === vid.id ? 'bg-blue-600 text-white' : (vid.id === recommendedId ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600')
                          }`}>
                            {isLocked ? <Lock size={18}/> : (activeVideo.id === vid.id ? <PlayCircle size={20}/> : (vid.id === recommendedId ? <Sparkles size={18}/> : <Play size={18}/>))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-black text-slate-800 uppercase truncate">{vid.title}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-2">
                              {vid.duration} • {vid.level}
                              {isLocked && <span className="text-rose-500 font-black flex items-center gap-0.5"><Lock size={8}/> LOCKED</span>}
                              {!isLocked && vid.id === recommendedId && <span className="text-amber-600 font-black tracking-tighter">★ REC</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* --- THE DAILY GOAL MODAL --- */}
            <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase opacity-80 mb-1 tracking-widest">Daily Progress</p>
                <h3 className="text-2xl font-black italic">{todayBurn} / {DAILY_TARGET} Kcal</h3>
                <div className="w-full bg-white/20 h-2 rounded-full mt-4 overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.min((todayBurn/DAILY_TARGET)*100, 100)}%` }} 
                    className="bg-white h-full" 
                   />
                </div>
                <p className="text-[9px] mt-4 font-bold uppercase italic tracking-tighter">
                  {todayBurn >= DAILY_TARGET ? "🎉 Goal Hit! 10 Credits Claimed" : `Burn ${DAILY_TARGET - todayBurn} more for +10 Credits`}
                </p>
              </div>
              <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Fitness;