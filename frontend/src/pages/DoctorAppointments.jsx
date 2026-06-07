import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, Clock, CheckCircle, XCircle, RefreshCw, FileText, Video } from 'lucide-react';
import API from '../utils/api';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/appointments/doctor/${user.id}`);
      setAppointments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, [user.id]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      await API.put(`/appointments/update/${id}`, { status: newStatus });
    } catch (err) {
      alert("Error updating status");
      fetchAppointments();
    }
  };

  return (
    <DashboardLayout role="doctor">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-neo-slate">Appointments</h1>
        <button onClick={fetchAppointments} className="p-2 text-neo-blue"><RefreshCw size={20}/></button>
      </div>

      <div className="neo-card bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 font-bold text-slate-600">Patient</th>
              <th className="p-5 font-bold text-slate-600">Schedule</th>
              <th className="p-5 font-bold text-slate-600">Status</th>
              <th className="p-5 font-bold text-slate-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((app) => (
              <tr key={app.id} className="border-b border-slate-50">
                <td className="p-5 font-bold">{app.patient?.name}</td>
                <td className="p-5 text-sm">{app.appointmentDate} <br/> {app.appointmentTime}</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    app.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex justify-center gap-2">
                    {app.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(app.id, 'accepted')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle size={20}/></button>
                        <button onClick={() => handleStatusUpdate(app.id, 'rejected')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><XCircle size={20}/></button>
                      </>
                    )}
                    
                    {/* ACTION SECTION: Added Video Call & Prescribe buttons */}
                    {app.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate('/doctor/teleconsult', { state: { doctorId: app.patientId } })}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg"
                        >
                          <Video size={16}/> Enter Call
                        </button>

                        <button 
                          onClick={() => navigate('/doctor/prescribe', { state: { patientId: app.patientId, patientName: app.patient?.name, appointmentId: app.id }})}
                          className="flex items-center gap-2 px-4 py-2 bg-neo-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                        >
                          <FileText size={16}/> Write Prescription
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;