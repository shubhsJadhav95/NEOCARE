import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Users, ShieldCheck, Activity, DollarSign, CheckCircle, 
  XCircle, ShoppingBag, Settings, Save, TrendingUp, 
  Search, Package, Stethoscope, User, X, ShieldAlert, Trash2, Clock, Eye, RotateCcw, AlertTriangle,
  Mail, Phone, MapPin, Award, UserRound, Store, FileBadge
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../utils/api';

const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('verification');
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ users: 0, doctors: 0, revenue: 0, shops: 0 });
  const [fees, setFees] = useState({ fee_doctor: '15', fee_pharmacist: '10', fee_patient: '5' });
  const [loading, setLoading] = useState(true);

  // Search & Modal States
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [warnModal, setWarnModal] = useState(null);
  const [docModal, setDocModal] = useState(null);
  const [userInfoModal, setUserInfoModal] = useState(null); 
  const [warningMsg, setWarningMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/overview');
      setStats(res.data.stats);
      setPendingVerifications(res.data.pendingUsers || []);
      const settingsRes = await API.get('/admin/settings');
      if (settingsRes.data) setFees(settingsRes.data);

      const userRes = await API.get('/admin/users');
      setAllUsers(userRes.data || []);
      
      if (activeTab === 'orders') {
        const orderRes = await API.get('/admin/orders');
        setOrders(orderRes.data || []);
      }
      if (activeTab === 'demand') {
        const recRes = await API.get('/admin/recommendation-stats');
        setRecommendations(recRes.data || []);
      }
      setLoading(false);
    } catch (err) { 
      console.error("Tower Sync Failed:", err);
      setLoading(false); 
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) setActiveTab(tabParam);
    fetchData();
  }, [location.search, activeTab]);

  const handleUpdateFees = async () => {
    try {
      await API.post('/admin/settings', fees);
      alert("Platform Fee Structure Updated!");
      fetchData();
    } catch (err) { alert("Update Failed"); }
  };

  const handleVerify = async (userId, status) => {
    try {
      await API.post(`/admin/verify-user`, { userId, status });
      fetchData();
    } catch (err) { alert("Action failed"); }
  };

  const handleWarnUser = async () => {
    try {
      await API.post(`/admin/warn-user/${warnModal.id}`, { message: warningMsg });
      alert("Official Warning Issued!");
      setWarnModal(null); setWarningMsg(""); fetchData();
    } catch (err) { alert("Action Failed"); }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await API.post(`/admin/restore-user/${userId}`);
      alert("Account Restored Successfully!");
      fetchData();
    } catch (err) { alert("Restore Failed"); }
  };

  const handleDeleteUser = async (userId) => {
    if(!window.confirm("Confirm permanent deletion?")) return;
    try {
      await API.delete(`/admin/delete-user/${userId}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "Deletion failed"); }
  };

  // --- STRICT FILTER LOGIC FIX ---
  const filteredUsers = allUsers.filter(u => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = (u.name?.toLowerCase() || "").includes(term) || (u.email?.toLowerCase() || "").includes(term);
    
    if (userFilter === 'reported') {
      return (u.status === 'warned' || u.status === 'reported') && matchesSearch;
    }
    
    if (userFilter !== 'all') {
      return u.role === userFilter && matchesSearch;
    }
    
    return matchesSearch;
  });

  if (loading && activeTab !== 'settings') return <div className="min-h-[60vh] flex items-center justify-center animate-pulse font-black text-blue-600 uppercase italic">Syncing Command Tower...</div>;

  return (
    <DashboardLayout role="admin">
      <div className="mb-8 text-left uppercase tracking-tighter italic">
        <h1 className="text-3xl font-black text-slate-800">Admin Command Tower</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-left">
        <StatCard label="Total Users" value={stats.users} icon={<Users />} color="bg-blue-600" />
        <StatCard label="Doctors" value={stats.doctors} icon={<Activity />} color="bg-emerald-600" />
        <StatCard label="Revenue" value={`₹${stats.revenue}`} icon={<DollarSign />} color="bg-amber-500" />
        <StatCard label="Shops" value={stats.shops} icon={<ShieldCheck />} color="bg-indigo-600" />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <TabButton active={activeTab === 'verification'} onClick={() => setActiveTab('verification')} label="Verification" icon={<ShieldCheck size={18}/>} />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="User Control" icon={<Users size={18}/>} />
        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} label="Transactions" icon={<ShoppingBag size={18}/>} />
        <TabButton active={activeTab === 'demand'} onClick={() => setActiveTab('demand')} label="Market Analysis" icon={<TrendingUp size={18}/>} />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Fees" icon={<Settings size={18}/>} />
      </div>

      <div className="bg-white p-8 border border-slate-100 shadow-2xl rounded-[3rem] min-h-[400px] text-left relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            {activeTab === 'verification' && (
              <VerificationTable data={pendingVerifications} onVerify={handleVerify} onViewDocs={setDocModal} />
            )}
            
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
                    {['all', 'patient', 'doctor', 'pharmacist'].map(f => (
                      <button key={f} onClick={() => setUserFilter(f)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${userFilter === f ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>{f}</button>
                    ))}
                    <div className="w-[1px] bg-slate-200 mx-1 self-center h-4"></div>
                    <button 
                      onClick={() => setUserFilter('reported')} 
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${userFilter === 'reported' ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-500'}`}
                    >
                      <ShieldAlert size={12}/> Reported
                    </button>
                  </div>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" placeholder="Search system database..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl font-bold outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <UserManagementTable 
                  data={filteredUsers} 
                  onWarn={setWarnModal} 
                  onRestore={handleRestoreUser}
                  onDelete={handleDeleteUser}
                  onShowInfo={setUserInfoModal}
                  onVerifyGovt={(reg) => window.open(`https://www.nmc.org.in/information-desk/indian-medical-register/?registration_no=${reg}`, '_blank')}
                />
              </div>
            )}

            {activeTab === 'orders' && <OrdersTable data={orders} />}
            
            {activeTab === 'demand' && (
              <MarketDemandPanel data={recommendations} onPush={(name) => API.post('/admin/push-medicine', { medicineName: name }).then(() => fetchData())} />
            )}
            
            {activeTab === 'settings' && (
              <div className="max-w-xl space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <FeeInput label="Doctor Service Fee (%)" value={fees.fee_doctor} onChange={(v) => setFees({...fees, fee_doctor: v})} />
                  <FeeInput label="Pharma Markup (%)" value={fees.fee_pharmacist} onChange={(v) => setFees({...fees, fee_pharmacist: v})} />
                  <FeeInput label="Platform Platform Fee (%)" value={fees.fee_patient} onChange={(v) => setFees({...fees, fee_patient: v})} />
                </div>
                <button onClick={handleUpdateFees} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Save Settings</button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Doc Modal */}
      <AnimatePresence>
        {docModal && (
          <div className="fixed inset-0 z-[2000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50">
                <div><h3 className="text-2xl font-black uppercase italic">{docModal.name} - Verification Docs</h3><p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">REG NO: {docModal.registration_number || 'N/A'}</p></div>
                <button onClick={() => setDocModal(null)} className="p-3 bg-white border shadow-sm rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all"><X/></button>
              </div>
              <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-10 bg-white">
                {docModal.degree_photo && <div className="space-y-4"><p className="font-black text-[10px] uppercase text-slate-400">Degree Photo</p><img src={`https://api.neocare.devcloudzone.store/${docModal.degree_photo}`} className="w-full rounded-3xl border shadow-sm" alt="Degree" /></div>}
                {docModal.license_photo && <div className="space-y-4"><p className="font-black text-[10px] uppercase text-slate-400">License Photo</p><img src={`https://api.neocare.devcloudzone.store/${docModal.license_photo}`} className="w-full rounded-3xl border shadow-sm" alt="License" /></div>}
                {docModal.shop_photo && <div className="space-y-4"><p className="font-black text-[10px] uppercase text-slate-400">Shop Photo</p><img src={`https://api.neocare.devcloudzone.store/${docModal.shop_photo}`} className="w-full rounded-3xl border shadow-sm" alt="Shop" /></div>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Info Card Modal with Reported By identity */}
      <AnimatePresence>
        {userInfoModal && (
          <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden text-left relative">
              <button onClick={() => setUserInfoModal(null)} className="absolute top-8 right-8 p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all z-10"><X size={20}/></button>
              <div className="bg-slate-50 p-10 border-b border-slate-100 flex flex-col items-center">
                <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-xl overflow-hidden mb-4"><img src={`https://api.neocare.devcloudzone.store/${userInfoModal.profile_photo}`} className="w-full h-full object-cover" onError={(e) => e.target.src=`https://ui-avatars.com/api/?name=${userInfoModal.name}`} /></div>
                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">{userInfoModal.name}</h3><span className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{userInfoModal.role} Account</span>
              </div>
              <div className="p-10 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                {/* STRICT IDENTITY LOGGING: Show reporter name for warned users */}
                {(userInfoModal.status === 'warned' || userInfoModal.status === 'reported') && userInfoModal.reportedByName && (
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 mb-2">
                    <div className="p-3 bg-white text-rose-600 rounded-xl shadow-sm"><ShieldAlert size={20}/></div>
                    <div>
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Triggered By Report From</p>
                      <p className="font-bold text-rose-700 text-sm">{userInfoModal.reportedByName}</p>
                    </div>
                  </div>
                )}
                
                <InfoItem icon={<Mail size={18}/>} label="Primary Email" value={userInfoModal.email} />
                <InfoItem icon={<Activity size={18}/>} label="Account Status" value={userInfoModal.status} isStatus={true} />
                {userInfoModal.role === 'doctor' && (<><InfoItem icon={<Award size={18}/>} label="Specialty" value={userInfoModal.specialist || 'N/A'} /><InfoItem icon={<ShieldCheck size={18}/>} label="Reg. Number" value={userInfoModal.registration_number || 'N/A'} /></>)}
                {userInfoModal.role === 'pharmacist' && (<><InfoItem icon={<Store size={18}/>} label="Shop Name" value={userInfoModal.shop_name || 'N/A'} /><InfoItem icon={<FileBadge size={18}/>} label="License" value={userInfoModal.license_number || 'N/A'} /></>)}
                {userInfoModal.role === 'patient' && (<><InfoItem icon={<Phone size={18}/>} label="Contact" value={userInfoModal.contact_number || 'N/A'} /><InfoItem icon={<AlertTriangle size={18}/>} label="Guardian" value={userInfoModal.emergency_contact_name || 'N/A'} /></>)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {warnModal && (
          <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-black mb-4 uppercase italic">Issue Warning</h3>
              <textarea className="w-full p-4 bg-slate-50 border rounded-2xl mb-6 h-32 font-bold outline-none" placeholder="Reason..." value={warningMsg} onChange={(e) => setWarningMsg(e.target.value)} />
              <div className="flex gap-4"><button onClick={() => setWarnModal(null)} className="flex-1 py-4 font-black text-slate-400 text-[10px] uppercase">Cancel</button><button onClick={handleWarnUser} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg">Confirm</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

const UserManagementTable = ({ data, onWarn, onRestore, onDelete, onVerifyGovt, onShowInfo }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead><tr className="text-slate-400 text-[10px] uppercase font-black border-b"><th className="pb-4 pl-2">System User</th><th className="pb-4">Status & Logic</th><th className="pb-4 text-right pr-2">Action Command</th></tr></thead>
      <tbody>
        {data.map((u) => {
          const isWarned = u.status === 'warned';
          const hoursPassed = u.deletionWarnedAt ? (new Date() - new Date(u.deletionWarnedAt)) / (1000 * 60 * 60) : 0;
          const canDelete = hoursPassed >= 24;
          return (
            <tr key={u.id} className={`border-b transition-all ${isWarned ? 'bg-rose-50/50' : 'hover:bg-slate-50'}`}>
              <td className="py-4 font-bold text-sm pl-2">
                <div className="flex items-center gap-3">
                  {isWarned && <div className="animate-pulse text-rose-600"><AlertTriangle size={18}/></div>}
                  <div onClick={() => onShowInfo(u)} className="cursor-pointer group min-w-0">
                    <p className="group-hover:text-blue-600 transition-colors font-black uppercase italic tracking-tighter truncate">{u.name} <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full uppercase ml-1 font-black tracking-normal not-italic">{u.role}</span></p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter truncate">{u.email}</p>
                  </div>
                </div>
              </td>
              <td>{isWarned ? (<span className={`text-[9px] font-black flex items-center gap-1 ${canDelete ? 'text-rose-600' : 'text-amber-500'}`}><Clock size={12}/> {canDelete ? "DELETION UNLOCKED" : `LOCK: ${(24 - hoursPassed).toFixed(1)}h left`}</span>) : (<span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={12}/> {u.status}</span>)}</td>
              <td className="py-4 text-right pr-2 space-x-2 whitespace-nowrap">
                {isWarned && u.role === 'doctor' && (<button onClick={() => onVerifyGovt(u.registration_number)} className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Eye size={18}/></button>)}
                {isWarned ? (<button onClick={() => onRestore(u.id)} className="p-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><RotateCcw size={18}/></button>) : (<button onClick={() => onWarn(u)} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"><ShieldAlert size={18}/></button>)}
                <button onClick={() => onDelete(u.id)} disabled={isWarned && !canDelete} className={`p-2.5 rounded-xl transition-all ${isWarned && !canDelete ? 'bg-slate-100 text-slate-200' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm'}`}><Trash2 size={18}/></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// --- RECHARTS FINAL FIX: INTERSECTION OBSERVER ---
const MarketDemandPanel = ({ data, onPush }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), 200);
      }
    }, { threshold: 0.1 });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-8 min-w-0" ref={containerRef}>
      <div className="h-[400px] w-full bg-slate-50 p-8 rounded-[3rem] border border-slate-100 min-w-0 overflow-hidden relative shadow-inner">
        {isVisible ? (
          <ResponsiveContainer width="99%" height="100%" minWidth={0}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="medicineName" tick={{fontSize: 10, fontWeight: 'bold'}} hide={data.length > 8} />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#2563eb" barSize={45} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-black text-slate-300 uppercase tracking-widest text-[10px]">Loading Analytics Infrastructure...</div>
        )}
      </div>
      <div className="overflow-hidden border border-slate-100 rounded-[2.5rem]">
        <table className="w-full text-left">
          <thead className="bg-slate-50"><tr className="border-b text-slate-400 text-[10px] uppercase font-black"><th className="pb-4 pl-8 uppercase italic">Medicine</th><th className="py-4 text-right pr-8 uppercase italic">Action</th></tr></thead>
          <tbody>{data.map((rec, i) => (<tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition-colors"><td className="py-4 font-black text-sm pl-8 uppercase italic text-slate-700">{rec.medicineName}</td><td className="py-4 text-right pr-8"><button onClick={() => onPush(rec.medicineName)} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all">Push to Shops</button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (<div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"><div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center`}>{icon}</div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p><p className="text-xl font-black text-slate-800">{value}</p></div></div>);
const TabButton = ({ active, onClick, label, icon }) => (<button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border'}`}>{icon} {label}</button>);
const VerificationTable = ({ data, onVerify, onViewDocs }) => (<table className="w-full text-left"><thead><tr className="border-b text-slate-400 text-[10px] font-black uppercase"><th className="pb-4 pl-2">Applicant</th><th className="pb-4 text-right pr-2">Action</th></tr></thead><tbody>{data.map((user) => (<tr key={user.id} className="border-b hover:bg-slate-50 transition-colors"><td className="py-4 font-bold text-sm pl-2">{user.name} <span className="ml-2 text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase font-black">{user.role}</span></td><td className="py-4 flex justify-end gap-2 pr-2"><button onClick={() => onViewDocs(user)} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye size={18}/></button><button onClick={() => onVerify(user.id, 'approved')} className="p-2 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={18}/></button><button onClick={() => onVerify(user.id, 'rejected')} className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle size={18}/></button></td></tr>))}</tbody></table>);
const OrdersTable = ({ data }) => (<table className="w-full text-left"><thead><tr className="border-b text-slate-400 text-[10px] uppercase font-black"><th className="pb-4 pl-2">Patient</th><th className="pb-4 text-right pr-2">Total</th></tr></thead><tbody>{data.map((o) => (<tr key={o.id} className="border-b hover:bg-slate-50 transition-colors"><td className="py-4 font-bold text-sm pl-2 uppercase">{o.patient?.name}</td><td className="py-4 font-black text-blue-600 text-right pr-2">₹{o.totalPrice}</td></tr>))}</tbody></table>);
const InfoItem = ({ icon, label, value, isStatus }) => (<div className="flex items-center gap-4"><div className="w-10 h-10 bg-white border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm">{icon}</div><div className="min-w-0"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p><p className={`font-bold text-sm truncate ${isStatus ? 'text-blue-600 uppercase italic' : 'text-slate-700'}`}>{value}</p></div></div>);
const FeeInput = ({ label, value, onChange }) => (<div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md"><p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{label}</p><div className="flex items-center gap-3"><div className="p-3 bg-white border rounded-xl shadow-sm"><DollarSign size={16} className="text-blue-600"/></div><input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent font-black text-2xl outline-none text-slate-800" /></div></div>);

export default AdminDashboard;