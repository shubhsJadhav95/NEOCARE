import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Pill, Calendar, Download, ShoppingBasket, Loader2, ClipboardList, CheckCircle } from 'lucide-react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [allStoreMeds, setAllStoreMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // FIX: Removed extra /api/ prefix. Assuming API utility already has /api in its baseURL
        const [presRes, storeRes] = await Promise.all([
          API.get(`/prescriptions/patient/${user.id}`),
          API.get('/medicines/all')
        ]);
        setPrescriptions(presRes.data);
        setAllStoreMeds(storeRes.data);
      } catch (err) { 
        console.error("Fetch Data Error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [user.id]);

  // Individual Prescription PDF Download Logic
  const downloadPrescriptionPDF = (pres) => {
    try {
      const doc = new jsPDF();
      
      // Header Section
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("NeoCare E-Prescription", 14, 25);
      
      // Details Section
      doc.setTextColor(40);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Dr. ${pres.doctor?.name}`, 14, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${pres.doctor?.specialist || 'Consultant Specialist'}`, 14, 55);
      
      doc.text(`Patient: ${user.name}`, 140, 50);
      doc.text(`Date: ${new Date(pres.createdAt).toLocaleDateString()}`, 140, 55);
      
      // Diagnosis Section
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 65, 182, 20, 3, 3, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("DIAGNOSIS:", 20, 75);
      doc.setFont("helvetica", "italic");
      doc.text(`"${pres.diagnosis}"`, 50, 75);
      
      // Medicines Table
      const tableRows = pres.medicines.map(m => [
        m.name,
        m.dosage,
        m.duration
      ]);

      autoTable(doc, {
        startY: 95,
        head: [['Medicine Name', 'Dosage Instruction', 'Duration']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 10, cellPadding: 5 }
      });

      // Footer
      const finalY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("This document is a digitally verified medical record from NeoCare Healthcare Platform.", 105, finalY, { align: 'center' });

      doc.save(`Prescription_${pres.id}.pdf`);
    } catch (error) {
      console.error("PDF Export Error", error);
      alert("Could not generate PDF. Check console for details.");
    }
  };

  const handleBulkAdd = (medList) => {
    let matchCount = 0;
    medList.forEach(presMed => {
      const match = allStoreMeds.find(sm => sm.name.toLowerCase() === presMed.name.toLowerCase());
      if (match) {
        addToCart({ ...match, quantity: 1 });
        matchCount++;
      }
    });

    if (matchCount > 0) {
      alert(`Success: ${matchCount} items added to your basket!`);
    } else {
      alert("Note: These specific medicines are not currently available in the MediMart store.");
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Digital Records</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Verified Medical Prescriptions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40}/>
        </div>
      ) : (
        <div className="space-y-8 text-left">
          {prescriptions.length > 0 ? prescriptions.map((pres) => (
            <div key={pres.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                <div className="flex gap-4">
                   <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 uppercase border border-blue-100 shadow-inner text-xl tracking-tighter">RX</div>
                   <div>
                      <h3 className="font-black text-xl text-slate-800 uppercase leading-tight">Dr. {pres.doctor?.name}</h3>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{pres.doctor?.specialist}</p>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-2"><Calendar size={12}/> {new Date(pres.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => downloadPrescriptionPDF(pres)}
                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                    title="Download Prescription as PDF"
                  >
                    <Download size={20}/>
                  </button>

                  <button 
                    onClick={() => handleBulkAdd(pres.medicines)}
                    className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-3 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95"
                  >
                    <ShoppingBasket size={18}/> Get All in MediMart
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Diagnosis</p>
                <p className="font-bold text-slate-700 leading-relaxed italic">"{pres.diagnosis}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pres.medicines.map((med, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] hover:border-blue-600 transition-all group/item flex flex-col justify-between">
                     <div>
                        <p className="font-black text-slate-800 uppercase text-sm mb-2">{med.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-2"><CheckCircle size={12} className="text-emerald-500"/> {med.dosage}</p>
                     </div>
                     <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{med.duration}</span>
                        <button 
                          onClick={() => navigate('/patient/shop', { state: { search: med.name } })}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
                        >
                          <ShoppingBasket size={14}/>
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <ClipboardList size={48} className="mx-auto text-slate-200 mb-4"/>
              <p className="font-black text-slate-400 uppercase text-xs tracking-widest">No Medical Records Found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyPrescriptions;