import React, { useEffect, useRef } from 'react';

export default function RealRiskMap({ clusters = [], selectedCluster, onSelectCluster }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const L = window.L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      // Ethiopia Center Coordinates
      const map = L.map(mapContainerRef.current, {
        center: [9.0000, 38.7500],
        zoom: 6.4,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // High-quality OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Ethiopia AgriLend Telemetry',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Render cluster markers on the real map
    clusters.forEach((cluster) => {
      if (cluster.lat == null || cluster.lng == null) return;

      const exposure = (cluster.exposure || '').toLowerCase();
      let color = '#059669'; // Emerald Low
      let radius = 10;
      let pulseColor = 'rgba(5, 150, 105, 0.4)';

      if (exposure === 'critical') {
        color = '#DC2626'; // Red
        radius = 18;
        pulseColor = 'rgba(220, 38, 38, 0.4)';
      } else if (exposure === 'high') {
        color = '#EA580C'; // Orange
        radius = 14;
        pulseColor = 'rgba(234, 88, 12, 0.4)';
      } else if (exposure === 'moderate') {
        color = '#D97706'; // Amber
        radius = 11;
        pulseColor = 'rgba(217, 119, 6, 0.4)';
      }

      const isSelected = selectedCluster && selectedCluster.name === cluster.name;

      // Outer ripple aura circle
      const aura = L.circleMarker([cluster.lat, cluster.lng], {
        radius: isSelected ? radius + 10 : radius + 5,
        fillColor: pulseColor,
        color: 'transparent',
        fillOpacity: isSelected ? 0.6 : 0.3,
      }).addTo(map);

      // Core Marker
      const marker = L.circleMarker([cluster.lat, cluster.lng], {
        radius: isSelected ? radius + 4 : radius,
        fillColor: color,
        color: isSelected ? '#FFFFFF' : color,
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      // Interactive popup
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 160px; padding: 2px;">
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 2px;">${cluster.name}</div>
          <div style="font-size: 11px; color: #64748B; font-weight: 500;">Crop Sector: <b style="color: #1E293B;">${cluster.crop}</b></div>
          <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="background: ${color}; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
              ${cluster.exposure}
            </span>
            <span style="font-size: 12px; font-weight: 800; color: #0F172A;">
              Score: ${cluster.score}
            </span>
          </div>
          ${cluster.trend ? `<div style="font-size: 10px; color: #475569; margin-top: 4px; font-weight: 600;">Trend: ${cluster.trend}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (typeof onSelectCluster === 'function') {
          onSelectCluster(cluster);
        }
      });

      markersRef.current.push(aura, marker);
    });

    // Invalidate map size to ensure full rendering if container size changes
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  }, [clusters, selectedCluster, onSelectCluster]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-gray-200 shadow-xs group">
      {/* Real Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Control Overlay */}
      <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-xl px-3 py-2 shadow-md flex items-center gap-3 text-[11px] font-bold text-gray-700">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span> Critical</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Low</span>
      </div>

      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/85 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg font-medium flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Ethiopia Agro-Ecological Satellite Telemetry Layer</span>
      </div>
    </div>
  );
}
