import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Camera, Save, User, ShieldCheck, Mail, Phone, MapPin, ShieldAlert, Navigation, DollarSign, RefreshCw } from 'lucide-react';
import API from '../utils/api';
import VoiceNavigator from '../components/VoiceNavigator';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/auth/me`);
        setProfileData(res.data);
      } catch (err) { console.error("Could not refresh profile", err); }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const payload = {
        ...profileData,
        lat: profileData.lat ? Number(profileData.lat) : null,
        lon: profileData.lon ? Number(profileData.lon) : null
      };
      
      const res = await API.put('/auth/update-profile', payload);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setProfileData(res.data.user);
      
      alert("Profile and Clinic Settings Updated! Coordinates are now live.");
      window.location.reload();
    } catch (err) {
      alert("Update Failed: " + (err.response?.data?.message || "Error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      setProfileData({ 
        ...profileData, 
        lat: Number(pos.coords.latitude), 
        lon: Number(pos.coords.longitude) 
      });
      setLoading(false);
      alert("Live GPS Coordinates Captured locally! Click 'Sync Changes' above to save to the database.");
    }, () => {
      setLoading(false);
      alert("Please allow location access");
    });
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="max-w-4xl mx-auto text-left">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-slate-800 uppercase italic">Profile Management</h1>
          <button onClick={handleUpdate} disabled={loading} className="bg-blue-600 text-white flex items-center gap-2 px-8 py-4 rounded-[2rem] font-black uppercase text-xs shadow-xl hover:bg-blue-700 transition-all active:scale-95">
            <Save size={18} /> {loading ? 'Processing...' : 'Sync Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col items-center text-center shadow-sm">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-xl">
                  <img src={`http://localhost:5000/${profileData?.profile_photo?.replace('\\', '/')}`} onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + profileData?.name} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Camera size={16} /></button>
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-800 uppercase italic tracking-tighter">{profileData?.name}</h3>
              <span className="px-4 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest mt-2">{profileData?.role}</span>
            </div>

            {/* VOICE NAVIGATION PANEL (ONLY FOR PATIENTS) */}
            {profileData.role === 'patient' && (
              <VoiceNavigator />
            )}

            {profileData.role === 'doctor' && (
              <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-4 flex items-center gap-2"><MapPin size={14}/> Clinic GPS</h4>
                    <p className="text-[11px] font-bold text-slate-400 mb-4">
                      {profileData.lat && profileData.lon ? `${Number(profileData.lat).toFixed(4)}, ${Number(profileData.lon).toFixed(4)}` : 'Location Not Set'}
                    </p>
                    <button onClick={fetchLiveGPS} className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-black text-[9px] uppercase transition-all flex items-center justify-center gap-2"><Navigation size={14}/> Capture Current GPS</button>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-4 flex items-center gap-2"><DollarSign size={14}/> Billing Model</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setProfileData({...profileData, billingType: 'fixed'})} className={`py-3 rounded-xl font-black text-[9px] uppercase transition-all border ${profileData.billingType === 'fixed' ? 'bg-emerald-600 border-emerald-600' : 'bg-transparent border-white/10 text-slate-500'}`}>Fixed</button>
                        <button onClick={() => setProfileData({...profileData, billingType: 'per_visit'})} className={`py-3 rounded-xl font-black text-[9px] uppercase transition-all border ${profileData.billingType === 'per_visit' ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-white/10 text-slate-500'}`}>Per Visit</button>
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h4 className="text-sm font-black text-slate-400 uppercase mb-6 tracking-widest border-b pb-4">Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Contact Number</label>
                  <input className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-blue-600 transition-all" value={profileData.contact_number || ''} onChange={e => setProfileData({...profileData, contact_number: e.target.value})} />
                </div>
                {profileData.role === 'patient' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Blood Group</label>
                    <input className="w-full p-4 bg-white border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-blue-600" value={profileData.blood_group || ''} onChange={e => setProfileData({...profileData, blood_group: e.target.value})} />
                  </div>
                )}
              </div>
            </div>

            {profileData.role === 'patient' && (
              <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 shadow-sm">
                <h4 className="text-sm font-black text-rose-600 uppercase mb-2 tracking-widest flex items-center gap-2"><ShieldAlert size={18} /> Emergency SOS Contacts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <input className="w-full p-4 bg-white border border-rose-100 rounded-2xl font-bold outline-none text-rose-600" placeholder="Contact Name" value={profileData.emergency_contact_name || ''} onChange={e => setProfileData({...profileData, emergency_contact_name: e.target.value})} />
                  <input className="w-full p-4 bg-white border border-rose-100 rounded-2xl font-bold outline-none text-rose-600" placeholder="Alert Email" value={profileData.emergency_contact_email || ''} onChange={e => setProfileData({...profileData, emergency_contact_email: e.target.value})} />
                </div>
              </div>
            )}

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <h4 className="text-sm font-black text-slate-400 uppercase mb-6 border-b pb-4 flex items-center gap-2 tracking-widest"><MapPin size={18} className="text-red-400" /> Location Details</h4>
              <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold min-h-[100px]" value={profileData.address || profileData.shop_address || ''} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="Full address..." />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;