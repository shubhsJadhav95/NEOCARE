import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Search, MapPin, Navigation, DollarSign, ShieldCheck, 
  ShieldAlert, Loader2, CheckCircle, LocateFixed, Filter, 
  AlertCircle, X, GraduationCap, Briefcase, Clock, Building2, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const FindDoctor = () => {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null); // State for the Detail Modal
  
  // Logic: Pre-fill searchTerm if autoFilter exists in route state from AI Checker
  const [searchTerm, setSearchTerm] = useState(routeLocation.state?.autoFilter || '');
  const [userLoc, setUserLoc] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { 
          lat: parseFloat(pos.coords.latitude), 
          lon: parseFloat(pos.coords.longitude) 
        };
        setUserLoc(coords);
        setIsLocating(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getLiveLocation();
    API.get('/auth/doctors').then(({ data }) => setDoctors(data));
  }, []);

  // Update search term if location state changes (AI recommendation triggered)
  useEffect(() => {
    if (routeLocation.state?.autoFilter) {
      setSearchTerm(routeLocation.state.autoFilter);
    }
  }, [routeLocation.state]);

  // --- STRICTLY ADDED: CAPTURE SEARCH INTENT FOR FITNESS HUB ---
  useEffect(() => {
    if (searchTerm.length > 2) {
      localStorage.setItem('lastConditionSearch', searchTerm.toLowerCase());
    }
  }, [searchTerm]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const pLat1 = parseFloat(lat1); const pLon1 = parseFloat(lon1);
    const pLat2 = parseFloat(lat2); const pLon2 = parseFloat(lon2);
    if (isNaN(pLat1) || isNaN(pLat2)) return null;

    const R = 6371; 
    const dLat = (pLat2 - pLat1) * Math.PI / 180;
    const dLon = (pLon2 - pLon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pLat1 * Math.PI / 180) * Math.cos(pLat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const handleBooking = async (doc) => {
    const appointmentData = {
      doctorId: doc.id,
      patientId: user.id,
      date: new Date().toISOString().split('T')[0],
      time: "10:30 AM",
      billingType: doc.billingType || 'per_visit'
    };
    try {
      await API.post('/appointments/book', appointmentData);
      alert(`Booking Request for Dr. ${doc.name} Sent Successfully!`);
      setSelectedDoc(null); 
    } catch (err) { alert("Booking failed. Ensure backend is running."); }
  };

  const handleNavigation = (doc) => {
    if (!userLoc || !doc.lat) return alert("Coordinates missing!");
    const osrmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLoc.lat}%2C${userLoc.lon}%3B${doc.lat}%2C${doc.lon}`;
    window.open(osrmUrl, '_blank');
  };

  const handleVerifyGovt = (regNum) => {
    if(!regNum) return alert("Medical Registration Number not found.");
    const govUrl = `https://www.nmc.org.in/information-desk/indian-medical-register/?registration_no=${regNum}`;
    window.open(govUrl, '_blank');
  };

  const handleReportDoctor = async (doc) => {
    if(!window.confirm(`Report Dr. ${doc.name} for invalid registration?`)) return;
    try {
      await API.post('/admin/report-doctor', { 
        doctorId: doc.id, 
        doctorName: doc.name, 
        regNum: doc.registration_number,
        patientId: user.id, 
        patientName: user.name 
      });
      alert("Report filed. Doctor status updated to warned.");
      API.get('/auth/doctors').then(({ data }) => setDoctors(data));
    } catch (err) { 
      alert(err.response?.data?.message || "Failed to file report."); 
    }
  };

  const filtered = doctors.filter(d => {
    const term = searchTerm.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(term) || (d.specialist && d.specialist.toLowerCase().includes(term));
    const matchFixed = activeFilters.includes('fixed') ? d.billingType === 'fixed' : true;
    return matchSearch && matchFixed;
  }).sort((a, b) => {
    if (activeFilters.includes('nearby') && userLoc) {
      const distA = parseFloat(calculateDistance(userLoc.lat, userLoc.lon, a.lat, a.lon)) || 9999;
      const distB = parseFloat(calculateDistance(userLoc.lat, userLoc.lon, b.lat, b.lon)) || 9999;
      return distA - distB;
    }
    return 0;
  });

  return (
    <DashboardLayout role="patient">
      <div className="mb-10 text-left min-w-0">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter decoration-blue-600 underline underline-offset-8">Find Your Specialist</h1>
          <button 
            onClick={getLiveLocation}
            className={`p-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase shadow-md transition-all ${userLoc ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-600 text-white'}`}
          >
            {isLocating ? <Loader2 className="animate-spin" size={18}/> : <LocateFixed size={18}/>}
            {userLoc ? 'GPS Active' : 'Sync Location'}
          </button>
        </div>
        
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, specialist or condition..." 
              value={searchTerm}
              className="w-full pl-16 pr-6 py-5 rounded-3xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm bg-white" 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            {[{ id: 'nearby', label: 'Nearby', icon: <MapPin size={14}/> }, { id: 'fixed', label: 'Fixed Fee', icon: <DollarSign size={14}/> }].map(f => (
              <button key={f.id} onClick={() => setActiveFilters(prev => prev.includes(f.id) ? prev.filter(i => i !== f.id) : [...prev, f.id])} className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase border transition-all ${activeFilters.includes(f.id) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-100'}`}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(doc => {
          const dist = userLoc ? calculateDistance(userLoc.lat, userLoc.lon, doc.lat, doc.lon) : null;
          return (
            <motion.div layout key={doc.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm text-left group hover:shadow-2xl transition-all relative overflow-hidden">
              <div className="flex items-center gap-5 mb-8 cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                <img 
                    src={`https://api.neocare.devcloudzone.store/${doc.profile_photo}`} 
                    className="w-20 h-20 rounded-3xl object-cover border-4 border-slate-50 group-hover:border-blue-100 transition-all shadow-sm" 
                    onError={(e) => e.target.src='https://ui-avatars.com/api/?name='+doc.name} 
                    alt={doc.name}
                />
                <div>
                  <h3 className="font-black text-xl text-slate-800 uppercase leading-tight italic group-hover:text-blue-600 transition-colors">Dr. {doc.name}</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{doc.specialist || 'General Consultant'}</p>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Reg: {doc.registration_number || 'Pending'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                 <button onClick={() => handleVerifyGovt(doc.registration_number)} className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl font-black text-[9px] uppercase border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle size={14}/> Verify Govt</button>
                 <button onClick={() => handleReportDoctor(doc)} className="bg-rose-50 text-rose-600 p-3 rounded-2xl font-black text-[9px] uppercase border border-rose-100 flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all"><ShieldAlert size={14}/> Report</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Distance</p>
                    <p className="font-black text-xs text-slate-700 italic">{dist ? `${dist} KM` : 'Sync GPS'}</p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Policy</p>
                    <p className="font-black text-blue-600 uppercase text-[9px]">{doc.billingType === 'fixed' ? 'Flat Fee' : 'Per Visit'}</p>
                 </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleBooking(doc)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all active:scale-95 shadow-blue-100">Book Appointment</button>
                <button onClick={() => handleNavigation(doc)} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-800 hover:text-white transition-all"><Navigation size={20}/></button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden relative text-left"
            >
              <button 
                onClick={() => setSelectedDoc(null)}
                className="absolute top-6 right-6 p-3 bg-slate-100 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/5 bg-slate-50 p-10 flex flex-col items-center justify-center border-r border-slate-100">
                  <img 
                    src={`https://api.neocare.devcloudzone.store/${selectedDoc.profile_photo}`} 
                    className="w-40 h-40 rounded-[3rem] object-cover border-8 border-white shadow-xl mb-6"
                    onError={(e) => e.target.src='https://ui-avatars.com/api/?name='+selectedDoc.name}
                    alt="Doctor Profile"
                  />
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-tight">Dr. {selectedDoc.name}</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-2">{selectedDoc.specialist}</p>
                  </div>
                </div>

                <div className="w-full md:w-3/5 p-10">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><GraduationCap size={20}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medical Credentials</p>
                          <p className="font-bold text-slate-700">{selectedDoc.degree || 'MBBS, Specialized'}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Building2 size={20}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">University / College</p>
                          <p className="font-bold text-slate-700">{selectedDoc.college_name || 'Verified Institution'}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Briefcase size={20}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clinical Experience</p>
                          <p className="font-bold text-slate-700">{selectedDoc.years_of_experience || '0'} Years in Practice</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Clock size={20}/></div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OPD Consultation Hours</p>
                          <p className="font-bold text-slate-700">{selectedDoc.working_hours || '09:00 AM - 05:00 PM'}</p>
                       </div>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    <button 
                      onClick={() => handleBooking(selectedDoc)}
                      className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-700 transition-all"
                    >
                      Instant Booking
                    </button>
                    <button 
                      onClick={() => handleVerifyGovt(selectedDoc.registration_number)}
                      className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all"
                      title="Verify Govt ID"
                    >
                      <ShieldCheck size={20}/>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default FindDoctor;