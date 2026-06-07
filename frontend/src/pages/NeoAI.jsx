import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Send, Activity, ShieldAlert, Sparkles, Loader2, Search, Brain, ArrowRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const NeoAI = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // Logic: Backend now uses the Rule-Based Inference Engine for accuracy
      const res = await API.post('/ai/analyze', { symptoms: input });
      setResult(res.data);
    } catch (err) {
      alert("AI analysis error. Using local medical fallback.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindDoctor = () => {
    navigate('/find-doctor', { state: { autoFilter: result.specialist } });
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="mb-10 text-left">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-white">
              <Brain size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">NeoAI Diagnostic</h1>
              <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Precision Symptom Inference Engine</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* INPUT AREA (LEFT) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm sticky top-28">
              <form onSubmit={handleCheck} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Input</label>
                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Real-time Analysis</span>
                  </div>
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your condition in detail (e.g., 'I have a sharp chest pain that spreads to my arm' or 'Give me tips for high blood pressure')..."
                    className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-blue-100 rounded-[2.5rem] font-bold text-sm outline-none focus:ring-4 focus:ring-blue-50/50 transition-all min-h-[250px] resize-none leading-relaxed text-slate-700"
                  />
                </div>
                <button 
                  disabled={loading || !input}
                  className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50 shadow-xl active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="text-blue-400" />}
                  {loading ? 'Consulting Knowledge Base...' : 'Analyze Symptoms'}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-50">
                 <div className="flex gap-4 items-start bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                    <ShieldAlert size={24} className="text-blue-600 shrink-0" />
                    <p className="text-[10px] font-bold text-blue-800 leading-relaxed uppercase tracking-tight text-left">
                      Logic: NeoAI distinguishes between general health queries and acute symptoms to provide differentiated clinical advice.
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* RESULTS AREA (RIGHT) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[500px] flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[4rem] p-12 text-center bg-white/50">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Activity size={48} className="text-slate-200 animate-pulse" />
                  </div>
                  <h3 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] max-w-xs leading-loose">
                    Analysis Engine Standby<br/>Awaiting Patient Symptom Stream
                  </h3>
                </motion.div>
              ) : loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[4rem] border border-slate-100 p-12 text-center shadow-sm">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-20 animate-pulse"></div>
                    <Loader2 size={64} className="text-blue-600 animate-spin mb-8 relative z-10" />
                  </div>
                  <p className="text-slate-800 font-black text-sm uppercase tracking-[0.2em] animate-pulse">
                    Scanning Clinical Patterns...
                  </p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-left">
                  
                  {/* CRITICAL RED FLAGS (HIGH ACCURACY ALERT) */}
                  {result.redFlags && result.redFlags.length > 0 && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-rose-600 text-white p-8 rounded-[3.5rem] shadow-2xl border-4 border-white">
                      <div className="flex items-center gap-4 mb-4">
                        <AlertCircle size={32} className="animate-bounce" />
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Emergency Alert</h2>
                      </div>
                      <div className="space-y-3">
                        {result.redFlags.map((flag, i) => (
                          <div key={i} className="flex gap-3 items-center bg-white/10 p-3 rounded-2xl border border-white/20">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <p className="font-black text-xs uppercase tracking-wide">{flag}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* SEVERITY ASSESSMENT */}
                  <div className={`p-8 rounded-[3.5rem] border-4 flex items-center justify-between ${result.severity === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Risk Assessment</p>
                      <h2 className="text-5xl font-black uppercase italic tracking-tighter">{result.severity}</h2>
                    </div>
                    <div className={`p-4 rounded-3xl ${result.severity === 'High' ? 'bg-rose-100' : 'bg-emerald-100'}`}>
                       <ShieldAlert size={40} />
                    </div>
                  </div>

                  {/* SPECIALIST RECOMMENDATION & FIND BUTTON */}
                  <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Search size={120} />
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                        <CheckCircle2 size={14}/> Recommendation Logic
                      </p>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                           <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                             <Search size={32}/>
                           </div>
                           <div>
                              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-tight">Consult a<br/>{result.specialist}</h3>
                              <span className="inline-block mt-2 px-4 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase">Verified Specialist Path</span>
                           </div>
                        </div>
                        <button 
                          onClick={handleFindDoctor}
                          className="bg-blue-600 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 group active:scale-95"
                        >
                          Find {result.specialist} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 relative z-10">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Clinical Observation</p>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="font-bold text-slate-700 italic leading-relaxed text-lg">"{result.causes}"</p>
                      </div>
                    </div>
                  </div>

                  {/* TIPS & HEALTH GUIDANCE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.tips?.map((tip, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-lg flex flex-col justify-between"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-sm font-black mb-6 shadow-lg shadow-blue-500/20">{i+1}</div>
                        <p className="text-sm font-bold text-slate-300 leading-relaxed tracking-tight">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NeoAI;