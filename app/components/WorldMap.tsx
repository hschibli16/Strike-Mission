"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Region } from '../regions';
import { Spot } from '../spots';
import { getSpotConfidence } from '../lib/spot-confidence';

interface WorldMapProps {
  regions: Region[];
  spots: Spot[];
  spotCountByRegion: Record<string, number>;
  mode: 'all' | 'surf' | 'ski';
}

// Helper component that programmatically controls the map view
function MapController({
  focusedRegion,
  onZoomOut,
}: {
  focusedRegion: Region | null;
  onZoomOut: () => void;
}) {
  const map = useMap();

  // Programmatic fly when focusedRegion changes
  useEffect(() => {
    if (focusedRegion && focusedRegion.centroidLat != null && focusedRegion.centroidLon != null) {
      map.flyTo(
        [focusedRegion.centroidLat, focusedRegion.centroidLon],
        focusedRegion.focusZoom ?? 5,
        { duration: 1.2 }
      );
    } else {
      map.flyTo([20, 0], 2, { duration: 1.2 });
    }
  }, [focusedRegion, map]);

  // Detect manual zoom-out while a region is focused
  useEffect(() => {
    if (!focusedRegion) return;
    const handleZoomEnd = () => {
      const threshold = Math.max(3, (focusedRegion.focusZoom ?? 5) - 2);
      if (map.getZoom() < threshold) {
        onZoomOut();
      }
    };
    map.on('zoomend', handleZoomEnd);
    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [focusedRegion, map, onZoomOut]);

  return null;
}

export default function WorldMap({ regions, spots, spotCountByRegion, mode }: WorldMapProps) {
  const [focusedRegionSlug, setFocusedRegionSlug] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Filter regions by mode
  const filteredRegions = regions.filter(r => {
    if (mode === 'all') return true;
    if (mode === 'surf') return r.type === 'surf';
    return r.type === 'ski';
  });

  const focusedRegion = filteredRegions.find(r => r.slug === focusedRegionSlug) ?? null;
  const focusedSpots = focusedRegionSlug
    ? spots.filter(s => s.regionSlug === focusedRegionSlug)
    : [];

  // Only render regions that have centroid data
  const regionsWithCoords = filteredRegions.filter(
    r => r.centroidLat != null && r.centroidLon != null
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: 640 }}>
      {/* HEADER BANNER */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 400,
        padding: '12px 16px',
        background: 'rgba(10, 8, 8, 0.92)',
        borderBottom: '1px solid #1a1510',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontFamily: 'Georgia, serif',
      }}>
        {focusedRegion ? (
          <>
            <button
              onClick={() => setFocusedRegionSlug(null)}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid #2a2520',
                color: '#f0ebe0',
                fontFamily: 'Georgia, serif',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <div style={{ fontSize: 15, color: '#f0ebe0' }}>
              <span style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6b6560',
                marginRight: 8,
              }}>
                EXPLORING
              </span>
              {focusedRegion.name}
            </div>
            <div style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: '#6b6560',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              {focusedSpots.length} spot{focusedSpots.length !== 1 ? 's' : ''}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13, color: '#6b6560', fontStyle: 'italic' }}>
            {showHint
              ? 'Click a region to explore its spots →'
              : `${regionsWithCoords.length} regions worldwide`}
          </div>
        )}
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom
        worldCopyJump
        style={{ height: '100%', width: '100%', background: '#0a0808' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CartoDB'
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
          attribution=''
        />

        <MapController
          focusedRegion={focusedRegion}
          onZoomOut={() => setFocusedRegionSlug(null)}
        />

        {/* Region markers (only shown when no region is focused) */}
        {!focusedRegion && regionsWithCoords.map(region => {
          const count = spotCountByRegion[region.slug] ?? 0;
          const radius = 8 + Math.min(count * 2, 12);
          const fillColor =
            count === 0
              ? '#6b6560'
              : region.type === 'surf'
              ? '#4ade80'
              : '#86efac';
          return (
            <CircleMarker
              key={region.slug}
              center={[region.centroidLat!, region.centroidLon!]}
              radius={radius}
              pathOptions={{
                fillColor,
                color: '#0a0808',
                weight: 2,
                fillOpacity: count === 0 ? 0.4 : 0.9,
              }}
              eventHandlers={{
                click: () => setFocusedRegionSlug(region.slug),
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Georgia, serif', padding: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#0a0808' }}>{region.name}</div>
                  <div style={{ fontSize: 12, color: '#6b6560', marginTop: 4 }}>
                    {count === 0 ? 'Coming soon' : `${count} spot${count > 1 ? 's' : ''}`}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6560', marginTop: 6, fontStyle: 'italic' }}>
                    Click marker to zoom in
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Spot pins (only shown when a region is focused) */}
        {focusedRegion && focusedSpots.map(spot => {
          const tier = getSpotConfidence(spot).tier;
          const fillColor =
            tier === 'high' ? '#4ade80' : tier === 'medium' ? '#fbbf24' : '#6b6560';
          return (
            <CircleMarker
              key={spot.slug}
              center={[spot.lat, spot.lon]}
              radius={6}
              pathOptions={{
                fillColor,
                color: '#0a0808',
                weight: 2,
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'Georgia, serif', padding: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#0a0808' }}>{spot.name}</div>
                  <div style={{ fontSize: 12, color: '#6b6560', marginTop: 2 }}>
                    {spot.location}
                  </div>
                  <Link
                    href={`/spot/${spot.slug}`}
                    style={{
                      display: 'inline-block',
                      marginTop: 8,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#0a0808',
                      textDecoration: 'underline',
                    }}
                  >
                    View spot →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
