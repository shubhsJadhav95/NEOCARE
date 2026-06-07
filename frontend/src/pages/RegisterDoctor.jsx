import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Camera, Award, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import API from '../utils/api';

const RegisterDoctor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: 'doctor',
    age: '', 
    contact_number: '', 
    degree: '', 
    specialist: '', 
    college_name: '', 
    years_of_experience: '',
    registration_number: '' // STRICTLY ADDED FOR GOVT VERIFICATION
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [degreePhoto, setDegreePhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append all text fields
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Append files strictly
    if (profilePhoto) data.append('profile_photo', profilePhoto);
    if (degreePhoto) data.append('degree_photo', degreePhoto);

    try {
      await API.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Registration Successful! Our team will verify your degree and registration shortly.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/register-select')} className="flex items-center gap-2 text-neo-slate mb-8 hover:text-neo-blue transition-colors cursor-pointer font-bold uppercase text-xs tracking-widest">
          <ArrowLeft size={20} /> Back to Selection
        </button>

        <div className="neo-card p-10 bg-white shadow-2xl rounded-[3rem] border border-slate-100">
          <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6 text-left">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Stethoscope size={30} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Professional Registration</h2>
              <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Medical Practitioner Verification Gate</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* FILE UPLOADS */}
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center group transition-all hover:bg-emerald-100/50">
              <label className="text-[10px] font-black text-emerald-700 mb-2 flex items-center gap-2 uppercase tracking-widest"><Camera size={16} /> Profile Photo</label>
              <input type="file" required onChange={(e) => setProfilePhoto(e.target.files[0])} className="text-[10px] text-emerald-600 file:bg-emerald-500 file:text-white file:border-0 file:rounded-full file:px-4 file:py-1 cursor-pointer font-bold" />
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex flex-col items-center group transition-all hover:bg-emerald-100/50">
              <label className="text-[10px] font-black text-emerald-700 mb-2 flex items-center gap-2 uppercase tracking-widest"><Award size={16} /> Degree Certificate</label>
              <input type="file" required onChange={(e) => setDegreePhoto(e.target.files[0])} className="text-[10px] text-emerald-600 file:bg-emerald-500 file:text-white file:border-0 file:rounded-full file:px-4 file:py-1 cursor-pointer font-bold" />
            </div>

            {/* PROFESSIONAL INFO */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Medical Registration No.</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                <input name="registration_number" placeholder="e.g. MCI-12345" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Full Name (With Dr.)</label>
              <input name="name" placeholder="Dr. Jane Smith" onChange={handleChange} required className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Specialization</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input name="specialist" placeholder="e.g. Cardiologist" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Degrees (MD, MBBS, etc)</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input name="degree" placeholder="MBBS, MD, FRCS" onChange={handleChange} required className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Years of Practice</label>
              <input name="years_of_experience" type="number" placeholder="10" onChange={handleChange} required className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Age</label>
              <input name="age" type="number" placeholder="45" onChange={handleChange} required className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Medical University Name</label>
              <input name="college_name" placeholder="AIIMS, New Delhi" onChange={handleChange} required className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Contact Number</label>
              <input name="contact_number" placeholder="+91 00000 00000" onChange={handleChange} required className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Professional Email</label>
              <input name="email" type="email" placeholder="dr.smith@neocare.com" onChange={handleChange} required className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Login Password</label>
              <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>

            <button type="submit" className="md:col-span-2 bg-emerald-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 mt-4 hover:bg-emerald-700 transition-all active:scale-95">
              Register as Medical Professional
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterDoctor;