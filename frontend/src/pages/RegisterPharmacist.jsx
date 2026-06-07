import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, FileText, Camera, MapPin, Phone, Mail, Lock } from 'lucide-react';
import API from '../utils/api';

const RegisterPharmacist = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'pharmacist',
    contact_number: '', shop_name: '', shop_address: '', license_number: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Append text data
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Append files
    if (profilePhoto) data.append('profile_photo', profilePhoto);
    if (licensePhoto) data.append('license_photo', licensePhoto);

    try {
      await API.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Pharmacist Registration Successful!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/register-select')} className="flex items-center gap-2 text-neo-slate mb-8 hover:text-neo-blue transition-colors cursor-pointer">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="neo-card p-10 bg-white/90">
          <div className="flex items-center gap-4 mb-10">
            <div className="neo-icon-container w-16 h-16 bg-amber-500 text-white shadow-lg">
              <Store size={30} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-neo-slate">Pharmacist Registration</h2>
              <p className="text-slate-500">Register your Pharmacy with NeoCare MediMart</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Full Name</label>
              <input name="name" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Email</label>
              <input name="email" type="email" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none" />
            </div>

            {/* Shop Details */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Pharmacy/Shop Name</label>
              <input name="shop_name" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">License Number</label>
              <input name="license_number" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none" />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Shop Address</label>
              <textarea name="shop_address" rows="2" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none" />
            </div>

            {/* File Uploads */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1 flex items-center gap-2">
                <Camera size={16} /> Profile Photo
              </label>
              <input type="file" onChange={(e) => setProfilePhoto(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1 flex items-center gap-2">
                <FileText size={16} /> License Copy (PDF/JPG)
              </label>
              <input type="file" onChange={(e) => setLicensePhoto(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Password</label>
              <input name="password" type="password" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">Contact Number</label>
              <input name="contact_number" onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 focus:border-neo-blue outline-none" />
            </div>

            <button type="submit" className="neo-btn-primary md:col-span-2 mt-4 text-lg !from-amber-500 !to-amber-700 !shadow-amber-900/40">
              Register Pharmacy
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPharmacist;