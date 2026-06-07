import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Package, Plus, Camera, Coins, X, 
  Loader2, Calendar, Sparkles, CheckCircle, Edit3, Percent, FileImage, Info, ShieldAlert, Search, Filter, AlertCircle,
  BarChart3, ThumbsUp, ThumbsDown, AlertTriangle, MessageSquare
} from 'lucide-react';
import API from '../utils/api';

// --- SUB-COMPONENT: NLP SENTIMENT ANALYTICS (CENTERED MODAL) ---
const MedicineAnalyticsModal = ({ medicine, onClose }) => {
  // CRITICAL GUARD: Prevents the "Cannot read properties of undefined" error
  if (!medicine) return null;
  
  // Logic: Ensure we are using the reviews attached to the medicine object
  const reviews = medicine?.reviews || [];

  const analyzeSentiment = () => {
    // FIXED: Return early if reviews array is empty or undefined to prevent crash
    if (!reviews || reviews.length === 0) {
      return { score: 0.8, posPercent: 100, negPercent: 0, topIssues: [] }; 
    }

    let totalScore = 0;
    const issuesMap = {};
    
    reviews.forEach(rev => {
      // Normalize rating (1-5) to a 0-1 scale for polarity
      const score = (rev.rating || 5) / 5;
      totalScore += score;

      // NLP Keyword Extraction for friction points (Sentiment Logic)
      if (score < 0.6) {
        const keywords = ["side effects", "expensive", "packaging", "expiry", "taste", "bitter", "damaged"];
        keywords.forEach(word => {
          if (rev.comment?.toLowerCase().includes(word)) {
            issuesMap[word] = (issuesMap[word] || 0) + 1;
          }
        });
      }
    });

    const avgScore = totalScore / reviews.length;
    const posPercent = Math.round(avgScore * 100);

    return {
      score: avgScore,
      posPercent: posPercent,
      negPercent: 100 - posPercent,
      topIssues: Object.entries(issuesMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
    };
  };

  const data = analyzeSentiment();
  
  // REAL-TIME COLOR LOGIC
  const getBarColor = (s) => {
    if (s < 0.4) return "#ef4444"; // Red (Critical)
    if (s < 0.75) return "#f59e0b"; // Yellow (Warning)
    return "#10b981"; // Green (Optimal)
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-lg w-full relative space-y-8"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-all">
          <X size={28}/>
        </button>

        <div className="text-left">
          <h3 className="text-2xl font-black text-slate-800 uppercase italic flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={28} /> {medicine.name} Insight
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">NLP Sentiment Analysis Report</p>
        </div>

        {/* --- SATISFACTION BAR (HORIZONTAL MULTI-COLOR LINE) --- */}
        <div className="space-y-3 text-left min-h-[60px]">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
            <span>Customer Satisfaction Index</span>
            <span style={{ color: getBarColor(data.score) }}>{data.posPercent}% Positive</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-50">
            {/* Base Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 opacity-20" />
            {/* Real-time Indicator Layer */}
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${data.posPercent}%` }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full relative z-10 shadow-lg" 
              style={{ backgroundColor: getBarColor(data.score) }} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-center">
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Satisfied</p>
            <p className="text-3xl font-black text-emerald-700">{data.posPercent}%</p>
          </div>
          <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 text-center">
            <p className="text-[10px] font-black text-rose-600 uppercase mb-1">Unsatisfied</p>
            <p className="text-3xl font-black text-rose-700">{data.negPercent}%</p>
          </div>
        </div>

        {/* --- ROOT CAUSE ANALYSIS (EXTRACTED VIA NLP) --- */}
        <div className="space-y-4 text-left">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" /> Key Consumer Pain Points
          </h4>
          <div className="space-y-3">
            {data.topIssues.length > 0 ? data.topIssues.map(([issue, count]) => (
              <div key={issue} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-sm font-bold text-slate-700 capitalize">{issue}</span>
                <span className="text-xs font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-xl">{count} Mentions</span>
              </div>
            )) : <p className="text-xs font-bold text-slate-400 italic bg-slate-50 p-6 rounded-2xl text-center">AI: No negative feedback detected via NLP.</p>}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-center gap-5 text-left relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-600 opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
          <MessageSquare size={32} className="text-blue-400 shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase text-blue-400 mb-1 tracking-widest">Analyst Verdict</p>
            <p className="text-sm font-bold italic leading-tight text-slate-200">
              {data.score > 0.75 ? "Market sentiment is highly positive. Recommended for bulk stocking." : 
               data.score > 0.4 ? "NLP detects friction; audit packaging or pricing." : 
               "Urgent: Negative feedback detected. Investigate product quality immediately."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MediMart = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [medicines, setMedicines] = useState([]);
  const [pushedMedicines, setPushedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '', manufacturer: '', category: 'Tablet', price: '', stock: '', expiryDate: '', 
    requiresPrescription: false, discount: 0, description: '', highlights: '', safety_info: ''
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/medicines/inventory/${user.id}`);
      setMedicines(data);
      const pushedRes = await API.get('/admin/pushed-medicines');
      setPushedMedicines(pushedRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, []);

  const dynamicCategories = ['All', ...new Set(medicines.map(m => m.category))];

  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = (med.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (med.manufacturer || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || med.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditOpen = (med) => {
    setEditingId(med.id);
    setFormData({
      name: med.name, manufacturer: med.manufacturer, category: med.category, price: med.price, stock: med.stock, expiryDate: med.expiryDate,
      requiresPrescription: med.requiresPrescription === 1 || med.requiresPrescription === true,
      discount: med.discount || 0, description: med.description || '', highlights: med.highlights || '', safety_info: med.safety_info || ''
    });
    setShowModal(true);
  };

  const handleAutoFill = (medicineName) => {
    setEditingId(null);
    setFormData({ ...formData, name: medicineName });
    setShowModal(true);
  };

  const handleMarkHandled = async (medicineName) => {
    try {
      await API.post('/admin/mark-handled', { medicineName });
      setPushedMedicines(prev => prev.filter(m => m.medicineName !== medicineName));
    } catch (err) { alert("Failed to archive alert"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'requiresPrescription') { data.append(key, formData[key] ? 1 : 0); } 
      else { data.append(key, formData[key]); }
    });
    data.append('pharmacistId', user.id);
    if (photo) data.append('medicine_photo', photo);

    try {
      if (editingId) {
        await API.put(`/medicines/update/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await API.post('/medicines/add', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      setEditingId(null);
      setPhoto(null);
      setFormData({ name: '', manufacturer: '', category: 'Tablet', price: '', stock: '', expiryDate: '', requiresPrescription: false, discount: 0, description: '', highlights: '', safety_info: '' });
      fetchInventory();
    } catch (err) { alert("Error: " + (err.response?.data?.message || "Operation failed")); }
  };

  return (
    <DashboardLayout role="pharmacist">
      <div className="flex justify-between items-center mb-8 text-left min-w-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic decoration-blue-600 underline decoration-4 underline-offset-8">MediMart Management</h1>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest mt-4 italic">Inventory Control Center</p>
        </div>
        <button onClick={() => { setEditingId(null); setPhoto(null); setShowModal(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-700 shadow-xl transition-all">
          <Plus size={18} /> New Medicine
        </button>
      </div>

      <div className="space-y-6 min-w-0">
          <div className="relative text-left">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search pharmacy stock..." className="w-full pl-16 pr-6 py-5 rounded-[2.5rem] bg-white border border-slate-100 outline-none shadow-sm font-bold" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl shrink-0"><Filter size={18}/></div>
            {dynamicCategories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 border ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 border-slate-100'}`}>{cat}</button>
            ))}
          </div>

          <AnimatePresence>
            {pushedMedicines.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-10 bg-blue-50 border-2 border-blue-100 p-8 rounded-[3rem] text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Sparkles size={20}/></div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Demand Alerts</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pushedMedicines.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-blue-100 flex flex-col justify-between">
                      <h4 className="font-black text-slate-800 text-lg uppercase italic">{item.medicineName}</h4>
                      <p className="text-[9px] text-slate-400 font-bold mb-4 uppercase truncate">REASON: {item.reason}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleAutoFill(item.medicineName)} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black text-[9px] uppercase hover:bg-blue-700 transition-all">Stock Up</button>
                        <button onClick={() => handleMarkHandled(item.medicineName)} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600"><CheckCircle size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {filteredMedicines.map((med) => (
                <motion.div 
                  onClick={() => setSelectedMedicine(med)} 
                  layout 
                  key={med.id} 
                  className={`bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group relative cursor-pointer ${selectedMedicine?.id === med.id ? 'ring-4 ring-blue-600 border-transparent shadow-xl' : 'border-slate-100'}`}
                >
                  <button onClick={(e) => { e.stopPropagation(); handleEditOpen(med); }} className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl text-blue-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-blue-600 hover:text-white">
                    <Edit3 size={18} />
                  </button>
                  <div className="h-44 bg-slate-50 flex items-center justify-center p-6 relative">
                    <img src={`http://localhost:5000/${med.medicine_photo?.replace(/\\/g, '/')}`} alt={med.name} className="max-h-full object-contain mix-blend-multiply" />
                    {med.requiresPrescription === 1 && <div className="absolute bottom-2 right-2 p-1.5 bg-rose-50 text-rose-600 rounded-lg"><ShieldAlert size={14} /></div>}
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-lg text-slate-800 uppercase mb-1 truncate">{med.name}</h3>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase italic truncate">{med.manufacturer}</p>
                      <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-lg">Stock: {med.stock}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                      <p className="text-[10px] text-slate-400 font-black uppercase">Price</p>
                      <p className="font-black text-blue-600 flex items-center gap-1"><Coins size={14}/>{med.price}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>

      {/* --- SENTIMENT ANALYTICS MODAL --- */}
      <AnimatePresence>
        {selectedMedicine && (
          <MedicineAnalyticsModal 
            medicine={selectedMedicine} 
            onClose={() => setSelectedMedicine(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- EDIT/ADD MODAL (ALL FIELDS PRESERVED) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.form initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl relative text-left overflow-y-auto max-h-[90vh] no-scrollbar">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 transition-all"><X size={28}/></button>
            <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight uppercase italic">{editingId ? 'Modify Stock' : 'Add New Medicine'}</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Camera size={14}/> Product Image</label>
                  <div className="relative group">
                    <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-400 group-hover:border-blue-400 transition-all">
                      {photo ? <><CheckCircle size={20}/> {photo.name}</> : <><FileImage size={20}/> Change Photo</>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><ShieldAlert size={14}/> Legal Rule</label>
                  <div onClick={() => setFormData({...formData, requiresPrescription: !formData.requiresPrescription})} className={`w-full p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${formData.requiresPrescription ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <span className="text-[10px] font-black uppercase italic">Need Rx?</span>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${formData.requiresPrescription ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'}`}>{formData.requiresPrescription && <CheckCircle size={14} />}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Brand Name</label>
                  <input type="text" value={formData.name} placeholder="Name" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Manufacturer</label>
                  <input type="text" value={formData.manufacturer} placeholder="Manufacturer" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" onChange={e => setFormData({...formData, manufacturer: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Price</label>
                   <input type="number" step="0.01" value={formData.price} placeholder="Price" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Stock</label>
                   <input type="number" value={formData.stock} placeholder="Stock" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" onChange={e => setFormData({...formData, stock: e.target.value})} required />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Discount %</label>
                   <input type="number" value={formData.discount} placeholder="Disc %" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" onChange={e => setFormData({...formData, discount: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.category} placeholder="Category" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" onChange={e => setFormData({...formData, category: e.target.value})} required />
                <input type="date" value={formData.expiryDate} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold" onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
              </div>
              
              {/* --- DETAILED ANALYST FIELDS --- */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Info size={12}/> Detailed Summary</label>
                  <textarea value={formData.description} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs outline-none h-24" placeholder="Brief details about the medicine..." onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Sparkles size={12}/> Highlights</label>
                    <input type="text" value={formData.highlights} placeholder="e.g. Paracetamol 500mg" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs outline-none" onChange={e => setFormData({...formData, highlights: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><AlertCircle size={12}/> Safety Information</label>
                    <input type="text" value={formData.safety_info} placeholder="e.g. Do not consume with alcohol" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-xs outline-none" onChange={e => setFormData({...formData, safety_info: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full mt-8 bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase shadow-xl hover:bg-blue-700 active:scale-95 transition-all">Submit Inventory Update</button>
          </motion.form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MediMart;