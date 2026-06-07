import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Store, ArrowLeft } from 'lucide-react';

const RegisterSelect = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'patient',
      title: 'Register as Patient',
      desc: 'Book appointments, buy medicines, and track your health growth.',
      icon: <User size={40} />,
      color: 'bg-neo-blue',
    },
    {
      id: 'doctor',
      title: 'Register as Doctor',
      desc: 'Manage appointments, treat patients online, and issue prescriptions.',
      icon: <Stethoscope size={40} />,
      color: 'bg-emerald-500',
    },
    {
      id: 'pharmacist',
      title: 'Register as Pharmacist',
      desc: 'Manage your MediMart inventory and handle medicine requests.',
      icon: <Store size={40} />,
      color: 'bg-amber-500',
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] px-6 py-12">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/login')}
        className="absolute top-8 left-8 flex items-center gap-2 text-neo-slate font-semibold hover:text-neo-blue transition-colors cursor-pointer"
      >
        <ArrowLeft size={20} /> Back to Login
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-neo-slate mb-3">Join NeoCare</h1>
        <p className="text-slate-500 text-lg">Select your professional role to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {roles.map((role) => (
          <div 
            key={role.id}
            onClick={() => navigate(`/register/${role.id}`)}
            className="neo-card p-8 flex flex-col items-center text-center cursor-pointer group hover:border-neo-blue/50"
          >
            <div className={`neo-icon-container w-20 h-20 ${role.color} text-white mb-6 shadow-lg`}>
              {role.icon}
            </div>
            <h3 className="text-2xl font-bold text-neo-slate mb-4">{role.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              {role.desc}
            </p>
            <div className="mt-auto font-bold text-neo-blue group-hover:underline">
              Get Started &rarr;
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-slate-400 text-sm">
        NeoCare Healthcare Platform &copy; 2025 | India Specific
      </p>
    </div>
  );
};

export default RegisterSelect;