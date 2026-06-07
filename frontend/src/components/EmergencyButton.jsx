import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Draggable from 'react-draggable';
import { AlertCircle, PhoneCall, X, Navigation, ShieldAlert, Loader2, Map as MapIcon } from 'lucide-react';
import API from '../utils/api';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const RecenterMap = ({ coords, activeHospital }) => {
  const map = useMap();
  useEffect(() => { 
    if (coords) {
      if (activeHospital) {
        map.flyTo([activeHospital.lat, activeHospital.lon], 15);
      } else {
        map.setView(coords, 15);
      }
      setTimeout(() => { map.invalidateSize(); }, 600);
    }
  }, [coords, activeHospital, map]);
  return null;
};

const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [activeHospital, setActiveHospital] = useState(null);
  const [route, setRoute] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const nodeRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
  };

  const fetchRoute = async (h) => {
    if (!userLoc) return;
    setActiveHospital(h);
    setRoute(null); // Clear old route while fetching
    try {
      const uLon = Number(userLoc[1]).toFixed(6);
      const uLat = Number(userLoc[0]).toFixed(6);
      const hLon = Number(h.lon).toFixed(6);
      const hLat = Number(h.lat).toFixed(6);

      const url = `https://router.project-osrm.org/route/v1/driving/${uLon},${uLat};${hLon},${hLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        setRoute(data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]));
      }
    } catch (err) { console.error("OSRM Error", err); }
  };

  const handleEmergency = () => {
    setIsOpen(true);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setUserLoc([latitude, longitude]);
      try {
        await API.post('/notifications/emergency-alert', { 
            userId: user.id, 
            location: `https://www.google.com/maps?q=${latitude},${longitude}` 
        });
        
        // Radius Delta (0.03 is ~3-4km)
        const delta = 0.03; 
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=15&addressdetails=1&bounded=1&viewbox=${longitude-delta},${latitude+delta},${longitude+delta},${latitude-delta}`);
        const data = await res.json();
        
        const processed = data.map(h => ({
            ...h,
            lat: parseFloat(h.lat),
            lon: parseFloat(h.lon),
            dist: parseFloat(calculateDistance(latitude, longitude, parseFloat(h.lat), parseFloat(h.lon)))
        }))
        .filter(h => h.dist >= 1.0 && h.dist <= 3.0) // STRICT 1-3 KM FILTER
        .sort((a, b) => a.dist - b.dist);

        setHospitals(processed);
        if (processed.length > 0) fetchRoute(processed[0]);
      } catch (err) { console.error(err); }
      setLoading(false);
    }, () => { alert("Location access required"); setLoading(false); }, { enableHighAccuracy: true });
  };

  return (
    <>
      <Draggable nodeRef={nodeRef} bounds="body">
        <div ref={nodeRef} className="fixed bottom-10 right-10 z-[1000] cursor-move">
          <button onClick={handleEmergency} className="w-20 h-20 bg-red-600 text-white rounded-full shadow-2xl border-4 border-white animate-pulse active:scale-95 transition-all">
            <AlertCircle size={32} />
            <span className="text-[10px] font-black uppercase">SOS</span>
          </button>
        </div>
      </Draggable>

      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-4 text-left">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]">
            <div className="flex-1 relative bg-slate-100 min-h-[300px]">
              {userLoc ? (
                <MapContainer key={userLoc.join(',')} center={userLoc} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <RecenterMap coords={userLoc} activeHospital={activeHospital} />
                  <Marker position={userLoc} icon={customIcon}><Popup>You are here</Popup></Marker>
                  {hospitals.map((h, i) => (
                    <Marker key={i} position={[h.lat, h.lon]} icon={customIcon} eventHandlers={{ click: () => fetchRoute(h) }}>
                      <Popup>
                        <b className="text-red-600 text-sm">{h.display_name.split(',')[0]}</b><br/>
                        <span className="text-xs font-bold text-slate-600">{h.dist} KM</span>
                      </Popup>
                    </Marker>
                  ))}
                  {route && <Polyline positions={route} color="#ef4444" weight={6} opacity={0.8} />}
                </MapContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <Loader2 className="animate-spin" size={48} />
                  <p className="font-black uppercase tracking-widest text-xs">Pinging GPS...</p>
                </div>
              )}
            </div>
            <div className="w-full md:w-96 bg-slate-900 text-white p-8 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-center mb-6 text-red-500 font-black">
                <ShieldAlert /> SOS HUD <button onClick={() => setIsOpen(false)} className="text-white hover:text-red-500"><X /></button>
              </div>
              <div className="space-y-4 flex-1">
                {hospitals.map((h, i) => (
                  <div key={i} onClick={() => fetchRoute(h)} className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${activeHospital?.place_id === h.place_id ? 'border-red-600 bg-red-600/10' : 'border-slate-800'}`}>
                    <h4 className="font-black text-base uppercase leading-tight text-white mb-2">{h.display_name.split(',')[0]}</h4>
                    {/* ENLARGED ADDRESS DISPLAY */}
                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed mb-3">
                       {h.display_name.split(',').slice(1, 5).join(', ')}
                    </p>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{h.dist} KM</span>
                        <div className="flex gap-2">
                           <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`} target="_blank" rel="noreferrer" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"><MapIcon size={14}/></a>
                           <a href="tel:108" className="bg-white text-slate-900 p-2 rounded-xl hover:bg-red-600 hover:text-white"><PhoneCall size={14}/></a>
                        </div>
                    </div>
                  </div>
                ))}
                {hospitals.length === 0 && !loading && (
                    <div className="text-center py-10 opacity-50 font-bold italic text-sm text-slate-400">No medical facilities found within strict 1-3km range.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;