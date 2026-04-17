'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

type SpotPin = {
  slug: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  type: 'surf' | 'ski';
  label: string;
  bg: string;
  waveHeight?: string;
  totalSnowIn?: string;
  period?: string;
};

function clusterSpots(spots: SpotPin[], zoom: number) {
  const radius = zoom <= 2 ? 15 : zoom <= 4 ? 8 : zoom <= 6 ? 4 : 0;
  if (radius === 0) return spots.map(s => ({ spots: [s], lat: s.lat, lon: s.lon }));

  const clusters: { spots: SpotPin[]; lat: number; lon: number }[] = [];
  const used = new Set<number>();

  spots.forEach((spot, i) => {
    if (used.has(i)) return;
    const cluster = { spots: [spot], lat: spot.lat, lon: spot.lon };
    spots.forEach((other, j) => {
      if (i === j || used.has(j)) return;
      if (Math.abs(spot.lat - other.lat) < radius && Math.abs(spot.lon - other.lon) < radius) {
        cluster.spots.push(other);
        used.add(j);
      }
    });
    used.add(i);
    clusters.push(cluster);
  });

  return clusters;
}

export default function SpotMap({ spots }: { spots: SpotPin[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    import('leaflet').then((mod) => {
      const L = mod.default ?? mod;
      if (!mapRef.current) return;
      if ((mapRef.current as any)._leaflet_id) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(mapRef.current!, {
        center: [20, 10],
        zoom: 2,
        minZoom: 2,
        maxZoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      let markerLayer = L.layerGroup().addTo(map);

      function getBestColor(clusterSpots: SpotPin[]) {
        const colors = clusterSpots.map(s => s.bg);
        if (colors.includes('#4ade80')) return '#4ade80';
        if (colors.includes('#86efac')) return '#86efac';
        if (colors.includes('#fbbf24')) return '#fbbf24';
        return '#4a4540';
      }

      function renderMarkers() {
        markerLayer.clearLayers();
        const zoom = map.getZoom();
        const clusters = clusterSpots(spots, zoom);

        clusters.forEach(cluster => {
          const color = getBestColor(cluster.spots);
          const textColor = color === '#4a4540' ? '#f0ebe0' : '#0a0808';
          const isCluster = cluster.spots.length > 1;
          const size = isCluster ? 36 : 14;

          const icon = L.divIcon({
            className: '',
            html: isCluster ? `
              <div style="
                width: ${size}px; height: ${size}px; border-radius: 50%;
                background: ${color}; border: 2px solid #0a0808;
                box-shadow: 0 0 10px ${color}66;
                display: flex; align-items: center; justify-content: center;
                font-family: Georgia, serif; font-size: 13px; font-weight: bold;
                color: ${textColor}; cursor: pointer;
              ">${cluster.spots.length}</div>
            ` : `
              <div style="
                width: ${size}px; height: ${size}px; border-radius: 50%;
                background: ${color}; border: 2px solid #0a0808;
                box-shadow: 0 0 8px ${color}88; cursor: pointer;
              "></div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          let popupContent = '';
          if (isCluster) {
            const spotList = cluster.spots.map(s => {
              const stat = s.type === 'surf'
                ? `${s.waveHeight ?? 'N/A'}ft`
                : `${s.totalSnowIn ?? '0'}"`;
              const c = s.bg === '#4ade80' ? '#4ade80' : s.bg === '#86efac' ? '#86efac' : s.bg === '#fbbf24' ? '#fbbf24' : '#4a4540';
              const tc = c === '#4a4540' ? '#f0ebe0' : '#0a0808';
              return `
                <a href="/spot/${s.slug}" style="
                  display: flex; justify-content: space-between; align-items: center;
                  padding: 10px 0; border-bottom: 1px solid #1a1510;
                  text-decoration: none; color: #f0ebe0;
                ">
                  <div>
                    <div style="font-size: 14px; font-weight: bold;">${s.name}</div>
                    <div style="font-size: 10px; color: #4a4540; text-transform: uppercase; letter-spacing: 1px;">${s.location}</div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="font-size: 13px; color: #b0a898;">${stat}</div>
                    <div style="
                      font-size: 8px; letter-spacing: 1px; text-transform: uppercase;
                      background: ${c}; color: ${tc}; padding: 2px 6px; font-weight: bold;
                    ">${s.label}</div>
                  </div>
                </a>
              `;
            }).join('');
            popupContent = `
              <div style="
                background: #111010; color: #f0ebe0;
                font-family: Georgia, serif; padding: 16px;
                border: 1px solid #2a2520; min-width: 260px; max-height: 320px; overflow-y: auto;
              ">
                <div style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #4a4540; margin-bottom: 12px;">
                  ${cluster.spots.length} spots in this area
                </div>
                ${spotList}
              </div>
            `;
          } else {
            const spot = cluster.spots[0];
            const c = spot.bg === '#4ade80' ? '#4ade80' : spot.bg === '#86efac' ? '#86efac' : spot.bg === '#fbbf24' ? '#fbbf24' : '#4a4540';
            const tc = c === '#4a4540' ? '#f0ebe0' : '#0a0808';
            const stat = spot.type === 'surf'
              ? `${spot.waveHeight ?? 'N/A'}ft · ${spot.period ?? '—'}s`
              : `${spot.totalSnowIn ?? '0'}" snow`;
            popupContent = `
              <div style="
                background: #111010; color: #f0ebe0;
                font-family: Georgia, serif; padding: 18px;
                border: 1px solid #2a2520; min-width: 200px;
              ">
                <div style="
                  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
                  background: ${c}; color: ${tc};
                  padding: 3px 10px; display: inline-block;
                  font-weight: bold; margin-bottom: 10px;
                ">${spot.label}</div>
                <div style="font-size: 17px; font-weight: bold; margin-bottom: 3px;">${spot.name}</div>
                <div style="font-size: 11px; color: #4a4540; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">${spot.location}</div>
                <div style="font-size: 15px; color: #b0a898; margin-bottom: 14px; font-weight: bold;">${stat}</div>
                <a href="/spot/${spot.slug}" style="
                  display: block; padding: 10px; background: #f0ebe0;
                  color: #0a0808; text-decoration: none; font-size: 11px;
                  font-weight: bold; letter-spacing: 2px; text-transform: uppercase;
                  text-align: center;
                ">View Trip Guide →</a>
              </div>
            `;
          }

          const popup = L.popup({
            className: 'strike-popup',
            closeButton: true,
            maxWidth: 280,
            offset: [0, -4],
          }).setContent(popupContent);

          L.marker([cluster.lat, cluster.lon], { icon }).bindPopup(popup).addTo(markerLayer);
        });
      }

      renderMarkers();
      map.on('zoomend', renderMarkers);

      setTimeout(() => map.invalidateSize(), 100);
      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [spots]);

  return (
    <>
      <style>{`
        .strike-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .strike-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .strike-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .strike-popup .leaflet-popup-close-button {
          color: #4a4540 !important;
          top: 8px !important;
          right: 8px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #2a2520 !important;
          background: #111010 !important;
          border-radius: 0 !important;
        }
        .leaflet-control-zoom a {
          background: #111010 !important;
          color: #f0ebe0 !important;
          border-bottom: 1px solid #2a2520 !important;
          border-radius: 0 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1a1510 !important;
        }
      `}</style>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: 'calc(100vh - 180px)',
          minHeight: '600px',
          background: '#111010',
        }}
      />
    </>
  );
}
