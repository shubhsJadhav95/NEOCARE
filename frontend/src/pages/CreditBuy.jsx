import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../utils/api';
import { Upload, CheckCircle, AlertCircle, IndianRupee } from 'lucide-react';

const CreditBuy = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ amount: '', transactionId: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('userId', user.id);
      data.append('amount', formData.amount);
      data.append('transactionId', formData.transactionId);
      data.append('screenshot', file);
      data.append('type', 'buy');

      await API.post('/credits/request', data);
      alert("Purchase Request Submitted! Admin has 24 hours to verify or penalty applies.");
      window.location.reload();
    } catch (err) { alert("Error submitting request"); }
    setLoading(false);
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Buy Credits</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-8 tracking-widest">1 Credit = ₹1.00</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Paid Amount (₹)</label>
              <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-blue-500" placeholder="0.00" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Transaction ID / UTR</label>
              <input required type="text" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold border-2 border-transparent focus:border-blue-500" placeholder="12-digit number" />
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center hover:bg-slate-50 transition-all cursor-pointer relative">
              <input type="file" required onChange={e => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              <Upload className="mx-auto mb-2 text-blue-500" />
              <p className="text-[10px] font-black uppercase text-slate-500">{file ? file.name : "Upload Payment Screenshot"}</p>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : "Submit Proof of Payment"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-black uppercase italic mb-4">Official Payment QR</h3>
               <div className="bg-white p-4 rounded-3xl inline-block mb-4">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=neocare@bank" alt="Admin QR" className="w-40 h-40" />
               </div>
               <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">Scan this QR via any UPI app (GPay/PhonePe) to pay the company directly.</p>
             </div>
             <IndianRupee className="absolute -bottom-10 -right-10 w-40 h-40 opacity-10 rotate-12" />
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-4">
            <AlertCircle className="text-amber-600 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase text-amber-800 mb-1">Protection Policy</p>
              <p className="text-[11px] font-bold text-amber-700 leading-relaxed">If Admin fails to verify your payment within 24 hours, you receive 100 bonus credits every 10 minutes automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreditBuy;