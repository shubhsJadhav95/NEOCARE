import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Pill, Plus, Send, Trash2, RefreshCw, CheckCircle, Search, 
  Apple, ShieldAlert, Heart, Activity 
} from 'lucide-react';
import API from '../utils/api';

const WritePrescription = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [storeMeds, setStoreMeds] = useState([]);
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  
  // STRICTLY ADDED: Diet Tags State
  const [dietTag, setDietTag] = useState('General Wellness');

  const dietOptions = [
    { label: 'General Wellness', icon: <Apple size={14}/>, color: 'bg-blue-50 text-blue-600' },
    { label: 'Low Sodium (Hypertension)', icon: <Heart size={14}/>, color: 'bg-rose-50 text-rose-600' },
    { label: 'Diabetes Friendly', icon: <Activity size={14}/>, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'High Protein (Recovery)', icon: <Plus size={14}/>, color: 'bg-orange-50 text-orange-600' },
    { label: 'Kidney Care (Low K+)', icon: <ShieldAlert size={14}/>, color: 'bg-purple-50 text-purple-600' }
  ];

  useEffect(() => {
    API.get('/medicines/all').then(({data}) => setStoreMeds(data));
  }, []);

  const addMedicineRow = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  const removeRow = (idx) => setMedicines(medicines.filter((_, i) => i !== idx));

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create Prescription Record with dietTag
      await API.post('/prescriptions/create', {
        appointmentId: state.appointmentId,
        doctorId: user.id,
        patientId: state.patientId,
        diagnosis,
        medicines,
        dietTag // Pass the tag to backend for Recipe Engine
      });
      
      // 2. Update Appointment to Completed
      await API.put(`/appointments/update/${state.appointmentId}`, { 
        status: 'completed',
        nextFollowUpDate: followUp ? followUpDate : null,
        isFollowUp: followUp
      });

      alert("Prescription issued. Visit complete & Diet plan updated!");
      navigate('/doctor/appointments');
    } catch (err) { alert("Failed to save data."); }
  };

  return (
    <DashboardLayout role="doctor">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Medical Prescription</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Patient Profile: <span className="text-blue-600">{state?.patientName}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-6 text-left">
        {/* DIAGNOSIS SECTION */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic flex items-center gap-2">
            <Activity size={14}/> Clinical Diagnosis & Observations
          </label>
          <textarea 
            className="w-full bg-slate-50 p-6 rounded-3xl font-bold h-32 outline-none border border-slate-100 focus:border-blue-600 transition-all text-sm" 
            placeholder="Describe clinical findings..." 
            onChange={(e) => setDiagnosis(e.target.value)} required 
          />
        </div>

        {/* --- STRICTLY ADDED: DIET TAG SELECTOR --- */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
              <Apple className="text-emerald-500"/> Nutri-Care Recovery Tag
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">This tag will automatically filter healthy recipes for the patient</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {dietOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setDietTag(opt.label)}
                className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all border-2 ${
                  dietTag === opt.label 
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md' 
                    : 'border-slate-50 bg-slate-50 text-slate-500 opacity-60 grayscale'
                }`}
              >
                {opt.icon}
                <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                {dietTag === opt.label && <CheckCircle size={14} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* MEDICINE LOG */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
              <Pill className="text-blue-600"/> Pharmacotherapy Log
            </h3>
            <button type="button" onClick={addMedicineRow} className="bg-blue-50 text-blue-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 hover:text-white transition-all">+ Add Entry</button>
          </div>

          {medicines.map((med, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-50 items-end">
              <div className="md:col-span-2">
                <input 
                  list="med-list" placeholder="Select Medicine" 
                  className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none border border-slate-100 focus:border-blue-600" 
                  onChange={e => updateMedicine(index, 'name', e.target.value)} required 
                />
                <datalist id="med-list">
                  {storeMeds.map((m, i) => <option key={i} value={m.name} />)}
                </datalist>
              </div>
              <input placeholder="Dosage" className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none border border-slate-100" onChange={e => updateMedicine(index, 'dosage', e.target.value)} required />
              <div className="flex gap-2">
                 <input placeholder="Days" className="flex-1 bg-slate-50 p-4 rounded-2xl font-bold text-xs outline-none border border-slate-100" onChange={e => updateMedicine(index, 'duration', e.target.value)} required />
                 {medicines.length > 1 && <button onClick={() => removeRow(index)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16}/></button>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">Patient Recovery Plan</p>
              <div className="flex gap-4 mb-6">
                 <button type="button" onClick={() => setFollowUp(false)} className={`flex-1 py-5 rounded-3xl font-black text-[10px] uppercase border transition-all ${!followUp ? 'bg-emerald-600 border-emerald-600 shadow-lg' : 'bg-transparent border-white/10 text-slate-500'}`}><CheckCircle size={16} className="inline mr-2"/> Case Closed</button>
                 <button type="button" onClick={() => setFollowUp(true)} className={`flex-1 py-5 rounded-3xl font-black text-[10px] uppercase border transition-all ${followUp ? 'bg-blue-600 border-blue-600 shadow-lg' : 'bg-transparent border-white/10 text-slate-500'}`}><RefreshCw size={16} className="inline mr-2"/> Set Follow-up</button>
              </div>
              {followUp && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Next Clinical Appointment</label>
                  <input type="datetime-local" className="w-full mt-2 bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black" onChange={(e) => setFollowUpDate(e.target.value)} required />
                </div>
              )}
           </div>

           <button type="submit" className="bg-blue-600 text-white p-8 rounded-[3.5rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex flex-col items-center justify-center gap-4 shadow-2xl shadow-blue-100 active:scale-95">
             <Send size={32}/>
             <span className="text-sm">Finalize Care</span>
           </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default WritePrescription;