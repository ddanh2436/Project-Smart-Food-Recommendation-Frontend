"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import L from "leaflet";

// --- 1. CONFIG ICONS ---
const userIcon = L.divIcon({
  className: 'custom-icon-user',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2979FF" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); width: 32px; height: 32px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

const restaurantIcon = L.divIcon({
  className: 'custom-icon-res',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107" stroke="#3E2723" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); width: 40px; height: 40px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
  popupAnchor: [0, -34],
});

interface RoutingMapProps {
  userLocation: { lat: number; lon: number } | null;
  restaurantLocation: { lat: number; lon: number };
}

interface RouteInfo {
    totalDistance: number;
    totalTime: number;
    steps: any[];
}

// --- 2. CONTROL COMPONENT ---
const RoutingControl = ({ userLocation, restaurantLocation, onRouteFound }: any) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !userLocation) return;
    const L_Any = L as any;

    const routingControl = L_Any.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lon),
        L.latLng(restaurantLocation.lat, restaurantLocation.lon),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false, // Ẩn UI mặc định xấu xí
      collapsible: true,
      router: L_Any.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
        language: 'vi',
        requestParameters: {
            overview: "simplified",
            steps: true,
            geometries: "polyline",
        }
      }),
      lineOptions: {
        styles: [{ color: '#FFC107', opacity: 1, weight: 6 }] // Line màu vàng rực
      },
      createMarker: () => null 
    });

    // Bắt sự kiện tìm thấy đường
    routingControl.on('routesfound', function(e: any) {
        const r = e.routes[0];
        if (r) {
            console.log("Route found:", r); // Debug log
            onRouteFound({
                totalDistance: r.summary.totalDistance,
                totalTime: r.summary.totalTime,
                steps: r.instructions
            });
        }
    });

    // Fix lỗi crash
    const originalClearLines = routingControl._clearLines;
    routingControl._clearLines = function() {
        if (!this._map) return;
        return originalClearLines.apply(this, arguments);
    };

    try {
        routingControl.addTo(map);
        routingControlRef.current = routingControl;
        const container = routingControl.getContainer();
        if(container) container.style.display = 'none';
    } catch(e) {}

    return () => {
      if (routingControlRef.current && map) {
        try { map.removeControl(routingControlRef.current); } catch (e) {}
      }
    };
  }, [map, userLocation, restaurantLocation]);

  return null;
};

// --- 3. MAIN COMPONENT ---
export default function RoutingMap({ userLocation, restaurantLocation }: RoutingMapProps) {
  const [isReady, setIsReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [showSteps, setShowSteps] = useState(false); // State để bật tắt list chỉ dẫn

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const centerLat = userLocation ? (userLocation.lat + restaurantLocation.lat) / 2 : restaurantLocation.lat;
  const centerLon = userLocation ? (userLocation.lon + restaurantLocation.lon) / 2 : restaurantLocation.lon;

  const formatDist = (m: number) => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  const formatTime = (s: number) => `${Math.round(s / 60)} phút`;

  // Helper dịch tiếng Việt
  const translateInstruction = (text: string) => {
    let t = text;
    t = t.replace(/Head/g, "Đi về hướng");
    t = t.replace(/Turn left/g, "Rẽ trái");
    t = t.replace(/Turn right/g, "Rẽ phải");
    t = t.replace(/Make a U-turn/g, "Quay đầu");
    t = t.replace(/Continue/g, "Tiếp tục");
    t = t.replace(/onto/g, "vào");
    t = t.replace(/Destination/g, "Điểm đến");
    return t;
  };

  if (!isReady || !restaurantLocation.lat) return <div style={{height: 350, background: '#111', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Đang tải bản đồ...</div>;

  return (
    <div style={{ position: 'relative', width: "100%", height: "450px", borderRadius: "12px", overflow: "hidden", border: "1px solid #333" }}>
        
        {/* MAP */}
        <MapContainer
            center={[centerLat, centerLon]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
        >
            <TileLayer attribution='&copy; CartoDB' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"/>
            
            {userLocation && <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon} />}
            <Marker position={[restaurantLocation.lat, restaurantLocation.lon]} icon={restaurantIcon} />
            
            {userLocation && (
                <RoutingControl 
                    userLocation={userLocation} 
                    restaurantLocation={restaurantLocation} 
                    onRouteFound={setRouteInfo} 
                />
            )}
        </MapContainer>

        {/* --- 4. FLOATING INFO CARD (Thẻ thông tin nổi - Đảm bảo luôn hiện) --- */}
        {routeInfo ? (
            <div style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                backgroundColor: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid #FFC107',
                zIndex: 1000, // Đè lên map
                color: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {/* Dòng 1: Khoảng cách & Thời gian */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontSize: '11px', color: '#aaa', textTransform: 'uppercase'}}>Khoảng cách</div>
                            <div style={{fontSize: '20px', fontWeight: 'bold', color: '#FFC107'}}>{formatDist(routeInfo.totalDistance)}</div>
                        </div>
                        <div style={{width: 1, height: 30, background: '#444'}}></div>
                        <div style={{textAlign: 'center'}}>
                            <div style={{fontSize: '11px', color: '#aaa', textTransform: 'uppercase'}}>Thời gian</div>
                            <div style={{fontSize: '20px', fontWeight: 'bold', color: 'white'}}>{formatTime(routeInfo.totalTime)}</div>
                        </div>
                    </div>
                    
                    {/* Nút xem chi tiết */}
                    <button 
                        onClick={() => setShowSteps(!showSteps)}
                        style={{
                            background: '#333', border: '1px solid #555', color: 'white', 
                            padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px'
                        }}
                    >
                        {showSteps ? "Ẩn chỉ dẫn ▲" : "Xem đường đi ▼"}
                    </button>
                </div>

                {/* Dòng 2: List chỉ dẫn (Hiện khi bấm nút) */}
                {showSteps && (
                    <div style={{
                        marginTop: '10px', maxHeight: '150px', overflowY: 'auto', 
                        borderTop: '1px solid #333', paddingTop: '10px'
                    }}>
                        {routeInfo.steps.map((step: any, i: number) => (
                            <div key={i} style={{display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '13px', color: '#ddd'}}>
                                <span style={{color: '#FFC107', fontWeight: 'bold'}}>{i+1}.</span>
                                <div>
                                    {translateInstruction(step.text)} 
                                    <span style={{color: '#888', marginLeft: '5px'}}>({formatDist(step.distance)})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            // Loading State (Khi đang tính toán)
            <div style={{
                position: 'absolute', bottom: 20, left: 20, zIndex: 1000,
                background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 20px', borderRadius: '20px',
                display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #444'
            }}>
                <div className="spinner" style={{width: 15, height: 15, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                <span style={{fontSize: '13px'}}>Đang tìm đường...</span>
                <style>{`@keyframes spin {to{transform: rotate(360deg)}}`}</style>
            </div>
        )}
    </div>
  );
}