import React, { useState } from 'react';
import API from '../utils/api';
import { X, Send, CreditCard, AlertCircle, Loader2 } from 'lucide-react';

const RedeemModal = ({ isOpen, onClose, currentCredits, onUpdate }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [amount, setAmount] = useState('');
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (parseFloat(amount) > currentCredits) return alert("Insufficient balance");
    
    setLoading(true);
    try {
      await API.post('/credits/request', {
        userId: user.id,
        amount,
        upiId: upi,
        type: 'withdraw'
      });
      alert("Redemption Request Sent! Admin will process within 24 hours.");
      onUpdate();
      onClose();
    } catch (err) { alert("Redemption failed"); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative border border-white">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
          <X size={20} />
        </button>

        <div className="p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1">Redeem Credits</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Convert Credits to Money (UPI)</p>

          <div className="bg-blue-50 p-6 rounded-[2rem] mb-8 border border-blue-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase">Available Balance</p>
              <p className="text-2xl font-black text-blue-600 italic">₹{currentCredits.toLocaleString()}</p>
            </div>
            <CreditCard className="text-blue-200" size={40} />
          </div>

          <form onSubmit={handleRedeem} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Withdraw Amount (₹)</label>
              <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-blue-500" placeholder="Min. ₹100" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">UPI ID (Google Pay / PhonePe)</label>
              <input required type="text" value={upi} onChange={(e) => setUpi(e.target.value)} className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-blue-500" placeholder="username@bank" />
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl flex gap-3 mb-4">
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <p className="text-[9px] font-bold text-rose-600 leading-tight uppercase">Admin verification takes up to 24 hours. Credits are locked during this period.</p>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <>Request Redemption <Send size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RedeemModal;