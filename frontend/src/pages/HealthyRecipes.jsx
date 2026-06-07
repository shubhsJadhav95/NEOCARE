import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Soup, ShieldCheck, ShoppingCart, Apple, PlayCircle, BookOpen,
  Search, Filter, AlertTriangle, ChevronRight, Scale, Clock, X, Heart, Activity, Zap, Loader2, RefreshCw, CheckCircle, Leaf,
  Stethoscope, Info
} from 'lucide-react';
import API from '../utils/api';
import { useCart } from '../context/CartContext'; // Ensure this hook exists

const HealthyRecipes = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const { addToCart } = useCart();
  const [recipes, setRecipes] = useState([]);
  const [dietaryContext, setDietaryContext] = useState({ dietTag: 'General Wellness', activeMeds: [], safetyWarnings: [] });
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  
  // New States for MediMart Integration
  const [mappedProducts, setMappedProducts] = useState([]);
  const [checkingStore, setCheckingStore] = useState(false);

  // STRICTLY ADDED: Filter State and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // NEW: Toggle between Text and Video instructions inside the Modal
  const [instructionMode, setInstructionMode] = useState('text');

  // Fetch Patient's Medical Context (Real-time from Prescription Controller)
  useEffect(() => {
    const fetchContextAndRecipes = async () => {
      try {
        setLoading(true);
        // 1. Fetch Real-time Medical Context (Tags & Safety Rules)
        const contextRes = await API.get(`/prescriptions/dietary-context/${user.id}`);
        const context = contextRes.data;
        setDietaryContext(context);

        // 2. Fetch Recipes with HIGH-QUALITY IMAGE LINKS, DIETARY TYPES, NUTRITION, and STABLE VIDEO EMBEDS
        const allMockRecipes = [
          {
            id: 1,
            title: "Garlic Butter Salmon",
            image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
            videoUrl: "https://www.youtube.com/embed/6i769F8k2_k", 
            calories: 450,
            time: "25 min",
            type: "Non-Veg",
            tags: ["High Protein (Recovery)", "Heart Healthy"],
            nutrition: { protein: "35g", carbs: "4g", fats: "22g", fiber: "1g" },
            recommendedFor: ["Hypertension", "Muscle Recovery", "Heart Health"],
            ingredients: ["Salmon", "Spinach", "Garlic", "Lemon"],
            instructions: [
              "Season salmon fillets with sea salt and black pepper.",
              "Melt butter in a skillet over medium heat and sauté garlic.",
              "Place salmon skin-side down and sear for 5 minutes.",
              "Flip fillets and cook for 3 more minutes until flaky.",
              "Toss in spinach at the last minute until wilted."
            ]
          },
          {
            id: 2,
            title: "Quinoa Salad Bowl",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
            videoUrl: "https://www.youtube.com/embed/C-kE2iC2Yp0",
            calories: 320,
            time: "15 min",
            type: "Veg",
            tags: ["Diabetes Friendly", "Low Glycemic"],
            nutrition: { protein: "14g", carbs: "48g", fats: "9g", fiber: "12g" },
            recommendedFor: ["Type 2 Diabetes", "Cholesterol Management", "Digestion"],
            ingredients: ["Quinoa", "Cucumber", "Olive Oil", "Feta"],
            instructions: [
              "Rinse quinoa and boil in a 1:2 ratio with water.",
              "Dice cucumber and feta cheese into uniform cubes.",
              "Allow quinoa to cool before mixing in vegetables.",
              "Whisk olive oil and lemon for a light dressing.",
              "Gently fold all components together and serve chilled."
            ]
          },
          {
            id: 3,
            title: "Potassium Banana Smoothie",
            image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80",
            videoUrl: "https://www.youtube.com/embed/I0Y-E8R_XU4",
            calories: 210,
            time: "5 min",
            type: "Veg",
            tags: ["General Wellness"],
            nutrition: { protein: "6g", carbs: "36g", fats: "3g", fiber: "5g" },
            recommendedFor: ["Electrolyte Balance", "Fatigue", "Energy Boost"],
            ingredients: ["Bananas", "Milk", "Honey"],
            instructions: [
              "Slice fresh bananas into small segments.",
              "Pour 1 cup of cold milk into the blender base.",
              "Add banana slices and 1 tbsp of raw honey.",
              "Blend on high speed for 45-60 seconds until smooth.",
              "Serve immediately for maximum nutrient absorption."
            ]
          }
        ];

        const matched = allMockRecipes.filter(r => 
          r.tags.includes(context.dietTag) || context.dietTag === 'General Wellness'
        );
        setRecipes(matched);

      } catch (err) { 
        console.error("Nutri-Care Load Error:", err);
        setRecipes([]); 
      }
      finally { setLoading(false); }
    };
    fetchContextAndRecipes();
  }, [user.id]);

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const checkInteraction = (recipeIngredients) => {
    const activeWarnings = [];
    if (dietaryContext.safetyWarnings) {
        dietaryContext.safetyWarnings.forEach(warn => {
          const match = recipeIngredients.find(ing => 
            warn.restrictedFoods.some(rf => ing.toLowerCase().includes(rf.toLowerCase()))
          );
          if (match) activeWarnings.push(warn);
        });
    }
    return activeWarnings;
  };

  const addToGrocery = (recipe) => {
    setGroceryList([...new Set([...groceryList, ...recipe.ingredients])]);
  };

  const syncToMediMart = async () => {
    try {
      setCheckingStore(true);
      const { data } = await API.post('/medicines/match-ingredients', { ingredients: groceryList });
      setMappedProducts(data);
      if(data.length === 0) alert("No direct matches in store.");
    } catch (err) { console.error(err); }
    finally { setCheckingStore(false); }
  };

  const handleBulkPurchase = () => {
    mappedProducts.forEach(product => {
      addToCart({ ...product, quantity: 1 });
    });
    alert("Ingredients successfully synced to your Medical Cart!");
    setMappedProducts([]);
  };

  return (
    <DashboardLayout role="patient">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 text-left gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic leading-tight tracking-tighter">Nutri-Care Finder</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                Target: {dietaryContext.dietTag}
             </span>
             <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest italic">Live Clinical Context</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search recipes..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-100 text-xs font-bold outline-none shadow-sm focus:border-blue-600 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {['All', 'Veg', 'Non-Veg'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  typeFilter === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type === 'Veg' && <Leaf size={12} className="inline mr-1 text-emerald-500" />}
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Zap className="animate-pulse text-blue-600" size={40}/></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => {
                const warnings = checkInteraction(recipe.ingredients);
                return (
                  <motion.div 
                    key={recipe.id}
                    layout
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group cursor-pointer"
                    onClick={() => { setSelectedRecipe(recipe); setInstructionMode('text'); }}
                  >
                    <div className="h-48 relative overflow-hidden">
                       <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-sm border ${
                            recipe.type === 'Veg' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {recipe.type}
                          </span>
                       </div>
                       {warnings.length > 0 && (
                        <div className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                          <AlertTriangle size={16}/>
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-4 text-left">
                      <h3 className="font-black text-xl text-slate-800 uppercase italic leading-tight">{recipe.title}</h3>
                      <div className="flex items-center gap-4 text-slate-400">
                          <div className="flex items-center gap-1 text-[10px] font-bold"><Scale size={14}/> {recipe.calories} kcal</div>
                          <div className="flex items-center gap-1 text-[10px] font-bold"><Clock size={14}/> {recipe.time}</div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                         <span className="text-[10px] font-black text-blue-600 uppercase italic">View Recipe & Video</span>
                         <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="col-span-2 py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <Apple className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matched recipes found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6 text-left">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden min-h-[400px]">
            <ShoppingCart className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 -rotate-12" />
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2 relative z-10">
              <Zap className="text-blue-400" size={20}/> Smart Grocery
            </h3>
            
            <div className="space-y-3 relative z-10 max-h-60 overflow-y-auto no-scrollbar">
              {groceryList.length > 0 ? groceryList.map((item) => (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={item} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-md">
                  <span className="text-xs font-bold text-slate-200">{item}</span>
                  <CheckCircle size={16} className="text-emerald-400" />
                </motion.div>
              )) : (
                <div className="text-center py-10 opacity-40">
                   <Apple size={40} className="mx-auto mb-4" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">List is empty</p>
                </div>
              )}
            </div>

            {groceryList.length > 0 && (
              <div className="mt-8 space-y-4 relative z-10">
                <button 
                  onClick={syncToMediMart} 
                  disabled={checkingStore} 
                  className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                >
                  {checkingStore ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>} Scan Inventory
                </button>
                <AnimatePresence>
                  {mappedProducts.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                        {mappedProducts.map(p => (
                          <div key={p.id} className="text-[10px] font-bold text-slate-300 flex justify-between items-center">
                            <span className="truncate flex-1 mr-2">{p.name}</span>
                            <span className="text-emerald-400">CR {p.price}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={handleBulkPurchase} 
                        className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] shadow-lg shadow-emerald-900/20 hover:bg-emerald-600 transition-all"
                      >
                        Buy All Essentials
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedRecipe && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-0 rounded-[3.5rem] max-w-5xl w-full shadow-2xl relative max-h-[95vh] overflow-y-auto no-scrollbar">
              
              <div className="h-80 w-full relative bg-slate-100 overflow-hidden">
                {instructionMode === 'video' ? (
                  <iframe 
                    key={selectedRecipe.id} 
                    className="w-full h-full" 
                    src={`${selectedRecipe.videoUrl}?autoplay=1&mute=0`} 
                    title="Cooking Tutorial" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen 
                  />
                ) : (
                  <img src={selectedRecipe.image} className="w-full h-full object-cover" alt="" />
                )}
                <button onClick={() => setSelectedRecipe(null)} className="absolute top-8 right-8 p-3 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-rose-500 transition-all z-10"><X size={24}/></button>
              </div>
              
              <div className="p-10 text-left">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRecipe.type === 'Veg' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedRecipe.type} • {selectedRecipe.tags[0]}
                    </span>
                    <h2 className="text-4xl font-black text-slate-800 uppercase italic leading-none mt-2">{selectedRecipe.title}</h2>
                  </div>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shrink-0">
                    <button onClick={() => setInstructionMode('text')} className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${instructionMode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                      <BookOpen size={18}/> <span className="text-[10px] font-black uppercase">Text</span>
                    </button>
                    <button onClick={() => setInstructionMode('video')} className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${instructionMode === 'video' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>
                      <PlayCircle size={18}/> <span className="text-[10px] font-black uppercase">Video</span>
                    </button>
                  </div>
                </div>

                {checkInteraction(selectedRecipe.ingredients).length > 0 && (
                  <div className="bg-rose-50 p-6 rounded-[2.5rem] border-2 border-rose-100 mb-8 flex gap-5">
                     <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-100">
                        <AlertTriangle className="text-white" size={24}/>
                     </div>
                     <div>
                        <h4 className="font-black text-rose-600 uppercase text-xs">Medical Contraindication</h4>
                        <p className="text-xs font-bold text-rose-500 mt-1 leading-relaxed italic">{checkInteraction(selectedRecipe.ingredients)[0].message}</p>
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Zap size={14}/> Ingredients</h4>
                    <div className="space-y-2">
                      {selectedRecipe.ingredients.map(ing => (
                        <div key={ing} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 italic border border-slate-100">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" /> {ing}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* NUTRITION MATRIX */}
                    <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white">
                      <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 flex items-center gap-2"><Scale size={14}/> Nutrition Facts</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-2xl text-center"><p className="text-[9px] text-slate-400 uppercase font-bold">Protein</p><p className="text-sm font-black">{selectedRecipe.nutrition.protein}</p></div>
                        <div className="bg-white/5 p-3 rounded-2xl text-center"><p className="text-[9px] text-slate-400 uppercase font-bold">Carbs</p><p className="text-sm font-black">{selectedRecipe.nutrition.carbs}</p></div>
                        <div className="bg-white/5 p-3 rounded-2xl text-center"><p className="text-[9px] text-slate-400 uppercase font-bold">Fats</p><p className="text-sm font-black">{selectedRecipe.nutrition.fats}</p></div>
                        <div className="bg-white/5 p-3 rounded-2xl text-center"><p className="text-[9px] text-slate-400 uppercase font-bold">Fiber</p><p className="text-sm font-black">{selectedRecipe.nutrition.fiber}</p></div>
                      </div>
                    </div>

                    {/* DOCTOR CLINICAL ADVICE */}
                    <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100">
                      <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-2"><Stethoscope size={14}/> Clinical Advice</h4>
                      <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Recommended For:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.recommendedFor.map(disease => (
                          <span key={disease} className="bg-white px-2 py-1 rounded-lg text-[9px] font-black text-blue-600 border border-blue-100 shadow-sm">{disease}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       {instructionMode === 'text' ? <BookOpen size={14}/> : <PlayCircle size={14}/>} Preparation
                    </h4>
                    {instructionMode === 'text' ? (
                      <div className="space-y-4">
                        {selectedRecipe.instructions.map((step, idx) => (
                          <div key={idx} className="flex gap-4">
                            <span className="text-blue-600 font-black italic text-xl">0{idx + 1}</span>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed mt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center">
                        <PlayCircle size={48} className="text-rose-500 mb-4 animate-pulse" />
                        <p className="text-xs font-black text-slate-800 uppercase italic">Stream Active</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">Visualizing preparation ensures clinical nutrient preservation.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => { addToGrocery(selectedRecipe); setSelectedRecipe(null); }} 
                  className="w-full mt-12 bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black uppercase text-sm tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
                >
                  Add ingredients to smart basket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default HealthyRecipes;