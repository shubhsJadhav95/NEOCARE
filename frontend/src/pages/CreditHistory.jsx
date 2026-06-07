import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../utils/api';
import { ArrowUpRight, ArrowDownLeft, Clock, Search, History } from 'lucide-react';

const CreditHistory = () => {
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await API.get(`/credits/history/${user.id}`);
      setHistory(res.data);
    };
    fetchHistory();
  }, [user.id]);

  return (
    <DashboardLayout role={user.role}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Transaction Ledger</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Wallet Statement</p>
          </div>
          <History className="text-slate-200" size={40} />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden min-w-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="p-6">Transaction Type</th>
                <th className="p-6">Reference</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Date & Time</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-600">
              {history.length > 0 ? history.map((tx) => (
                <tr key={tx.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'buy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {tx.type === 'buy' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                      </div>
                      <span className="uppercase">{tx.type === 'buy' ? 'Credit Purchase' : 'Withdrawal'}</span>
                    </div>
                  </td>
                  <td className="p-6 font-mono text-xs text-slate-400">{tx.transactionId || tx.upiId || 'N/A'}</td>
                  <td className={`p-6 font-black ${tx.type === 'buy' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'buy' ? '+' : '-'} ₹{tx.amount}
                  </td>
                  <td className="p-6 text-slate-400 font-medium">
                    {new Date(tx.updatedAt).toLocaleDateString()} <span className="text-[10px] opacity-50 ml-2">{new Date(tx.updatedAt).toLocaleTimeString()}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-20 text-center text-slate-300 italic uppercase tracking-widest font-black">No Transaction History Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreditHistory;