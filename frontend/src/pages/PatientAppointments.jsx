import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, Clock, Stethoscope, CheckCircle2, Timer, XCircle, Loader2, Coins, Video } from 'lucide-react';
import API from '../utils/api';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // This matches the backend route: router.get('/patient/:patientId', ...)
      const { data } = await API.get(`/appointments/patient/${user.id}`);
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching patient appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  // Payment Logic strictly integrated
  const handlePayment = async (app) => {
    const doctorFee = 500; // Fixed platform fee as per logic
    if (window.confirm(`Pay ₹${doctorFee} to Dr. ${app.doctor.name} using credits?`)) {
      try {
        await API.post('/credits/pay-doctor', {
          patientId: user.id,
          doctorId: app.doctorId,
          appointmentId: app.id,
          amount: doctorFee
        });
        alert("Payment Success! Credits transferred to Doctor.");
        fetchAppointments(); // Refresh to update UI state
      } catch (err) {
        alert(err.response?.data?.message || "Payment failed");
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neo-slate">My Bookings</h1>
          <p className="text-slate-500">Track your consultation requests and scheduled visits.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neo-blue">
          <Loader2 className="animate-spin mb-2" size={40} />
          <p className="font-medium">Loading your schedule...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="neo-card p-20 text-center bg-white border-2 border-dashed border-slate-100">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-neo-slate">No Appointments Found</h3>
          <p className="text-slate-400">You haven't booked any consultations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((app) => (
            <div key={app.id} className="neo-card bg-white p-6 border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                    <img 
                      src={`https://api.neocare.devcloudzone.store/${app.doctor?.profile_photo?.replace(/\\/g, '/')}`} 
                      alt="Doctor" 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + app.doctor?.name}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-neo-slate text-lg">Dr. {app.doctor?.name}</h3>
                    <p className="text-xs text-neo-blue font-bold flex items-center gap-1 uppercase tracking-wider">
                      <Stethoscope size={12} /> {app.doctor?.specialist}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusStyle(app.status)}`}>
                    {app.status}
                  </span>
                  
                  {/* Payment Button strictly showing for 'confirmed' status */}
                  {app.status === 'confirmed' && app.billingType !== 'paid_via_credits' && (
                    <button 
                      onClick={() => handlePayment(app)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase shadow-lg shadow-emerald-100 transition-all active:scale-95"
                    >
                      <Coins size={12} /> Pay ₹500
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 my-4 bg-slate-50/50 rounded-xl px-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Calendar size={16} className="text-neo-blue" /> {app.appointmentDate}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Clock size={16} className="text-neo-blue" /> {app.appointmentTime}
                </div>
              </div>

              {/* ACTION SECTION: Corrected logic for 'confirmed' status */}
              <div className="flex flex-col gap-3 mt-4">
                {app.status === 'confirmed' && (
                  <button 
                    onClick={() => navigate('/patient/teleconsult', { state: { doctorId: app.doctorId } })}
                    className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    <Video size={16}/> Join Live Session
                  </button>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold italic">
                    {app.status === 'confirmed' ? (
                      <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Confirmed</span>
                    ) : app.status === 'pending' ? (
                      <span className="text-amber-500 flex items-center gap-1"><Timer size={14} /> Awaiting Response</span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1"><XCircle size={14} /> Declined</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Ref: #APT-{app.id}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientAppointments;