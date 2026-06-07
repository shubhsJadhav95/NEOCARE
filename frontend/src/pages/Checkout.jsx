import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useCart } from '../context/CartContext';
import { CreditCard, Truck, ShieldCheck, ShoppingBag, Trash2, Plus, Minus, CheckCircle, Percent, Coins, Loader2, AlertCircle } from 'lucide-react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, cartTotal, updateQty, removeFromCart, clearCart } = useCart();
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await API.get(`/auth/profile/${user.id}`);
      setUserCredits(res.data.credits || 0);
    };
    fetchBalance();
  }, [user.id]);

  const totalSavings = cart.reduce((acc, item) => {
    const originalPrice = parseFloat(item.oldPrice || item.price);
    const discountedPrice = parseFloat(item.price);
    const savingPerUnit = originalPrice - discountedPrice;
    return acc + (savingPerUnit * item.quantity);
  }, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    // Logic: STRICT CREDIT VALIDATION
    if (userCredits < cartTotal) {
      return alert(`Insufficient Credits! Total Required: ${cartTotal} CR. Your Balance: ${userCredits} CR.`);
    }

    if (!window.confirm(`Deduct ${cartTotal} Credits to place order?`)) return;

    setLoading(true);
    try {
      for (const item of cart) {
        const formData = new FormData();
        formData.append('patientId', user.id);
        formData.append('medicineId', item.id);
        formData.append('pharmacistId', item.pharmacistId);
        formData.append('quantity', item.quantity);
        formData.append('address', user.address || 'Standard Delivery');
        formData.append('totalPrice', (parseFloat(item.price) * item.quantity).toFixed(2));
        await API.post('/orders/place', formData);
      }

      // NEW: Deduct credits in database
      await API.post('/credits/deduct-checkout', { userId: user.id, amount: cartTotal });

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate('/patient/orders');
      }, 2000);
    } catch (err) {
      alert("Order placement failed. Check credit balance.");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <DashboardLayout role="patient">
      <div className="h-[70vh] flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100"><CheckCircle size={48}/></motion.div>
        <h1 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter">Order Confirmed!</h1>
        <p className="text-slate-500 mt-4 font-bold uppercase text-[10px] tracking-[0.2em]">Credits Deducted. Redirecting...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="patient">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left min-w-0">
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Confirm Basket</h1>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase border border-blue-100">
               <Coins size={14}/> {userCredits} Balance
            </div>
          </div>

          {cart.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col sm:flex-row items-center gap-8 shadow-sm group hover:shadow-md transition-all">
              <div className="w-32 h-32 bg-slate-50 rounded-[2rem] p-4 flex items-center justify-center shrink-0">
                <img src={`http://localhost:5000/${item.medicine_photo?.replace(/\\/g, '/')}`} className="max-h-full object-contain mix-blend-multiply" alt={item.name} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-black text-xl text-slate-800 uppercase leading-tight mb-1">{item.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{item.manufacturer}</p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-6">
                  <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-500"><Minus size={14}/></button>
                    <span className="w-12 text-center font-black text-sm text-slate-800">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-2 hover:bg-white rounded-xl transition-all text-slate-500"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-600 p-2 transition-colors"><Trash2 size={20}/></button>
                </div>
              </div>
              <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8 min-w-[120px]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Line Subtotal</p>
                <h4 className="text-2xl font-black text-blue-600 tracking-tighter flex items-center justify-end gap-1"><Coins size={18}/>{item.price * item.quantity}</h4>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-4 min-w-0">
          <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white sticky top-28 shadow-2xl space-y-8 border-4 border-slate-800">
            <h3 className="text-xl font-black italic uppercase tracking-widest text-blue-400">Bill Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span>Total Credits</span>
                <span className="text-white text-sm">{cartTotal} CR</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-400 tracking-widest">
                <span>Shipping Fee</span>
                <span className="text-sm">FREE</span>
              </div>
              <div className="pt-6 border-t border-white/10 flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase text-blue-400 mb-1 tracking-widest text-left">Final Payable</p>
                <span className="text-4xl font-black text-white tracking-tighter italic text-left">{cartTotal} Credits</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className={`flex items-center justify-center gap-2 text-[9px] font-black uppercase py-3 rounded-xl border ${userCredits < cartTotal ? 'text-rose-400 bg-rose-400/10 border-rose-400/20' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'}`}>
                {userCredits < cartTotal ? <><AlertCircle size={14}/> Funds Insufficient</> : <><ShieldCheck size={14}/> Funds Verified</>}
              </div>
              <button onClick={handlePlaceOrder} disabled={loading || cart.length === 0 || userCredits < cartTotal} className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95 shadow-xl shadow-blue-900/40">
                {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Purchase via Credits</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Checkout;