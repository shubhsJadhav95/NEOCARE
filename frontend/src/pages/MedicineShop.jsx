import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Search, ShoppingBasket, Coins, Store, Loader2, 
  Plus, Minus, X, Info, Filter, Package, ShieldAlert, Camera, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';
import { useCart } from '../context/CartContext';

const MedicineShop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All'); 
  const [loading, setLoading] = useState(true);
  const [cartQuantities, setCartQuantities] = useState({});
  
  // Prescription Upload States
  const [rxModal, setRxModal] = useState(null);
  const [rxFile, setRxFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (location.state?.search) setSearchTerm(location.state.search);
    fetchAllMedicines();
  }, [location.state]);

  const fetchAllMedicines = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/medicines/all');
      setMedicines(data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const dynamicCategories = ['All', ...new Set(medicines.map(m => m.category))];

  const updateQty = (id, delta, max) => {
    setCartQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleAddToBasket = (med) => {
    // STRICT FIX: Handle all possible truthy values from MySQL (1, "1", true)
    const needsPrescription = 
      med.requiresPrescription === 1 || 
      med.requiresPrescription === "1" || 
      med.requiresPrescription === true;
    
    if (needsPrescription) {
      setRxModal(med); // This opens the Prescription Modal
      return;
    }
    
    const qty = cartQuantities[med.id] || 1;
    addToCart({ ...med, quantity: qty });
  };

  const handleRxSubmit = async (e) => {
    e.preventDefault();
    if (!rxFile) return alert("Please upload a prescription image.");
    
    setUploading(true);
    const qty = cartQuantities[rxModal.id] || 1;
    
    // Add to cart with the prescription file reference
    addToCart({ 
      ...rxModal, 
      quantity: qty, 
      prescriptionFile: rxFile, 
      hasPrescription: true 
    });
    
    setUploading(false);
    setRxModal(null);
    setRxFile(null);
    alert("Prescription attached. Item added to basket.");
  };

  const filtered = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout role="patient">
      <div className="mb-8 text-left min-w-0">
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">NeoCare Med Mart</h1>
        <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">
            Licensed Pharmacy Network | <span className="text-rose-600 font-black">Rx Required for Regulated Drugs</span>
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6 mb-10 min-w-0">
        <div className="relative text-left">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search medications..." 
            value={searchTerm} 
            className="w-full pl-14 pr-6 py-5 rounded-[2.5rem] border border-slate-100 outline-none shadow-sm font-bold bg-white focus:border-blue-600 transition-all" 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl shrink-0"><Filter size={18}/></div>
          {dynamicCategories.map((cat) => (
            <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shrink-0 border ${
                    activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-blue-600 mb-4" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left min-w-0">
          <AnimatePresence mode='popLayout'>
            {filtered.map((med) => {
              const isRx = med.requiresPrescription === 1 || med.requiresPrescription === "1" || med.requiresPrescription === true;
              return (
                <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={med.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all flex flex-col group relative">
                    
                    {/* Badge System */}
                    <div className="absolute top-5 left-5 z-10 flex gap-2">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-black text-blue-600 uppercase tracking-tighter border border-blue-100 shadow-sm">
                            {med.category}
                        </div>
                        {isRx && (
                            <div className="bg-rose-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
                                <ShieldAlert size={10} /> Rx Required
                            </div>
                        )}
                    </div>

                    {med.discount > 0 && (
                        <div className="absolute top-5 right-5 z-10 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black">
                            {med.discount}% OFF
                        </div>
                    )}

                    {/* Image */}
                    <div className="h-48 bg-slate-50 p-8 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/medicine/${med.id}`)}>
                        <img src={`http://localhost:5000/${med.medicine_photo?.replace(/\\/g, '/')}`} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={med.name} />
                    </div>
                    
                    {/* Info */}
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="font-black text-xl text-slate-800 uppercase truncate mb-1">{med.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase italic mb-2 tracking-widest">{med.manufacturer}</p>
                        
                        <div className="flex justify-between items-center my-4 bg-slate-50 p-3 rounded-2xl">
                            <div className="text-left">
                                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Price</p>
                                <p className="text-2xl font-black text-blue-600 flex items-center gap-1 leading-none">
                                    <Coins size={18} /> {med.price}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                                <button onClick={() => updateQty(med.id, -1, med.stock)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100"><Minus size={14}/></button>
                                <span className="font-black text-sm w-4 text-center">{cartQuantities[med.id] || 1}</span>
                                <button onClick={() => updateQty(med.id, 1, med.stock)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-slate-100"><Plus size={14}/></button>
                            </div>
                        </div>

                        <button 
                            disabled={med.stock <= 0} 
                            onClick={() => handleAddToBasket(med)} 
                            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl transition-all uppercase text-[10px] tracking-widest active:scale-95 disabled:bg-slate-200 ${
                                isRx ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {med.stock <= 0 ? 'Out of Stock' : (
                                isRx ? <><Camera size={18} /> Upload Rx & Buy</> : <><ShoppingBasket size={18} /> Add to Basket</>
                            )}
                        </button>
                    </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Prescription Upload Modal */}
      <AnimatePresence>
        {rxModal && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 text-left">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl relative">
              <button onClick={() => setRxModal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><X size={24}/></button>
              
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldAlert size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-tight mb-2">Prescription Verification</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Medicine <b>{rxModal.name}</b> requires a valid prescription. Please upload a clear photo to proceed with your order.
              </p>
              
              <form onSubmit={handleRxSubmit} className="space-y-6">
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setRxFile(e.target.files[0])} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    required 
                  />
                  <div className={`w-full p-8 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${
                    rxFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 group-hover:border-blue-400'
                  }`}>
                    {rxFile ? (
                      <>
                        <CheckCircle className="text-emerald-500" size={32} />
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">{rxFile.name}</p>
                      </>
                    ) : (
                      <>
                        <Camera className="text-slate-300" size={32} />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Click to Upload Photo</p>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18}/> : 'Confirm & Add to Basket'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default MedicineShop;