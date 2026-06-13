import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, User, LogOut, Stethoscope, 
  Calendar, Package, ShoppingCart, FileText, 
  Bell, ClipboardCheck, Globe, Clock, ShoppingBag, 
  ChevronDown, Activity, Video, X, UserRound,
  ShieldCheck, Settings, Users, TrendingUp, CheckCircle, Info,
  ShoppingBasket, Trash2, CreditCard, Sparkles, MessageSquare, Coins,
  Dumbbell, Soup
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import socket from '../utils/socket'; 
import { motion, AnimatePresence } from 'framer-motion';
import VoiceNavigator from './VoiceNavigator';
import RedeemModal from './RedeemModal';

const DashboardLayout = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, switchLanguage, t } = useLanguage();
  const { cart, removeFromCart, cartTotal, cartCount, lastAdded } = useCart();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [pushedCount, setPushedCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [hasNewChat, setHasNewChat] = useState(false); 
  const [credits, setCredits] = useState(user?.credits || 0);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false); 
  
  const notifRef = useRef(null);
  const cartRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' }, { code: 'hi', name: 'हिन्दी' }, 
    { code: 'bn', name: 'বাংলা' }, { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'মরাঠি' }, { code: 'ta', name: 'தமிழ்' },
    { code: 'gu', name: 'ગુજરાતી' }, { code: 'es', name: 'Español' }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (user?.role === 'patient') return '/patient/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    if (user?.role === 'pharmacist') return '/pharmacist/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/login';
  };

  const getCreditColor = () => {
    if (credits < 500) return 'text-rose-500 bg-rose-50 border-rose-100';
    if (credits < 2000) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-emerald-500 bg-emerald-50 border-emerald-100';
  };

  const fetchNotifs = async () => {
    if (!user?.id) return;
    try {
      const res = await API.get(`/notifications/${user.id}`);
      const data = res.data || [];
      
      const userRes = await API.get(`/auth/profile/${user.id}`);
      if (userRes.data) {
        setCredits(userRes.data.credits);
        const updatedUser = { ...user, credits: userRes.data.credits };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      if (user.role === 'patient') {
        const appointmentsRes = await API.get(`/appointments/patient/${user.id}`);
        const apps = appointmentsRes.data || [];
        const now = new Date();

        apps.forEach(app => {
          if (app.status === 'confirmed') {
            const appDate = new Date(`${app.date} ${app.time}`);
            const diffMs = appDate - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours > 23 && diffHours < 24.5) {
              const exists = data.find(n => n.message.includes("24 hours"));
              if (!exists) API.post('/api/notifications', { userId: user.id, title: "Reminder", message: `Your appointment with Dr. ${app.doctor?.name || 'Doctor'} is in 24 hours!`, type: "appointment" });
            }
          }
          
          if (app.followUpExpiry) {
             const expiryDate = new Date(app.followUpExpiry);
             if (now > expiryDate) {
                const exists = data.find(n => n.message.includes("Follow-up period has ended"));
                if (!exists) API.post('/api/notifications', { userId: user.id, title: "Consultation Ended", message: `Follow-up period has ended for your consult with Dr. ${app.doctor?.name}. Chat is now disabled.`, type: "alert" });
             }
          }
        });
      }
      setNotifications(data);
    } catch (err) { console.error("Notif fetch failed", err); }
  };

  useEffect(() => {
    if (user?.role === 'pharmacist') {
      API.get('/admin/pushed-count').then(res => setPushedCount(res.data.count)).catch(e => {});
    }

    if (user?.id) {
        socket.emit('join', user.id);
        socket.on('receive_message', (msg) => {
            if (!window.location.pathname.includes('/chat')) {
                setHasNewChat(true);
            }
        });
    }

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000); 
    return () => {
        clearInterval(interval);
        socket.off('receive_message');
    };
  }, [user?.id]);

  const markAllRead = async () => {
    if (notifications.filter(n => !n.isRead).length === 0) return;
    try {
      await API.put(`/notifications/read-all/${user.id}`);
      setNotifications(notifications.map(n => ({...n, isRead: true})));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (cartRef.current && !cartRef.current.contains(e.target)) setShowCart(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navClass = (path, search = "") => {
    const isActive = location.pathname === path && (search === "" || location.search === search);
    return `w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold transition-all duration-300 group ${
      isActive ? 'text-white bg-blue-600 shadow-lg shadow-blue-200 scale-[1.02]' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
    }`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] w-full overflow-x-hidden text-left font-sans">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-[100] shadow-sm text-left min-w-0">
        <div className="p-8 shrink-0">
          <div className="flex items-center gap-3 mb-2 text-left">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0"><Activity size={24} /></div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic truncate">NeoCare</h2>
          </div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md inline-block whitespace-nowrap">{user?.role} Portal</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar pb-10">
          <button onClick={() => navigate(getDashboardPath())} className={navClass(getDashboardPath())}><LayoutDashboard size={20} /> Overview</button>
          
          {user?.role === 'admin' && (
            <>
              <button onClick={() => navigate('/admin/dashboard?tab=users')} className={navClass('/admin/dashboard', '?tab=users')}><Users size={20} /> Management</button>
              <button onClick={() => navigate('/admin/finance')} className={navClass('/admin/finance')}><TrendingUp size={20} /> Finance</button>
            </>
          )}
          
          {user?.role === 'patient' && (
            <>
              <button onClick={() => navigate('/find-doctor')} className={navClass('/find-doctor')}><Stethoscope size={20} /> Doctors</button>
              <button onClick={() => navigate('/patient/fitness')} className={navClass('/patient/fitness')}><Dumbbell size={20} /> Fitness Hub</button>
              
              {/* STRICTLY ADDED: Nutri-Care Recipe Finder Tab */}
              <button onClick={() => navigate('/patient/recipes')} className={navClass('/patient/recipes')}>
                <Soup size={20} /> 
                <div className="flex items-center gap-2">
                  Diet & Recipes 
                  <span className="bg-emerald-100 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded-md animate-pulse">AI</span>
                </div>
              </button>

              <button onClick={() => navigate('/patient/appointments')} className={navClass('/patient/appointments')}><Calendar size={20} /> Bookings</button>
              <button onClick={() => { setHasNewChat(false); navigate('/patient/chat'); }} className={navClass('/patient/chat')}>
                <div className="relative">
                  <MessageSquare size={20} />
                  {hasNewChat && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-bounce shadow-sm"></span>}
                </div> 
                NeoChat
              </button>
              <button onClick={() => navigate('/patient/prescriptions')} className={navClass('/patient/prescriptions')}><FileText size={20} /> Records</button>
              <button onClick={() => navigate('/patient/shop')} className={navClass('/patient/shop')}><ShoppingCart size={20} /> Med Mart</button>
              <button onClick={() => navigate('/patient/orders')} className={navClass('/patient/orders')}><Package size={20} /> My Orders</button>
            </>
          )}

          {user?.role === 'doctor' && (
            <>
              <button onClick={() => navigate('/doctor/appointments')} className={navClass('/doctor/appointments')}><Calendar size={20} /> Appointments</button>
              <button onClick={() => { setHasNewChat(false); navigate('/doctor/chat'); }} className={navClass('/doctor/chat')}>
                 <div className="relative">
                  <MessageSquare size={20} />
                  {hasNewChat && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-bounce shadow-sm"></span>}
                </div> 
                Patient Chat
              </button>
            </>
          )}

          {user?.role === 'pharmacist' && (
            <>
              <button onClick={() => navigate('/pharmacist/inventory')} className={navClass('/pharmacist/inventory')}>
                <div className="relative"><Package size={20} />{pushedCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce border-2 border-white shadow-sm">{pushedCount}</span>}</div> Inventory
              </button>
              <button onClick={() => navigate('/pharmacist/orders')} className={navClass('/pharmacist/orders')}><ClipboardCheck size={20} /> Orders</button>
              <button onClick={() => navigate('/pharmacist/revenue')} className={navClass('/pharmacist/revenue')}><TrendingUp size={20} /> Revenue</button>
            </>
          )}
          
          <button onClick={() => navigate('/profile')} className={navClass('/profile')}><UserRound size={20} /> Profile</button>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"><LogOut size={20} /> {t('logout')}</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col ml-64 min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40 min-w-0">
          <h1 className="text-slate-800 font-black text-sm uppercase tracking-widest truncate">{location.pathname.split('/').pop()?.replace(/-/g, ' ')}</h1>

          <div className="flex items-center gap-4 shrink-0 ml-4">
            <button 
                onClick={() => {
                  if (user.role === 'patient') navigate('/patient/credits');
                  else setIsRedeemOpen(true);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-black text-[10px] uppercase transition-all hover:scale-105 shadow-sm whitespace-nowrap ${getCreditColor()}`}
            >
                <Coins size={16} className="animate-spin-slow" />
                ₹{credits.toLocaleString()} Credits
            </button>

            {user?.role === 'patient' && (
              <button onClick={() => navigate('/patient/ai-diagnostic')} className="p-3 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg flex items-center gap-2 group shrink-0">
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">NeoAI Assist</span>
              </button>
            )}

            <select value={lang} onChange={(e) => switchLanguage(e.target.value)} className="bg-slate-100 px-3 py-2 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer hover:bg-slate-200 transition-colors shrink-0">
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>

            <div className="relative shrink-0" ref={cartRef}>
              <motion.button animate={lastAdded ? { scale: [1, 1.2, 1] } : {}} onClick={() => setShowCart(!showCart)} className={`p-3 rounded-2xl transition-all relative ${showCart ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <ShoppingBasket size={20} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] font-black border-2 border-white flex items-center justify-center">{cartCount}</span>}
              </motion.button>
              <AnimatePresence>
                {showCart && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-80 bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] overflow-hidden z-[1000]">
                    <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center text-left">
                      <h4 className="font-black text-emerald-800 text-sm uppercase tracking-tighter">My Basket</h4>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">{cartCount} Items</span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto p-4 space-y-3">
                      {cart.length > 0 ? cart.map((item, i) => (
                        <div key={i} className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <img src={`https://api.neocare.devcloudzone.store/${item.medicine_photo}`} className="w-10 h-10 rounded-lg object-cover bg-white" alt="" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-[11px] font-black text-slate-800 truncate uppercase">{item.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{item.quantity} x {item.price} CR</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-all shrink-0"><Trash2 size={14}/></button>
                        </div>
                      )) : <div className="p-10 text-center text-slate-400 italic text-xs font-bold uppercase">Basket is empty</div>}
                    </div>
                    {cart.length > 0 && (
                      <div className="p-4 bg-white border-t border-slate-50">
                        <button onClick={() => { setShowCart(false); navigate('/patient/checkout'); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">
                          <CreditCard size={16}/> Checkout Now
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative shrink-0" ref={notifRef}>
              <button onClick={() => { if (!showNotifs) markAllRead(); setShowNotifs(!showNotifs); }} className={`p-3 rounded-2xl transition-all relative ${showNotifs ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse"></span>}
              </button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-80 bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] overflow-hidden z-[1000] text-left">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 font-black text-xs uppercase tracking-tighter text-slate-800">Notifications</div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      {notifications.length > 0 ? notifications.map((n, i) => (
                        <div key={i} className={`p-5 border-b border-slate-50 ${n.isRead ? 'opacity-50' : 'bg-blue-50/20'}`}>
                          <p className="text-[11px] font-black text-slate-800">{n.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{n.message}</p>
                        </div>
                      )) : <div className="p-10 text-center text-slate-300 uppercase font-black text-[10px]">No Updates</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 shrink-0">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-black text-slate-800 uppercase truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tighter">Verified User</p>
              </div>
              <img src={`https://api.neocare.devcloudzone.store/${user?.profile_photo}`} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm" onError={(e) => e.target.src='https://ui-avatars.com/api/?name='+user?.name} />
            </div>
          </div>
        </header>

        {/* STRICTLY CORRECTED: min-w-0 and overflow-hidden here acts as the final anchor for Recharts */}
        <div className="p-10 w-full flex-1 overflow-y-auto min-h-0 min-w-0 overflow-x-hidden">
          {children}
        </div>

        <AnimatePresence>
          {lastAdded && (
            <motion.div initial={{ opacity: 0, x: 100, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.8 }} className="fixed bottom-10 right-10 z-[3000] bg-emerald-600 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 border-white">
              <div className="bg-white text-emerald-600 p-2 rounded-xl shadow-inner shrink-0"><CheckCircle size={20} /></div>
              <div className="text-left"><p className="text-[10px] font-black uppercase tracking-widest opacity-80">Added to Basket</p><p className="text-sm font-black uppercase italic leading-tight">{lastAdded.name}</p></div>
              <button onClick={() => setShowCart(true)} className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap">View</button>
            </motion.div>
          )}
        </AnimatePresence>

        <VoiceNavigator isGlobal={true} />
        <RedeemModal isOpen={isRedeemOpen} onClose={() => setIsRedeemOpen(false)} currentCredits={credits} onUpdate={fetchNotifs} />
      </main>
    </div>
  );
};

export default DashboardLayout;