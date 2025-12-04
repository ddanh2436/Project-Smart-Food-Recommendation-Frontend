"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import L from "leaflet";

// --- Custom Icons ---
const userIcon = L.divIcon({
  className: 'custom-icon-user',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e88e5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.4)); width: 36px; height: 36px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
});

const restaurantIcon = L.divIcon({
  className: 'custom-icon-res',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e53935" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.4)); width: 40px; height: 40px;"><path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"></path><path d="M12 3L2 11h20L12 3z"></path><rect x="9" y="14" width="6" height="7"></rect></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
  popupAnchor: [0, -34],
});

interface RoutingMapProps {
  userLocation: { lat: number; lon: number } | null;
  restaurantLocation: { lat: number; lon: number };
}

const RoutingControl = ({ userLocation, restaurantLocation }: RoutingMapProps) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !userLocation) return;
    const L_Any = L as any;

    // 1. Tạo control
    const routingControl = L_Any.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lon),
        L.latLng(restaurantLocation.lat, restaurantLocation.lon),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      show: false, 
      collapsible: true,
      router: L_Any.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
        requestParameters: {
            overview: "simplified",
            steps: false,
            geometries: "polyline",
        }
      }),
      lineOptions: {
        styles: [{ color: '#2979FF', opacity: 0.8, weight: 6 }], 
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      createMarker: function() { return null; } 
    });

    // --- FIX QUAN TRỌNG NHẤT: MONKEY PATCH ---
    // Ghi đè hàm _clearLines của instance này.
    // Nguyên nhân lỗi: Hàm này cố gọi this._map.removeLayer khi map đã null.
    const originalClearLines = routingControl._clearLines;
    routingControl._clearLines = function() {
        // Kiểm tra an toàn: Nếu không có map, hoặc map đã bị hủy -> Dừng ngay.
        if (!this._map || (this._map as any)._leaflet_id === null) {
            return;
        }
        // Nếu map an toàn, gọi hàm gốc của thư viện
        return originalClearLines.apply(this, arguments);
    };
    // -----------------------------------------

    // Xử lý lỗi từ server OSRM để không crash UI
    routingControl.on('routingerror', function(e: any) {
      console.warn("Routing OSRM Error (Ignored):", e);
    });

    try {
        routingControl.addTo(map);
        routingControlRef.current = routingControl;
        
        // Ẩn bảng chỉ dẫn
        const container = routingControl.getContainer();
        if(container) container.style.display = 'none';
    } catch (e) {
        console.error("Error adding control:", e);
    }

    // CLEANUP
    return () => {
      // Khi component unmount, ta set một cờ để hàm _clearLines biết mà dừng lại
      if (routingControlRef.current) {
        try {
          // Xóa các event listener trước
          routingControlRef.current.getPlan().setWaypoints([]); 
          
          if(map) {
             map.removeControl(routingControlRef.current);
          }
        } catch (error) {
           // Bắt lỗi phút chót nếu có
        }
        routingControlRef.current = null;
      }
    };
  }, [map, userLocation, restaurantLocation]);

  return null;
};

export default function RoutingMap({ userLocation, restaurantLocation }: RoutingMapProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Delay render lâu hơn một chút (500ms) để đảm bảo Modal ổn định hẳn
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const centerLat = userLocation 
    ? (userLocation.lat + restaurantLocation.lat) / 2 
    : restaurantLocation.lat;
  const centerLon = userLocation 
    ? (userLocation.lon + restaurantLocation.lon) / 2 
    : restaurantLocation.lon;

  if(!restaurantLocation.lat || !restaurantLocation.lon) return null;

  if (!isReady) {
      return (
          <div style={{ 
              height: "400px", width: "100%", borderRadius: "16px", 
              background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#999", flexDirection: "column", gap: "10px"
          }}>
              <div className="spinner" style={{ border: "3px solid #ddd", borderTop: "3px solid #333", borderRadius: "50%", width: "24px", height: "24px", animation: "spin 0.8s linear infinite" }}></div>
              <span style={{fontSize: '14px'}}>Đang tải bản đồ...</span>
              <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
          </div>
      );
  }

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "16px", overflow: "hidden", zIndex: 1, position: 'relative' }}>
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
                <Popup>Bạn</Popup>
            </Marker>
        )}

        <Marker position={[restaurantLocation.lat, restaurantLocation.lon]} icon={restaurantIcon}>
             <Popup>Nhà hàng</Popup>
        </Marker>

        {userLocation && (
            <RoutingControl userLocation={userLocation} restaurantLocation={restaurantLocation} />
        )}
      </MapContainer>
    </div>
  );
}