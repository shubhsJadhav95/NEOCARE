import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Activity } from 'lucide-react';
import API from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else if (data.user.role === 'patient') navigate('/patient/dashboard');
      else if (data.user.role === 'doctor') navigate('/doctor/dashboard');
      else if (data.user.role === 'pharmacist') navigate('/pharmacist/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] px-4">
      <div className="neo-card w-full max-w-md p-8 bg-white/80">
        <div className="flex flex-col items-center mb-8">
          <div className="neo-icon-container w-16 h-16 bg-neo-blue text-white mb-4 shadow-lg shadow-neo-blue/30">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-bold text-neo-slate">NeoCare</h1>
          <p className="text-slate-500 font-medium">Healthcare Excellence in India</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-neo-blue focus:ring-2 focus:ring-neo-blue/20 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-neo-blue focus:ring-2 focus:ring-neo-blue/20 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="neo-btn-primary w-full font-bold text-lg">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-600">New to NeoCare?</p>
          <Link to="/register-select" className="text-neo-blue font-bold hover:underline mt-2 inline-block">
            Create a Professional Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;