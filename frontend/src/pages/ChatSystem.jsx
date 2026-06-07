import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Send, Languages, CheckCheck, User, MessageSquare, Loader2 } from 'lucide-react';
import API from '../utils/api';
import socket from '../utils/socket'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const ChatSystem = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const { lang } = useLanguage(); 
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [translatingId, setTranslatingId] = useState(null);
  const [unreadContacts, setUnreadContacts] = useState([]); // NEW: Per-contact alerts
  
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user?.id) {
      socket.emit('join', user.id);
      fetchContacts();
    }

    const messageHandler = async (msg) => {
      // Logic: If message is from the open chat
      if (activeChat && (msg.senderId === activeChat.id || msg.receiverId === activeChat.id)) {
        if (lang && lang !== 'en') {
          try {
            const res = await API.post('/ai/translate', { text: msg.message, targetLang: lang });
            setMessages(prev => [...prev, { ...msg, translatedMessage: res.data.translatedText }]);
          } catch (e) { setMessages(prev => [...prev, msg]); }
        } else {
          setMessages(prev => [...prev, msg]);
        }
      } else {
        // RED ALERT LOGIC: If message is from a background contact, mark that contact as unread
        setUnreadContacts(prev => [...new Set([...prev, msg.senderId])]);
        
        // Trigger Notification Bell logic strictly
        try {
            await API.post('/notifications', {
                userId: user.id,
                title: "New Message",
                message: `You have a new message in NeoChat.`,
                type: "chat"
            });
        } catch(e) {}
      }
    };

    socket.on('receive_message', messageHandler);
    return () => { socket.off('receive_message', messageHandler); };
  }, [activeChat, user?.id, lang]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/chat/contacts/${user.id}?role=${user.role}`);
      setContacts(res.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchHistory = async (contactId) => {
    try {
      const res = await API.get(`/chat/history/${user.id}/${contactId}`);
      setMessages(res.data || []);
      // Clear alert for this specific contact once opened
      setUnreadContacts(prev => prev.filter(id => id !== contactId));
    } catch (err) { console.error(err); }
  };

  const selectChat = (contact) => {
    setActiveChat(contact);
    fetchHistory(contact.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const messageData = { senderId: user.id, receiverId: activeChat.id, message: newMessage };
    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, { ...messageData, createdAt: new Date(), id: Date.now() }]);
    setNewMessage("");
  };

  const handleTranslate = async (msgId, text, isTranslated) => {
    if(isTranslated) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, translatedMessage: null } : m));
        return;
    }
    try {
      setTranslatingId(msgId);
      const res = await API.post('/ai/translate', { text: text, targetLang: lang || 'en' });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, translatedMessage: res.data.translatedText } : m));
    } catch (err) { console.error(err); } finally { setTranslatingId(null); }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden min-w-0">
        
        <div className="w-80 border-r border-slate-50 flex flex-col bg-slate-50/30 shrink-0 min-w-0">
          <div className="p-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">NeoChat</h2>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Active Consultations</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar">
            {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div> : 
              contacts.map(contact => (
                <button 
                  key={contact.id} 
                  onClick={() => selectChat(contact)} 
                  className={`w-full p-4 rounded-[2rem] flex items-center gap-4 transition-all relative ${activeChat?.id === contact.id ? 'bg-blue-600 text-white shadow-xl' : 'hover:bg-white bg-transparent text-slate-600'}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/10 flex items-center justify-center font-black uppercase shadow-sm shrink-0">
                    {contact.name[0]}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="font-bold text-sm truncate uppercase">{contact.name}</p>
                    <p className={`text-[9px] font-black uppercase opacity-60`}>{contact.role}</p>
                  </div>
                  
                  {/* INDIVIDUAL CONTACT RED ALERT */}
                  {unreadContacts.includes(contact.id) && (
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
                  )}
                </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white min-w-0">
          {activeChat ? (
            <>
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-black uppercase shrink-0">{activeChat.name[0]}</div>
                  <div><h3 className="font-black text-slate-800 uppercase text-sm leading-none">{activeChat.name}</h3><span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live</span></div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar min-h-0">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.senderId === user.id ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] p-5 rounded-[2.5rem] text-sm font-medium shadow-sm transition-all ${m.senderId === user.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>{m.message}</div>
                    <button onClick={() => handleTranslate(m.id, m.message, !!m.translatedMessage)} className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-tighter hover:text-blue-700 transition-colors ml-2">
                      {translatingId === m.id ? <Loader2 size={10} className="animate-spin"/> : <Languages size={10}/>}
                      {m.translatedMessage ? "Reset Original" : `Translate to ${lang?.toUpperCase()}`}
                    </button>
                    <AnimatePresence>
                      {m.translatedMessage && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl max-w-[70%] italic text-xs text-blue-900 font-medium">
                          <span className="block text-[8px] font-black uppercase text-blue-400 mb-1 tracking-widest">AI Translation:</span>
                          {m.translatedMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-50 flex gap-4 shrink-0">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-50 p-5 rounded-3xl outline-none font-bold text-sm border-2 border-transparent focus:border-blue-600/20" />
                <button type="submit" className="bg-blue-600 text-white p-5 rounded-[2rem] shadow-xl hover:bg-blue-700 active:scale-95 transition-all"><Send size={20} /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-6"><MessageSquare size={40} /></div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Select a consult to chat</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatSystem;