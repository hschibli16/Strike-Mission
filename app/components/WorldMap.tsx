"use client";

import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Region } from '../regions';
import { Spot } from '../spots';
import { getSpotConfidence } from '../lib/spot-confidence';

function createSurfIcon(strokeColor: string, sizePx: number, isHover: boolean = false, opacity: number = 1): L.DivIcon {
  const scale = isHover ? 1.25 : 1;
  const actualSize = Math.round(sizePx * scale);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${actualSize}" height="${actualSize}" viewBox="0 0 24 24" fill="none" style="opacity:${opacity}">
      <path d="M2 10 Q 6 6, 10 10 T 18 10 T 22 10"
            fill="none"
            stroke="${strokeColor}"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
      <path d="M2 16 Q 6 12, 10 16 T 18 16 T 22 16"
            fill="none"
            stroke="${strokeColor}"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'map-icon-surf',
    iconSize: [actualSize, actualSize],
    iconAnchor: [actualSize / 2, actualSize / 2],
  });
}

function createSkiIcon(fillColor: string, sizePx: number, isHover: boolean = false, opacity: number = 1): L.DivIcon {
  const scale = isHover ? 1.25 : 1;
  const actualSize = Math.round(sizePx * scale);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${actualSize}" height="${actualSize}" viewBox="0 0 24 24" fill="none" style="opacity:${opacity}">
      <path d="M12 4 L 22 20 L 2 20 Z"
            fill="${fillColor}"
            stroke="#0a0808"
            stroke-width="1.2"
            stroke-linejoin="round"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'map-icon-ski',
    iconSize: [actualSize, actualSize],
    iconAnchor: [actualSize / 2, actualSize / 2],
  });
}

const REGION_PROMINENCE: Record<string, number> = {
  // Surf prominence 3
  'hawaii': 3,
  'indonesia-archipelago': 3,
  'south-pacific-islands': 3,
  'east-australia-coast': 3,
  'atlantic-europe': 3,
  // Surf prominence 2
  'pacific-northwest-california-coast': 2,
  'central-america-pacific': 2,
  'south-america-pacific': 2,
  'southern-african-coast': 2,
  'caribbean-islands': 2,
  'atlantic-canada-new-england': 2,
  'us-mid-atlantic-southeast': 2,
  'west-african-atlantic': 2,
  'new-zealand-coast': 2,
  // Ski prominence 3
  'french-alps': 3,
  'swiss-alps': 3,
  'austrian-alps': 3,
  'us-rocky-mountains': 3,
  'canadian-rockies-coast': 3,
  'himalaya-nepal-india': 3,
  'andes': 3,
  'japanese-alps-hokkaido': 3,
  // Ski prominence 2
  'italian-alps-dolomites': 2,
  'sierra-nevada-cascades': 2,
  'alaska-range-chugach': 2,
  'australian-nz-alps': 2,
  'scandinavian-mountains': 2,
};

function getProminence(slug: string): number {
  return REGION_PROMINENCE[slug] ?? 1;
}

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
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CartoDB'
          maxZoom={19}
        />

        <MapController
          focusedRegion={focusedRegion}
          onZoomOut={() => setFocusedRegionSlug(null)}
        />

        {/* Region markers (only shown when no region is focused) */}
        {!focusedRegion && regionsWithCoords.map(region => {
          const count = spotCountByRegion[region.slug] ?? 0;
          const isEmpty = count === 0;
          const prominence = getProminence(region.slug);
          const baseSize = 22 + (prominence - 1) * 4;
          const surfColor = '#f97316';
          const skiColor = '#60a5fa';
          const iconColor = region.type === 'surf' ? surfColor : skiColor;
          const iconOpacity = isEmpty ? 0.5 : 1;
          const icon = region.type === 'surf'
            ? createSurfIcon(iconColor, baseSize, false, iconOpacity)
            : createSkiIcon(iconColor, baseSize, false, iconOpacity);

          return (
            <Marker
              key={region.slug}
              position={[region.centroidLat!, region.centroidLon!]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (!isEmpty) setFocusedRegionSlug(region.slug);
                },
                mouseover: (e) => {
                  const marker = e.target;
                  const hoverIcon = region.type === 'surf'
                    ? createSurfIcon(iconColor, baseSize, true, iconOpacity)
                    : createSkiIcon(iconColor, baseSize, true, iconOpacity);
                  marker.setIcon(hoverIcon);
                },
                mouseout: (e) => {
                  const marker = e.target;
                  marker.setIcon(icon);
                },
              }}
            >
              <Tooltip
                direction="right"
                offset={[10, 0]}
                opacity={0.95}
                className="region-tooltip"
              >
                <div style={{ fontFamily: 'Georgia, serif' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0a0808' }}>
                    {region.name}
                  </div>
                  <div style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#6b6560',
                    marginTop: 2,
                    fontStyle: isEmpty ? 'italic' : 'normal',
                  }}>
                    {isEmpty ? 'Coming soon' : `${count} spot${count > 1 ? 's' : ''}`}
                  </div>
                </div>
              </Tooltip>
              {isEmpty && (
                <Popup>
                  <div style={{ fontFamily: 'Georgia, serif', padding: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0a0808' }}>{region.name}</div>
                    <div style={{ fontSize: 12, color: '#6b6560', marginTop: 4, fontStyle: 'italic' }}>
                      Coming soon — no spots added yet
                    </div>
                    <Link
                      href={`/region/${region.slug}`}
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
                      View region →
                    </Link>
                  </div>
                </Popup>
              )}
            </Marker>
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
      <style>{`
        .region-tooltip {
          background: rgba(240, 235, 224, 0.95) !important;
          border: 1px solid #2a2520 !important;
          border-radius: 2px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
          padding: 6px 10px !important;
          white-space: nowrap !important;
        }
        .region-tooltip::before {
          border-right-color: rgba(240, 235, 224, 0.95) !important;
        }
        .leaflet-popup-content-wrapper {
          background: #f0ebe0 !important;
          color: #0a0808 !important;
          border-radius: 2px !important;
        }
        .leaflet-popup-tip {
          background: #f0ebe0 !important;
        }
        .leaflet-container {
          cursor: grab;
        }
        .leaflet-container:active {
          cursor: grabbing;
        }
        .leaflet-interactive {
          cursor: pointer !important;
        }
        .leaflet-control-attribution {
          background: rgba(10, 8, 8, 0.7) !important;
          color: #6b6560 !important;
          font-size: 10px !important;
          padding: 2px 6px !important;
        }
        .leaflet-control-attribution a {
          color: #6b6560 !important;
        }
        .leaflet-attribution-flag {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
