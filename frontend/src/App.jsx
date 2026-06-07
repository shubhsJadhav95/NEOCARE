import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

// Dashboards & Pages
import Login from './pages/Login';
import RegisterSelect from './pages/RegisterSelect';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';
import RegisterPharmacist from './pages/RegisterPharmacist';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import FindDoctor from './pages/FindDoctor';
import PatientAppointments from './pages/PatientAppointments';
import MedicineShop from './pages/MedicineShop';
import MyPrescriptions from './pages/MyPrescriptions';
import MyOrders from './pages/MyOrders';
import DoctorAppointments from './pages/DoctorAppointments';
import WritePrescription from './pages/WritePrescription';
import MediMart from './pages/MediMart';
import PharmacistOrders from './pages/PharmacistOrders';
import PharmacistRevenue from './pages/PharmacistRevenue';
import MedicineDetail from './pages/MedicineDetail';
import Checkout from './pages/Checkout';
import NeoAI from './pages/NeoAI';
import ChatSystem from './pages/ChatSystem';
import CreditBuy from './pages/CreditBuy'; 
import AdminFinance from './pages/AdminFinance'; 
import Fitness from './pages/Fitness'; 
// --- TELECONSULTING IMPORT ---
import Teleconsulting from './pages/Teleconsulting';
// --- STRICTLY ADDED HEALTHY RECIPES IMPORT ---
import HealthyRecipes from './pages/HealthyRecipes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  if (!token || !user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  if ((user.role === 'doctor' || user.role === 'pharmacist') && user.status !== 'approved') return <Navigate to="/unauthorized" />;
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/register-select" element={<RegisterSelect />} />
            <Route path="/register/patient" element={<RegisterPatient />} />
            <Route path="/register/doctor" element={<RegisterDoctor />} />
            <Route path="/register/pharmacist" element={<RegisterPharmacist />} />
            
            <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/find-doctor" element={<ProtectedRoute allowedRoles={['patient']}><FindDoctor /></ProtectedRoute>} />
            <Route path="/patient/fitness" element={<ProtectedRoute allowedRoles={['patient']}><Fitness /></ProtectedRoute>} />
            <Route path="/patient/ai-diagnostic" element={<ProtectedRoute allowedRoles={['patient']}><NeoAI /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
            <Route path="/patient/shop" element={<ProtectedRoute allowedRoles={['patient']}><MedicineShop /></ProtectedRoute>} />
            <Route path="/patient/checkout" element={<ProtectedRoute allowedRoles={['patient']}><Checkout /></ProtectedRoute>} />
            <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><MyPrescriptions /></ProtectedRoute>} />
            <Route path="/patient/orders" element={<ProtectedRoute allowedRoles={['patient']}><MyOrders /></ProtectedRoute>} />
            <Route path="/patient/chat" element={<ProtectedRoute allowedRoles={['patient']}><ChatSystem /></ProtectedRoute>} />
            <Route path="/patient/credits" element={<ProtectedRoute allowedRoles={['patient']}><CreditBuy /></ProtectedRoute>} />
            {/* PATIENT VIDEO CALL ROUTE */}
            <Route path="/patient/teleconsult" element={<ProtectedRoute allowedRoles={['patient']}><Teleconsulting /></ProtectedRoute>} />
            {/* --- STRICTLY ADDED HEALTHY RECIPES ROUTE --- */}
            <Route path="/patient/recipes" element={<ProtectedRoute allowedRoles={['patient']}><HealthyRecipes /></ProtectedRoute>} />
            
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/prescribe" element={<ProtectedRoute allowedRoles={['doctor']}><WritePrescription /></ProtectedRoute>} />
            <Route path="/doctor/chat" element={<ProtectedRoute allowedRoles={['doctor']}><ChatSystem /></ProtectedRoute>} />
            {/* DOCTOR VIDEO CALL ROUTE */}
            <Route path="/doctor/teleconsult" element={<ProtectedRoute allowedRoles={['doctor']}><Teleconsulting /></ProtectedRoute>} />
            
            <Route path="/pharmacist/dashboard" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />
            <Route path="/pharmacist/inventory" element={<ProtectedRoute allowedRoles={['pharmacist']}><MediMart /></ProtectedRoute>} />
            <Route path="/pharmacist/orders" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistOrders /></ProtectedRoute>} />
            <Route path="/pharmacist/revenue" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistRevenue /></ProtectedRoute>} />
            
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute allowedRoles={['admin']}><AdminFinance /></ProtectedRoute>} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/medicine/:id" element={<ProtectedRoute allowedRoles={['patient']}><MedicineDetail /></ProtectedRoute>} />
          </Routes>
        </Router>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;