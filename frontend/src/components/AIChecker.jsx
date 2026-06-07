import React, { useState } from 'react';
import { Bot, X, Send, Activity, ShieldAlert, Sparkles, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const AIChecker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await API.post('/ai/analyze', { symptoms: input });
      setResult(res.data);
    } catch (err) {
      alert("AI analysis error. Using local fallback.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindDoctor = () => {
    setIsOpen(false);
    navigate('/find-doctor', { state: { autoFilter: result.specialist } });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg flex items-center gap-2 group shrink-0"
        title="AI Symptom Checker"
      >
        <Bot size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">NeoAI</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[4999]"
            />
            
            <motion.div 
              initial={{ x: 500, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 500, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[5000] shadow-2xl border-l border-slate-100 flex flex-col"
            >
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-blue-400" size={20} />
                  <h2 className="font-black uppercase italic tracking-tighter text-xl">NeoAI Assist</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-xl">
                   <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {!result ? (
                  <div className="text-center py-10">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity size={32} className="text-blue-600" />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase text-sm">How are you feeling?</h3>
                    <p className="text-xs text-slate-500 mt-2 font-bold leading-relaxed italic">"Describe your symptoms like: I have a persistent cough and fever."</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
                     <div className={`p-5 rounded-3xl border-2 ${result.severity === 'High' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Severity Assessment</p>
                        <h4 className={`font-black uppercase text-xl ${result.severity === 'High' ? 'text-rose-600' : 'text-emerald-600'}`}>{result.severity}</h4>
                     </div>

                     <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
                        <p className="text-[10px] font-black text-blue-400 uppercase mb-3">Recommended Specialist</p>
                        <h4 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2 mb-4">
                          <ShieldAlert className="text-blue-500" size={18}/> {result.specialist}
                        </h4>
                        <button 
                          onClick={handleFindDoctor}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all shadow-lg"
                        >
                          <Search size={14}/> Find {result.specialist} Now
                        </button>
                     </div>

                     <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential Causes</p>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          "{result.causes}"
                        </p>
                     </div>
                  </motion.div>
                )}
              </div>

              <div className="p-8 border-t border-slate-50 bg-white shrink-0">
                <div className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe symptoms..." 
                    className="w-full bg-slate-100 p-5 pr-16 rounded-3xl font-bold text-xs outline-none focus:ring-4 focus:ring-blue-50 transition-all border border-transparent focus:border-blue-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
                  />
                  <button 
                    onClick={handleCheck}
                    disabled={loading}
                    className="absolute right-2 top-2 p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} />}
                  </button>
                </div>
                <p className="text-[8px] text-center text-slate-400 mt-4 uppercase font-black tracking-widest">AI tool for guidance only.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChecker;