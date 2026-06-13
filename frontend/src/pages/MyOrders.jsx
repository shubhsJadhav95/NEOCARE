import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Package, Truck, CheckCircle, Clock, IndianRupee, Store } from 'lucide-react';
import API from '../utils/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await API.get(`/orders/patient/${user.id}`);
        setOrders(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMyOrders();
  }, [user.id]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'dispatched': return 'text-blue-500 bg-blue-50 border-blue-100';
      default: return 'text-amber-500 bg-amber-50 border-amber-100';
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neo-slate">My Orders</h1>
        <p className="text-slate-500">Track your medicine deliveries and purchase history.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-neo-blue animate-pulse">Tracking orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <Package size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Product Detail */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 p-2">
                    <img 
                      src={`https://api.neocare.devcloudzone.store/${order.medicine?.medicine_photo?.replace(/\\/g, '/')}`} 
                      className="w-full h-full object-contain mix-blend-multiply"
                      alt="medicine"
                      onError={(e) => e.target.src = 'https://placehold.co/100?text=Med'}
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-neo-slate">{order.medicine?.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mt-1">
                      <Store size={14} className="text-neo-blue" /> {order.pharmacist?.shop_name}
                    </div>
                  </div>
                </div>

                {/* Pricing & Status */}
                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                   <p className="text-xl font-black text-neo-slate flex items-center gap-1">
                     <IndianRupee size={18}/> {order.totalPrice}
                   </p>
                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                     {order.status === 'pending' && <Clock size={12}/>}
                     {order.status === 'dispatched' && <Truck size={12}/>}
                     {order.status === 'delivered' && <CheckCircle size={12}/>}
                     {order.status}
                   </div>
                </div>
              </div>

              {/* Delivery Progress Bar */}
              <div className="mt-8 pt-8 border-t border-slate-50">
                <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`absolute top-0 left-0 h-full bg-neo-blue transition-all duration-1000 ${
                    order.status === 'pending' ? 'w-1/3' : order.status === 'dispatched' ? 'w-2/3' : 'w-full'
                  }`}></div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <span className={order.status === 'pending' ? 'text-neo-blue' : ''}>Order Placed</span>
                  <span className={order.status === 'dispatched' ? 'text-neo-blue' : ''}>Dispatched</span>
                  <span className={order.status === 'delivered' ? 'text-neo-blue' : ''}>Delivered</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyOrders;