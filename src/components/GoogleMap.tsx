import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapType?: 'satellite' | 'hybrid' | 'roadmap';
  className?: string;
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
}

interface LocationInfo {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  county?: string;
  state?: string;
  country?: string;
  display_name?: string;
}

// Custom marker icon
const createCustomIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #ef4444;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">🏥</div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Reverse geocoding function using Nominatim (OpenStreetMap)
const reverseGeocode = async (lat: number, lng: number): Promise<LocationInfo> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MedicalRegistry/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    return data.address || {};
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {};
  }
};

// Component to handle map events
const MapEvents: React.FC<{
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
  setCurrentLocation: (location: LocationInfo) => void;
}> = ({ onLocationSelect, setCurrentLocation }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      // Get location info
      const locationInfo = await reverseGeocode(lat, lng);
      setCurrentLocation(locationInfo);

      // Call parent callback if provided
      if (onLocationSelect) {
        const address = locationInfo.display_name ||
          [locationInfo.city, locationInfo.town, locationInfo.village, locationInfo.suburb]
            .filter(Boolean)
            .join(', ') ||
          'Localisation inconnue';

        onLocationSelect({ lat, lng, address });
      }
    },
  });

  return null;
};

// Component to update map center when props change
const MapUpdater: React.FC<{ center: { lat: number; lng: number }; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center, zoom, map]);

  return null;
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 12.3714, lng: -1.5197 }, // Ouagadougou, Burkina Faso
  zoom = 12,
  mapType = 'satellite',
  className = 'w-full h-96 rounded-lg',
  onLocationSelect
}) => {
  const [currentMapType, setCurrentMapType] = useState<'satellite' | 'hybrid' | 'roadmap'>(mapType);
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>({});
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Map tile URLs
  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    hybrid: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      overlay: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    roadmap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  const getLocationDisplayName = (location: LocationInfo) => {
    return location.display_name ||
      [location.city, location.town, location.village, location.suburb]
        .filter(Boolean)
        .join(', ') ||
      'Cliquez sur la carte pour voir la localité';
  };

  return (
    <div className={className}>
      {/* Map Controls */}
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="flex bg-white rounded-lg border shadow-sm">
          {[
            { key: 'satellite', label: '🛰️ Satellite', icon: '🛰️' },
            { key: 'hybrid', label: '🔍 Hybride', icon: '🔍' },
            { key: 'roadmap', label: '🗺️ Plan', icon: '🗺️' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCurrentMapType(key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentMapType === key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {icon} {label.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Location Info */}
      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-sm font-medium text-green-900 mb-1">📍 Localisation actuelle :</h4>
        <p className="text-sm text-green-800">
          {getLocationDisplayName(currentLocation)}
        </p>
        {selectedLocation && (
          <p className="text-xs text-green-600 mt-1">
            📌 Coordonnées: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        )}
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        dragging={true}
        touchZoom={true}
      >
        {/* Base Tile Layer */}
        <TileLayer
          url={tileLayers[currentMapType].url}
          attribution={tileLayers[currentMapType].attribution}
          maxZoom={20}
          minZoom={1}
        />

        {/* Overlay for hybrid view */}
        {currentMapType === 'hybrid' && (
          <TileLayer
            url={tileLayers.hybrid.overlay!}
            attribution={tileLayers.hybrid.attribution}
            maxZoom={20}
            minZoom={1}
            opacity={0.7}
          />
        )}

        {/* Custom marker for medical center */}
        <Marker
          position={[center.lat, center.lng]}
          icon={createCustomIcon()}
        >
          <Popup>
            <div style={{ maxWidth: '250px', fontFamily: 'Arial, sans-serif' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '16px' }}>
                🏥 Centre Médical d'Ouagadougou
              </h3>
              <div style={{
                background: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                <p style={{ margin: '4px 0' }}><strong>📍 Localisation:</strong> Centre-ville</p>
                <p style={{ margin: '4px 0' }}><strong>🏥 Type:</strong> Centre médical régional</p>
                <p style={{ margin: '4px 0' }}><strong>📞 Contact:</strong> +226 XX XX XX XX</p>
              </div>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                📍 Lat: {center.lat.toFixed(4)}, Lng: {center.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={L.divIcon({
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: #10b981;
                  border: 3px solid white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: bold;
                  color: white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">📍</div>
              `,
              className: 'selected-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              popupAnchor: [0, -10]
            })}
          >
            <Popup>
              <div style={{ maxWidth: '200px', fontFamily: 'Arial, sans-serif' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '14px' }}>
                  📍 Position sélectionnée
                </h4>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Localité:</strong> {getLocationDisplayName(currentLocation)}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                  📍 Lat: {selectedLocation.lat.toFixed(6)}<br/>
                  📍 Lng: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Map event handlers */}
        <MapEvents
          onLocationSelect={(location) => {
            setSelectedLocation({ lat: location.lat, lng: location.lng });
            if (onLocationSelect) {
              onLocationSelect(location);
            }
          }}
          setCurrentLocation={setCurrentLocation}
        />

        {/* Component to update map when props change */}
        <MapUpdater center={center} zoom={zoom} />
      </MapContainer>

      {/* Enhanced Map Controls Info */}
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">🗺️ Contrôles de la carte :</h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• <strong>Zoom:</strong> Molette souris, boutons +/- ou double-clic</p>
          <p>• <strong>Déplacement:</strong> Cliquez et glissez pour vous déplacer</p>
          <p>• <strong>Type de vue:</strong> Satellite, Hybride (satellite + labels), Plan</p>
          <p>• <strong>Localisation:</strong> Cliquez n'importe où pour voir le nom de la localité</p>
          <p>• <strong>Marqueurs:</strong> Rouge = Centre médical, Vert = Position sélectionnée</p>
          <p>• <strong>Clavier:</strong> Utilisez les flèches pour naviguer</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;