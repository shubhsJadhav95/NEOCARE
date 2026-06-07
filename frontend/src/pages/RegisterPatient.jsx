import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, Droplets, Activity, Phone, MapPin } from 'lucide-react';
import API from '../utils/api';

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient',
    age: '', contact_number: '', address: '',
    blood_group: '', allergies: '', past_diseases: '', emergency_number: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (profilePhoto) data.append('profile_photo', profilePhoto);

    try {
      await API.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Patient Registered Successfully!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/register-select')} className="flex items-center gap-2 text-neo-slate mb-8 hover:text-neo-blue transition-colors cursor-pointer font-bold">
          <ArrowLeft size={20} /> Back to Selection
        </button>

        <div className="neo-card p-10 bg-white/90">
          <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
            <div className="neo-icon-container w-16 h-16 bg-neo-blue text-white shadow-lg shadow-neo-blue/20">
              <User size={30} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-neo-slate">Patient Registration</h2>
              <p className="text-slate-500 font-medium">Complete your digital medical identity</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PROFILE PHOTO SECTION */}
            <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center">
              <label className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                <Camera size={18} className="text-neo-blue" /> Upload Profile Photo
              </label>
              <input type="file" required onChange={(e) => setProfilePhoto(e.target.files[0])} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-neo-blue file:text-white hover:file:bg-blue-600 cursor-pointer" />
            </div>

            {/* BASIC INFO */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
              <input name="name" placeholder="John Doe" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
              <input name="email" type="email" placeholder="john@example.com" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>

            {/* HEALTH DATA */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Age</label>
              <input name="age" type="number" placeholder="25" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Blood Group</label>
              <select name="blood_group" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white">
                <option value="">Select Group</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            {/* CONTACT INFO */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contact Number</label>
              <input name="contact_number" placeholder="+91 00000 00000" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Emergency Contact</label>
              <input name="emergency_number" placeholder="Relative's Number" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>

            {/* ADDRESS */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Residential Address</label>
              <textarea name="address" rows="2" placeholder="Full Address" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>

            {/* MEDICAL HISTORY */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Known Allergies</label>
              <input name="allergies" placeholder="Peanuts, Penicillin, etc." onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Past Diseases</label>
              <input name="past_diseases" placeholder="Diabetes, Hypertension, etc." onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Create Password</label>
              <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none bg-white" />
            </div>

            <button type="submit" className="neo-btn-primary md:col-span-2 mt-4 text-lg">
              Finish Patient Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPatient;