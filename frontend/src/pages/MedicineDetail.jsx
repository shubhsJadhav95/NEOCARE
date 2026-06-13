import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Star, ShoppingCart, Plus, Minus, ArrowLeft, 
  ShieldCheck, Info, CheckCircle, Package, Sparkles, MessageSquare 
} from 'lucide-react';
import API from '../utils/api';
import { motion } from 'framer-motion';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [medicine, setMedicine] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const fetchDetails = async () => {
    try {
      const { data } = await API.get(`/medicines/details/${id}`);
      setMedicine(data);
      setMainImage(`https://api.neocare.devcloudzone.store/${data.medicine_photo}`);
      
      const recRes = await API.get(`/medicines/recommendations?category=${data.category}&excludeId=${id}`);
      setRecommendations(recRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic: Using the review route standard /api/reviews/add
      await API.post(`/reviews/add`, { 
        ...review, 
        userId: user.id, 
        medicineId: id 
      });
      alert("Review posted!");
      setReview({ rating: 5, comment: '' });
      fetchDetails();
    } catch (err) { 
      alert(err.response?.data?.message || "Failed to post review."); 
    }
  };

  if (!medicine) return <div className="h-screen flex items-center justify-center font-black uppercase text-slate-400">Loading Product...</div>;

  return (
    <DashboardLayout role="patient">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-bold mb-8 hover:text-blue-600 transition-all text-left">
        <ArrowLeft size={18} /> Back to Mart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 text-left">
        {/* GALLERY SECTION */}
        <div className="space-y-6">
          <div className="h-[450px] bg-slate-50 rounded-[2.5rem] flex items-center justify-center p-12 border border-slate-100 overflow-hidden">
            <motion.img 
              key={mainImage} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              src={mainImage} 
              className="max-h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500" 
              onError={(e) => e.target.src = 'https://placehold.co/600x600?text=' + medicine.name}
            />
          </div>
          <div className="flex gap-4 justify-center">
            {[medicine.medicine_photo, 'uploads/side_view.jpg'].map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setMainImage(idx === 0 ? `https://api.neocare.devcloudzone.store/${medicine.medicine_photo}` : `https://placehold.co/600x600?text=Side+View`)}
                className={`w-20 h-20 rounded-2xl border-2 p-2 transition-all bg-slate-50 ${mainImage.includes(img) || (idx === 0 && mainImage.includes(medicine.medicine_photo)) ? 'border-blue-600 scale-105 shadow-md' : 'border-slate-100 opacity-60'}`}
              >
                <img src={idx === 0 ? `https://api.neocare.devcloudzone.store/${medicine.medicine_photo}` : `https://placehold.co/100x100?text=Alt`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">{medicine.name}</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1 italic">Brand: {medicine.manufacturer}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-emerald-500 text-white px-3 py-1 rounded-lg items-center gap-1 font-black text-sm">
              {medicine.averageRating || "4.5"} <Star size={14} fill="currentColor" />
            </div>
            <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{medicine.reviewCount || "0"} Patient Reviews</p>
          </div>

          {/* PRICE BREAKDOWN SECTION */}
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MRP ₹{medicine.oldPrice}</p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{medicine.price}</span>
                  <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase animate-bounce">
                    {medicine.discount}% OFF
                  </span>
                </div>
             </div>
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic mt-4">Inclusive of all taxes</p>
          </div>

          <div className="space-y-4">
             <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-blue-600"/> Product Highlights</h4>
             <div className="grid grid-cols-2 gap-4">
                {(medicine.highlights || "Fast Acting, Lab Tested, Verified Seller, Hygienic").split(',').map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-500 text-xs font-bold bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"><CheckCircle size={14} className="text-emerald-500" /> {h.trim()}</div>
                ))}
             </div>
          </div>

          <div className="flex gap-4 pt-4">
            <div className="flex items-center bg-slate-100 rounded-2xl p-2 gap-8 px-6 border border-slate-200">
               <button onClick={() => setQty(q => Math.max(1, q-1))} className="text-slate-500 hover:text-blue-600 transition-colors"><Minus size={18}/></button>
               <span className="font-black text-xl text-slate-800 w-4 text-center">{qty}</span>
               <button onClick={() => setQty(q => q+1)} className="text-slate-500 hover:text-blue-600 transition-colors"><Plus size={18}/></button>
            </div>
            <button className="flex-1 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              <ShoppingCart size={20}/> Add to Basket
            </button>
          </div>
        </div>
      </div>

      {/* CROSS-SELLING CAROUSEL */}
      {recommendations.length > 0 && (
        <div className="mt-16 text-left">
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-8 italic flex items-center gap-3">
            <Package className="text-blue-600" /> People Also Bought
          </h3>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2">
             {recommendations.map(rec => (
               <div 
                 key={rec.id} 
                 onClick={() => navigate(`/medicine/${rec.id}`)}
                 className="min-w-[260px] bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all cursor-pointer group"
               >
                  <div className="h-36 bg-slate-50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-slate-50">
                     <img src={`https://api.neocare.devcloudzone.store/${rec.medicine_photo}`} className="max-h-full object-contain group-hover:scale-110 transition-transform" onError={(e) => e.target.src='https://placehold.co/200?text=Medicine'} />
                  </div>
                  <h4 className="font-black text-slate-800 text-sm uppercase mb-1 line-clamp-1 group-hover:text-blue-600">{rec.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">{rec.category}</p>
                  <div className="flex justify-between items-center">
                     <p className="font-black text-blue-600 text-lg">₹{rec.price}</p>
                     <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Plus size={16}/></div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* PRODUCT INFORMATION SECTION */}
      <div className="mt-12 text-left space-y-12 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest border-l-8 border-blue-600 pl-4 mb-6">Medicine Description</h3>
          <p className="text-slate-500 font-medium leading-relaxed max-w-4xl">
            {medicine.description || `${medicine.name} is a high-quality ${medicine.category} manufactured by ${medicine.manufacturer}. Sourced from verified sellers to ensure medical compliance and patient safety.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={16}/> Safety Advice
            </h4>
            <p className="text-slate-500 text-sm font-medium italic bg-slate-50 p-5 rounded-2xl border-l-4 border-blue-400">
              {medicine.safety_info || "Always consult with a healthcare professional before use. Keep away from direct sunlight and store in a cool dry place."}
            </p>
          </div>
        </div>
      </div>

      {/* REVIEW SECTION */}
      <div className="mt-12 text-left bg-slate-900 text-white p-12 rounded-[3rem] shadow-xl mb-20">
         <div className="flex items-center gap-3 mb-8">
            <MessageSquare size={24} className="text-blue-400" />
            <h3 className="text-xl font-black uppercase tracking-tighter italic">Patient Experiences</h3>
         </div>
         
         <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div className="flex gap-2">
               {[1,2,3,4,5].map(n => (
                 <Star key={n} size={28} className="cursor-pointer transition-all hover:scale-110" fill={review.rating >= n ? "#3b82f6" : "none"} stroke={review.rating >= n ? "#3b82f6" : "white"} onClick={() => setReview({...review, rating: n})} />
               ))}
            </div>
            <textarea 
              value={review.comment} 
              onChange={(e) => setReview({...review, comment: e.target.value})}
              placeholder="Was this medication helpful? Share your results..." 
              className="w-full bg-slate-800 border-none rounded-2xl p-6 text-sm font-medium outline-none ring-2 ring-slate-700 focus:ring-blue-600 transition-all h-32" 
            />
            <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-900">Submit Feedback</button>
         </form>

         <div className="mt-12 space-y-4">
            {medicine.reviews?.length > 0 ? medicine.reviews.map((r, i) => (
              <div key={i} className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
                <div className="flex justify-between items-start mb-2">
                   <p className="font-black text-xs uppercase text-blue-400">{r.user?.name}</p>
                   <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: r.rating }).map((_, idx) => <Star key={idx} size={12} fill="currentColor" />)}
                   </div>
                </div>
                <p className="text-sm text-slate-300 italic">"{r.comment}"</p>
              </div>
            )) : (
              <p className="text-slate-500 font-bold italic py-4">No reviews yet for this product.</p>
            )}
         </div>
      </div>
    </DashboardLayout>
  );
};

export default MedicineDetail;