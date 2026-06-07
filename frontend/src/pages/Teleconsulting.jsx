import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom'; // Strictly added for auto-fill logic
import DashboardLayout from '../components/DashboardLayout';
import { 
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff, 
  User, Shield, MessageSquare, Clipboard, Activity 
} from 'lucide-react';

const socket = io('http://localhost:5000');

const Teleconsulting = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation(); // Hook to access state passed from Appointments
  
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  // Logic: Automatically set the target ID if passed from Appointment page state
  const [idToCall, setIdToCall] = useState(location.state?.doctorId || "");
  const [name, setName] = useState("");
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // 1. Get User Media Permissions
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;
    });

    // 2. Identify Socket to Server
    socket.emit('join', user.id);

    // 3. Listen for Incoming Calls
    socket.on('incomingCall', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on('callEnded', () => {
      setCallEnded(true);
      window.location.reload(); 
    });

    return () => {
      socket.off('incomingCall');
      socket.off('callAccepted');
    };
  }, [user.id]);

  // DOCTOR LOGIC: Initiate Call
  const callUser = (id) => {
    if (!id) return alert("No peer ID found to connect.");
    
    const peer = new Peer({ initiator: true, trickle: false, stream: stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: user.id,
        name: user.name,
      });
    });

    peer.on('stream', (userStream) => {
      if (userVideo.current) userVideo.current.srcObject = userStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // PATIENT LOGIC: Answer Call
  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (userStream) => {
      if (userVideo.current) userVideo.current.srcObject = userStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    socket.emit('endCall', { to: caller || idToCall });
    if (connectionRef.current) connectionRef.current.destroy();
    window.location.reload();
  };

  return (
    <DashboardLayout role={user.role}>
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-180px)] min-w-0">
        
        {/* Main Video Arena */}
        <div className="flex-1 bg-slate-900 rounded-[3rem] relative overflow-hidden shadow-2xl border-4 border-white">
          
          {/* Remote Video (Full Screen) */}
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            {callAccepted && !callEnded ? (
              <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <User size={48} className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">
                  {receivingCall ? "Incoming Patient Connection..." : "Waiting for peer connection..."}
                </p>
              </div>
            )}
          </div>

          {/* Local Video (Floating) */}
          <div className="absolute bottom-8 right-8 w-48 h-64 bg-black rounded-3xl overflow-hidden border-4 border-slate-900/50 shadow-2xl z-20">
            {stream && <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />}
          </div>

          {/* Call Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/40 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 z-30">
            <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"><Mic size={20}/></button>
            <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"><Video size={20}/></button>
            {callAccepted && !callEnded ? (
              <button onClick={leaveCall} className="p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl transition-all shadow-lg shadow-rose-500/40"><PhoneOff size={24}/></button>
            ) : null}
          </div>

          {/* Status Badge */}
          <div className="absolute top-8 left-8">
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              {callAccepted ? "Live Session" : "Secured Link"}
            </div>
          </div>
        </div>

        {/* Interaction Sidebar */}
        <div className="w-full lg:w-96 space-y-6 flex flex-col">
          
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex-1">
            <h3 className="text-xl font-black text-slate-800 uppercase italic mb-6 flex items-center gap-2">
              <Activity className="text-blue-600" size={20}/> Session Panel
            </h3>

            {!callAccepted && (
              <div className="space-y-4">
                {user.role === 'doctor' ? (
                  <>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-wider italic">
                      {idToCall ? `Ready to connect with Patient ID: ${idToCall}` : "Enter Patient ID to initiate secure consultation"}
                    </p>
                    <input 
                      type="text" 
                      placeholder="Patient User ID" 
                      className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none font-bold"
                      value={idToCall}
                      onChange={(e) => setIdToCall(e.target.value)}
                    />
                    <button onClick={() => callUser(idToCall)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      <Phone size={18}/> Start Consultation
                    </button>
                  </>
                ) : receivingCall && !callAccepted ? (
                  <div className="text-center py-6">
                     <h2 className="text-slate-800 font-black uppercase italic mb-4">Dr. {name} is calling...</h2>
                     <button onClick={answerCall} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all animate-bounce">
                        <Phone size={18}/> Answer Call
                     </button>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-widest leading-relaxed">
                      {idToCall ? `Doctor (ID: ${idToCall}) will call you shortly.` : "Please wait for the Doctor to start the session"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {callAccepted && (
              <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Link</p>
                  <p className="font-black text-emerald-600 uppercase text-xs">Active Encrypted Channel</p>
                </div>
                {user.role === 'doctor' && (
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clipboard size={14}/> Live Prescription</h4>
                     <textarea className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none h-40 text-xs font-bold" placeholder="Type clinical notes and medicines here..."></textarea>
                     <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">Finalize & Send</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
            <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Security Protocol</h4>
            <p className="text-sm font-black italic uppercase">P2P End-to-End Encryption</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Teleconsulting;