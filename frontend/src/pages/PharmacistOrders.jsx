import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Package, Truck, MapPin, Phone, Loader2, ClipboardList, CheckCircle } from 'lucide-react';
import API from '../utils/api';

const PharmacistOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/pharmacist/${user.id}`);
      setOrders(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchOrders();
  }, [user.id]);

  const updateStatus = async (id, status) => {
    try {
      // Changed to 'update-status' to align with the primary route
      await API.put(`/orders/update-status/${id}`, { status });
      alert(`Order marked as ${status}`);
      fetchOrders(); // Refresh list after update
    } catch (err) {
      console.error("Update Status Error:", err);
      alert("Failed to update status");
    }
  };

  return (
    <DashboardLayout role="pharmacist">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Customer Orders</h1>
        <p className="text-slate-500 font-medium">Manage medicine purchases and fulfillment pipeline.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No orders to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-6 hover:shadow-lg transition-all text-left">
              {/* Medicine Info */}
              <div className="flex gap-4 items-center w-full lg:w-1/3">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 border border-blue-100">
                  <Package size={24}/>
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800">{order.medicine?.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Qty: {order.quantity} | <span className="text-blue-600">Total: ₹{order.totalPrice}</span>
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="w-full lg:w-1/3 px-6 lg:border-x border-slate-100 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-2">
                  <MapPin size={14} className="text-blue-600"/> {order.patient?.name}
                </p>
                <p className="text-slate-400 text-xs truncate">{order.patient?.address || 'Address not provided'}</p>
                <p className="text-blue-600 text-xs font-bold flex items-center gap-2">
                  <Phone size={12}/> {order.patient?.contact_number || 'No contact number'}
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                  order.status === 'pending' 
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : order.status === 'dispatched'
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {order.status}
                </span>
                
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'dispatched')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                  >
                    <Truck size={16}/> Dispatch Order
                  </button>
                )}
                
                {order.status === 'dispatched' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'delivered')}
                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                  >
                    <CheckCircle size={16}/> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PharmacistOrders;