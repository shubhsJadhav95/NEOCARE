import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, AlertTriangle, BarChart3, MessageSquare } from 'lucide-react';

const MedicineAnalytics = ({ reviews }) => {
  // NLP Simulation: Logic to calculate sentiment and extract issues
  const analyzeSentiment = () => {
    if (!reviews || reviews.length === 0) return { score: 0, pos: 0, neg: 0, issues: [] };

    let totalScore = 0;
    let positiveCount = 0;
    const issuesMap = {};

    reviews.forEach(rev => {
      // Assuming 'sentimentScore' (0 to 1) is provided by your NLP backend
      const score = rev.sentimentScore || 0.5; 
      totalScore += score;
      if (score >= 0.6) positiveCount++;
      
      // Extracting frequent negative keywords for the pharmacist
      if (score < 0.4 && rev.comment) {
        const keywords = ["side effects", "expensive", "packaging", "expiry", "taste"];
        keywords.forEach(word => {
          if (rev.comment.toLowerCase().includes(word)) {
            issuesMap[word] = (issuesMap[word] || 0) + 1;
          }
        });
      }
    });

    const avgScore = totalScore / reviews.length;
    return {
      score: avgScore,
      posPercent: Math.round((positiveCount / reviews.length) * 100),
      negPercent: 100 - Math.round((positiveCount / reviews.length) * 100),
      topIssues: Object.entries(issuesMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
    };
  };

  const data = analyzeSentiment();

  // Helper for Satisfaction Bar color
  const getBarColor = (score) => {
    if (score < 0.4) return "#ef4444"; // Red
    if (score < 0.7) return "#f59e0b"; // Yellow
    return "#10b981"; // Green
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800 uppercase italic flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={20} /> Product Intelligence
        </h3>
        <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase text-slate-500">
          NLP Powered
        </span>
      </div>

      {/* --- REAL-TIME SATISFACTION BAR --- */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Customer Satisfaction</span>
          <span style={{ color: getBarColor(data.score) }}>{Math.round(data.score * 100)}%</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 opacity-20" />
          {/* Animated Indicator */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${data.score * 100}%` }}
            transition={{ type: "spring", stiffness: 50 }}
            className="h-full shadow-lg relative z-10"
            style={{ backgroundColor: getBarColor(data.score) }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
          <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Satisfied</p>
          <p className="text-2xl font-black text-emerald-700">{data.posPercent}%</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
          <p className="text-[9px] font-black text-rose-600 uppercase mb-1">Unsatisfied</p>
          <p className="text-2xl font-black text-rose-700">{data.negPercent}%</p>
        </div>
      </div>

      {/* --- PHARMACIST INSIGHTS: WHAT IS WRONG? --- */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-500" /> Root Cause Analysis
        </h4>
        <div className="space-y-2">
          {data.topIssues.length > 0 ? data.topIssues.map(([issue, count]) => (
            <div key={issue} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700 capitalize">{issue}</span>
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">
                {count} Mentions
              </span>
            </div>
          )) : (
            <p className="text-[10px] font-bold text-slate-400 italic">No significant product issues detected.</p>
          )}
        </div>
      </div>

      <div className="bg-blue-600 p-4 rounded-3xl text-white flex items-center gap-4">
        <MessageSquare size={24} className="opacity-50" />
        <div>
          <p className="text-[10px] font-bold uppercase opacity-80 leading-none">AI Summary</p>
          <p className="text-xs font-black italic">
            {data.score > 0.7 ? "Strong product performance. Stock up." : "Review pricing or storage conditions."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicineAnalytics;