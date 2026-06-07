import React from 'react';
import { Newspaper, ArrowUpRight, HeartPulse, Activity, FlaskConical } from 'lucide-react';

const HealthNews = () => {
  const newsItems = [
    {
      id: 1,
      category: "Innovation",
      title: "AI in Radiology: Breakthrough in Early Detection",
      source: "HealthTech Daily",
      icon: <Activity className="text-blue-500" />,
      color: "border-blue-100"
    },
    {
      id: 2,
      category: "Wellness",
      title: "The Impact of 7-Hour Sleep on Mental Clarity",
      source: "Wellness Journal",
      icon: <HeartPulse className="text-rose-500" />,
      color: "border-rose-100"
    },
    {
      id: 3,
      category: "Research",
      title: "New Vaccine Trials Show 95% Efficacy Rates",
      source: "Medical News",
      icon: <FlaskConical className="text-emerald-500" />,
      color: "border-emerald-100"
    }
  ];

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="text-neo-blue" size={24} />
        <h2 className="text-xl font-black text-neo-slate uppercase tracking-tight">Health Insights</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {newsItems.map((item) => (
          <div key={item.id} className={`bg-white p-6 rounded-[2rem] border-2 ${item.color} hover:shadow-xl transition-all group cursor-pointer`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors">
                {item.icon}
              </div>
              <ArrowUpRight size={18} className="text-slate-300 group-hover:text-neo-blue transition-colors" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
            <h3 className="font-bold text-neo-slate mt-2 leading-tight group-hover:text-neo-blue transition-colors">
              {item.title}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-4 italic">— {item.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthNews;