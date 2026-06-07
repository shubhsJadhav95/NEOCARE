import React, { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Volume2, MessageSquare, X, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

const VoiceNavigator = ({ isGlobal = false }) => {
  const { lang, switchLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // flow: 'idle' | 'choosing_lang' | 'task_selection' | 'doctor_phase'
  const [flow, setFlow] = useState('idle');
  const [voiceToast, setVoiceToast] = useState("");
  const isSpeaking = useRef(false);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const config = {
    languages: {
      mr: ['marathi', 'मराठी'], hi: ['hindi', 'हिंदी'], en: ['english', 'इंग्रजी'],
      bn: ['bengali', 'बंगाली'], te: ['telugu', 'तेलगू'], ta: ['tamil', 'तमिळ'],
      gu: ['gujarati', 'गुजराती'], es: ['spanish', 'स्पॅनिश']
    },
    tasks: {
      appointment: ['book', 'appointment', 'doctor', 'भेट', 'डॉक्टर', 'अपॉइंटमेंट', 'वैद्य'],
      shop: ['shop', 'medicine', 'mart', 'औषध', 'दुकान', 'बाजार'],
      dashboard: ['home', 'dashboard', 'मुख्य', 'डॅशबोर्ड']
    }
  };

  const speak = (text, targetLocale) => {
    window.speechSynthesis.cancel();
    isSpeaking.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLocale || (lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-US');
    utterance.rate = 0.95;
    setVoiceToast(text);
    utterance.onend = () => {
      isSpeaking.current = false;
      if (flow !== 'idle') SpeechRecognition.startListening({ continuous: true, language: utterance.lang });
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!transcript || !listening || isSpeaking.current) return;
    const lowerT = transcript.toLowerCase();

    // PHASE 1: Language
    if (flow === 'choosing_lang') {
      Object.entries(config.languages).forEach(([code, keywords]) => {
        if (keywords.some(k => lowerT.includes(k))) {
          switchLanguage(code);
          setFlow('task_selection');
          resetTranscript();
          const msg = { mr: "मराठी निवडले आहे. मी तुम्हाला कशी मदत करू शकते?", hi: "हिंदी चुनी गई है। मैं आपकी क्या सहायता कर सकती हूँ?", en: "Language set. How can I help you?" }[code];
          setTimeout(() => speak(msg, code === 'mr' ? 'mr-IN' : code === 'hi' ? 'hi-IN' : 'en-US'), 600);
        }
      });
    }

    // PHASE 2: Tasks
    if (flow === 'task_selection') {
      if (config.tasks.appointment.some(k => lowerT.includes(k))) {
        setFlow('doctor_phase');
        handleNavigation('/find-doctor', "Opening Find Doctors. Tell me the name of the doctor or specialist.", "डॉक्टर शोधत आहे. तुम्हाला कोणत्या नावाच्या डॉक्टरला भेटायचे आहे?");
      } else if (config.tasks.shop.some(k => lowerT.includes(k))) {
        handleNavigation('/patient/shop', "Opening Medicine Mart.", "औषध बाजार उघडत आहे.");
      }
    }

    // PHASE 3: Doctor Page interaction
    if (flow === 'doctor_phase' && location.pathname === '/find-doctor' && lowerT.length > 3) {
      speak(lang === 'mr' ? `ठीक आहे, मी ${lowerT} शोधत आहे.` : `Searching for ${lowerT}.`);
      resetTranscript();
    }
  }, [transcript]);

  useEffect(() => {
    if (location.pathname === '/find-doctor' && flow === 'doctor_phase') {
      setTimeout(() => speak(lang === 'mr' ? "तुम्ही आता डॉक्टर शोधू शकता. नाव सांगा." : "You can search for doctors now. State a name."), 2000);
    }
  }, [location.pathname]);

  const handleNavigation = (path, msgEn, msgMr) => {
    speak(lang === 'mr' ? msgMr : msgEn);
    resetTranscript();
    navigate(path);
  };

  const startFlow = () => {
    resetTranscript();
    setFlow('choosing_lang');
    speak("Please select a language: Marathi, Hindi, Bengali, Telugu, Tamil, Gujarati, Spanish, or English.", 'en-US');
  };

  const stopFlow = () => {
    setFlow('idle'); setVoiceToast("");
    SpeechRecognition.stopListening(); window.speechSynthesis.cancel(); resetTranscript();
  };

  if (!browserSupportsSpeechRecognition) return null;

  // If used in Sidebar/DashboardLayout, return only the UI needed
  if (isGlobal) return voiceToast ? (
    <div className="fixed bottom-10 right-10 z-[10000] bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-4 max-w-sm animate-bounce-short border-b-4 border-b-blue-500">
      <div className="w-14 h-14 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white shrink-0 shadow-lg"><MessageSquare size={28} /></div>
      <div className="text-left"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">NeoAI Assistant</p><p className="text-xs font-bold text-slate-700 leading-tight">{voiceToast}</p></div>
      <button onClick={() => setVoiceToast("")} className="absolute top-4 right-4 text-slate-300"><X size={14}/></button>
    </div>
  ) : null;

  return (
    <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl border border-white/5 relative group">
      <div className="relative z-10 flex flex-col gap-6">
        <div className="text-left">
          <h4 className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2"><Volume2 size={14}/> Voice Assistant</h4>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">NeoAI Guide</h2>
        </div>
        <button onClick={flow === 'idle' ? startFlow : stopFlow} className={`w-full p-6 rounded-[2rem] transition-all flex items-center justify-center gap-4 font-black uppercase text-xs ${flow !== 'idle' ? 'bg-rose-500 animate-pulse' : 'bg-blue-600'}`}>
          {flow !== 'idle' ? <><MicOff size={20}/> Stop Assistant</> : <><Mic size={20}/> Start Voice Guide</>}
        </button>
      </div>
    </div>
  );
};

export default VoiceNavigator;