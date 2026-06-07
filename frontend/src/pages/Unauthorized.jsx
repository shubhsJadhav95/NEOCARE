import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Clock, ArrowLeft, LogOut } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-6">
      <div className="max-w-md w-full neo-card bg-white p-10 text-center">
        {user?.status === 'pending' ? (
          <>
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-neo-slate mb-2">Verification Pending</h2>
            <p className="text-slate-500 mb-8">
              Hi {user.name}, our admins are currently reviewing your documents. 
              You'll get full access once your license is verified.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-bold text-neo-slate mb-2">Access Denied</h2>
            <p className="text-slate-500 mb-8">
              You do not have the required permissions to view this page.
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 text-neo-blue font-bold hover:underline"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 p-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            <LogOut size={18} /> Logout & Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;