import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  MapPin, 
  Plus, 
  Target, 
  Users, 
  Building,
  Navigation,
  Circle,
  RefreshCw,
  Zap,
  Map
} from 'lucide-react';

// Types
interface ZoneMedicale {
  id: number;
  nom: string;
  description: string;
  latitude: number;
  longitude: number;
  rayonKm: number;
  couleurCarte: string;
  capaciteMax: number;
  nombreEntreprisesActuelles: number;
  region: string;
  actif: boolean;
}

interface Entreprise {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  latitude?: number;
  longitude?: number;
  zoneMedicale?: ZoneMedicale;
  effectif: number;
}

// Principales villes du Burkina Faso avec coordonnées
const VILLES_BURKINA = [
  { nom: "Ouagadougou", lat: 12.3714, lng: -1.5197, pop: "2M+" },
  { nom: "Bobo-Dioulasso", lat: 11.1781, lng: -4.2970, pop: "900K" },
  { nom: "Koudougou", lat: 12.2530, lng: -2.3617, pop: "160K" },
  { nom: "Banfora", lat: 10.6344, lng: -4.7614, pop: "117K" },
  { nom: "Ouahigouya", lat: 13.5822, lng: -2.4167, pop: "124K" },
  { nom: "Pouytenga", lat: 12.3167, lng: -0.3167, pop: "89K" },
  { nom: "Kaya", lat: 13.0833, lng: -1.0833, pop: "54K" },
  { nom: "Tenkodogo", lat: 11.7833, lng: -0.3667, pop: "61K" },
  { nom: "Fada N'Gourma", lat: 12.0617, lng: 0.3581, pop: "41K" },
  { nom: "Gaoua", lat: 10.3333, lng: -3.1833, pop: "45K" },
  { nom: "Dédougou", lat: 12.4667, lng: -3.4833, pop: "45K" },
  { nom: "Léo", lat: 11.1000, lng: -2.1056, pop: "27K" },
  { nom: "Dori", lat: 14.0167, lng: -0.0333, pop: "46K" },
  { nom: "Kongoussi", lat: 13.3167, lng: -1.5333, pop: "18K" },
  { nom: "Réo", lat: 12.3167, lng: -2.4667, pop: "36K" }
];

// API functions
const zonesAPI = {
  getAll: () => fetch('/api/zones-medicales', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json()),
  
  create: (data: any) => fetch('/api/zones-medicales', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  getEntreprisesNonAssignees: () => fetch('/api/zones-medicales/entreprises-non-assignees', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json()),
  
  assignerAutomatique: (zoneId: number) => fetch(`/api/zones-medicales/${zoneId}/assigner-automatique`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json()),
  
  assignerManuel: (zoneId: number, entrepriseId: number) => fetch(`/api/zones-medicales/${zoneId}/assigner-entreprise/${entrepriseId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),

  geocodeAll: () => fetch('/api/geocoding/geocode-all-entreprises', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json())
};

// Convertir les coordonnées réelles en position sur la carte
const coordsToMapPosition = (lat: number, lng: number) => {
  // Burkina Faso bounds: lat 9.4-15.1, lng -5.5 to 2.4
  const minLat = 9.4, maxLat = 15.1;
  const minLng = -5.5, maxLng = 2.4;
  
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
  
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
};

// Convertir position sur la carte en coordonnées
const mapPositionToCoords = (x: number, y: number) => {
  const minLat = 9.4, maxLat = 15.1;
  const minLng = -5.5, maxLng = 2.4;
  
  const lat = maxLat - (y / 100) * (maxLat - minLat);
  const lng = minLng + (x / 100) * (maxLng - minLng);
  
  return { lat, lng };
};

const CarteZonesBurkinaFaso: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [selectedZone, setSelectedZone] = useState<ZoneMedicale | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clickPosition, setClickPosition] = useState<{x: number, y: number} | null>(null);

  // Formulaire de création de zone
  const [newZone, setNewZone] = useState({
    nom: '',
    description: '',
    latitude: 12.3714, // Ouagadougou par défaut
    longitude: -1.5197,
    rayonKm: 50,
    couleurCarte: '#3B82F6',
    capaciteMax: 100,
    region: 'Centre'
  });

  // Requêtes
  const { data: zones = [], isLoading: loadingZones, refetch: refetchZones } = useQuery({
    queryKey: ['zones-medicales'],
    queryFn: zonesAPI.getAll,
    retry: 1
  });

  const { data: entreprisesNonAssignees = [], refetch: refetchEntreprises } = useQuery({
    queryKey: ['entreprises-non-assignees'],
    queryFn: zonesAPI.getEntreprisesNonAssignees,
    retry: 1
  });

  // Mutations
  const createZoneMutation = useMutation({
    mutationFn: zonesAPI.create,
    onSuccess: () => {
      toast.success('Zone créée avec succès');
      setShowCreateForm(false);
      setClickPosition(null);
      refetchZones();
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création de la zone');
      console.error(error);
    }
  });

  const assignerAutomatiqueMutation = useMutation({
    mutationFn: zonesAPI.assignerAutomatique,
    onSuccess: (data) => {
      toast.success(`${data.nombreAssignees} entreprises assignées automatiquement`);
      refetchZones();
      refetchEntreprises();
    },
    onError: () => {
      toast.error('Erreur lors de l\'assignation automatique');
    }
  });

  const geocodeAllMutation = useMutation({
    mutationFn: zonesAPI.geocodeAll,
    onSuccess: (data) => {
      toast.success(`${data.geocoded} entreprises géocodées`);
      refetchEntreprises();
    },
    onError: () => {
      toast.error('Erreur lors du géocodage');
    }
  });

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!showCreateForm) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const coords = mapPositionToCoords(x, y);
    
    setClickPosition({ x, y });
    setNewZone(prev => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng
    }));
    
    toast.success(`Position sélectionnée: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    createZoneMutation.mutate(newZone);
  };

  const getVilleProche = (lat: number, lng: number) => {
    let villeProche = VILLES_BURKINA[0];
    let distanceMin = Infinity;
    
    VILLES_BURKINA.forEach(ville => {
      const distance = Math.sqrt(
        Math.pow(ville.lat - lat, 2) + Math.pow(ville.lng - lng, 2)
      );
      if (distance < distanceMin) {
        distanceMin = distance;
        villeProche = ville;
      }
    });
    
    return villeProche;
  };

  if (loadingZones) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Map className="h-8 w-8 text-green-600" />
          Carte GPS - Zones Médicales Burkina Faso
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => geocodeAllMutation.mutate()}
            disabled={geocodeAllMutation.isPending}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {geocodeAllMutation.isPending ? 'Géocodage...' : 'Géocoder Entreprises'}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showCreateForm 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Annuler' : 'Créer Zone'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Carte principale */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-green-50 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Carte Interactive du Burkina Faso
              </h2>
              {showCreateForm && (
                <p className="text-sm text-green-700 mt-1">
                  Cliquez sur la carte pour placer une nouvelle zone médicale
                </p>
              )}
            </div>
            
            <div 
              ref={mapRef}
              className="relative w-full h-96 bg-gradient-to-br from-orange-100 via-yellow-50 to-green-100 cursor-pointer overflow-hidden"
              onClick={handleMapClick}
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 20%, transparent 20%),
                  radial-gradient(circle at 80% 70%, rgba(251, 191, 36, 0.1) 15%, transparent 15%),
                  radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.05) 25%, transparent 25%)
                `
              }}
            >
              {/* Frontières stylisées du Burkina Faso */}
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                  <path
                    d="M10,20 L90,15 L95,35 L85,80 L15,85 L5,60 Z"
                    fill="rgba(34, 197, 94, 0.05)"
                    stroke="rgba(34, 197, 94, 0.3)"
                    strokeWidth="0.5"
                    className="border-country"
                  />
                </svg>
              </div>

              {/* Villes principales */}
              {VILLES_BURKINA.map((ville, index) => {
                const pos = coordsToMapPosition(ville.lat, ville.lng);
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full border-2 border-white ${
                      ville.nom === 'Ouagadougou' ? 'bg-red-500' : 
                      ville.nom === 'Bobo-Dioulasso' ? 'bg-orange-500' : 'bg-gray-600'
                    }`} />
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-medium">{ville.nom}</div>
                      <div className="text-gray-500">{ville.pop}</div>
                    </div>
                  </div>
                );
              })}

              {/* Zones médicales existantes */}
              {zones.map((zone, index) => {
                const pos = coordsToMapPosition(zone.latitude, zone.longitude);
                return (
                  <div
                    key={zone.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      selectedZone?.id === zone.id ? 'scale-125 z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedZone(zone);
                    }}
                  >
                    {/* Rayon de la zone */}
                    <div
                      className="absolute rounded-full border-2 border-opacity-40 bg-opacity-10"
                      style={{
                        backgroundColor: zone.couleurCarte,
                        borderColor: zone.couleurCarte,
                        width: `${Math.min(zone.rayonKm / 2, 60)}px`,
                        height: `${Math.min(zone.rayonKm / 2, 60)}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                    {/* Marqueur de la zone */}
                    <div
                      className="w-6 h-6 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: zone.couleurCarte }}
                    >
                      {zone.nombreEntreprisesActuelles}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded text-xs shadow-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      <div className="font-medium">{zone.nom}</div>
                      <div>{zone.nombreEntreprisesActuelles}/{zone.capaciteMax} entreprises</div>
                      <div>{zone.rayonKm}km de rayon</div>
                    </div>
                  </div>
                );
              })}

              {/* Entreprises non assignées */}
              {entreprisesNonAssignees.map((entreprise, index) => {
                if (!entreprise.latitude || !entreprise.longitude) return null;
                const pos = coordsToMapPosition(entreprise.latitude, entreprise.longitude);
                return (
                  <div
                    key={entreprise.id}
                    className={`absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                      selectedEntreprise?.id === entreprise.id ? 'ring-2 ring-yellow-400 z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntreprise(entreprise);
                    }}
                    title={`${entreprise.nom} - ${entreprise.ville}`}
                  />
                );
              })}

              {/* Position de la nouvelle zone */}
              {showCreateForm && clickPosition && (
                <div
                  className="absolute w-8 h-8 bg-yellow-500 rounded-full border-4 border-white flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 animate-pulse z-30"
                  style={{
                    left: `${clickPosition.x}%`,
                    top: `${clickPosition.y}%`
                  }}
                >
                  <Plus className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Légende */}
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow text-xs">
                <div className="font-semibold mb-2">Légende:</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                  <span>Ouagadougou</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
                  <span>Bobo-Dioulasso</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-gray-600 rounded-full border border-white"></div>
                  <span>Autres villes</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Circle className="w-3 h-3 text-blue-600" />
                  <span>Zones médicales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Entreprises non assignées</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Formulaire de création */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-700">Créer une Zone Médicale</h3>
              <form onSubmit={handleCreateZone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la zone *
                  </label>
                  <input
                    type="text"
                    value={newZone.nom}
                    onChange={(e) => setNewZone(prev => ({ ...prev, nom: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Zone Centre Ouagadougou"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Région
                  </label>
                  <select
                    value={newZone.region}
                    onChange={(e) => setNewZone(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Centre">Centre</option>
                    <option value="Hauts-Bassins">Hauts-Bassins</option>
                    <option value="Nord">Nord</option>
                    <option value="Centre-Ouest">Centre-Ouest</option>
                    <option value="Est">Est</option>
                    <option value="Sud-Ouest">Sud-Ouest</option>
                    <option value="Centre-Sud">Centre-Sud</option>
                    <option value="Plateau-Central">Plateau-Central</option>
                    <option value="Sahel">Sahel</option>
                    <option value="Centre-Est">Centre-Est</option>
                    <option value="Boucle du Mouhoun">Boucle du Mouhoun</option>
                    <option value="Centre-Nord">Centre-Nord</option>
                    <option value="Cascades">Cascades</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newZone.latitude.toFixed(4)}
                      onChange={(e) => setNewZone(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newZone.longitude.toFixed(4)}
                      onChange={(e) => setNewZone(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {newZone.latitude && newZone.longitude && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    <strong>Ville proche:</strong> {getVilleProche(newZone.latitude, newZone.longitude).nom}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rayon (km)
                    </label>
                    <input
                      type="number"
                      value={newZone.rayonKm}
                      onChange={(e) => setNewZone(prev => ({ ...prev, rayonKm: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      min="1"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacité max
                    </label>
                    <input
                      type="number"
                      value={newZone.capaciteMax}
                      onChange={(e) => setNewZone(prev => ({ ...prev, capaciteMax: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur de la zone
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newZone.couleurCarte}
                      onChange={(e) => setNewZone(prev => ({ ...prev, couleurCarte: e.target.value }))}
                      className="w-12 h-8 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
                        setNewZone(prev => ({ ...prev, couleurCarte: colors[Math.floor(Math.random() * colors.length)] }));
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Aléatoire
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createZoneMutation.isPending}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createZoneMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Créer la Zone
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Détails de la zone sélectionnée */}
          {selectedZone && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Circle className="h-5 w-5" style={{ color: selectedZone.couleurCarte }} />
                {selectedZone.nom}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Entreprises:</span>
                  <span className="font-medium">
                    {selectedZone.nombreEntreprisesActuelles} / {selectedZone.capaciteMax}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Rayon:</span>
                  <span className="font-medium">{selectedZone.rayonKm} km</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Région:</span>
                  <span className="font-medium">{selectedZone.region}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Ville proche:</span>
                  <span className="font-medium">
                    {getVilleProche(selectedZone.latitude, selectedZone.longitude).nom}
                  </span>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => assignerAutomatiqueMutation.mutate(selectedZone.id)}
                    disabled={assignerAutomatiqueMutation.isPending}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    {assignerAutomatiqueMutation.isPending ? 'Assignation...' : 'Assigner Automatiquement'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Entreprises non assignées */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-red-600" />
              Entreprises Non Assignées ({entreprisesNonAssignees.length})
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {entreprisesNonAssignees.map((entreprise) => (
                <div
                  key={entreprise.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedEntreprise?.id === entreprise.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedEntreprise(entreprise)}
                >
                  <div className="font-medium text-sm">{entreprise.nom}</div>
                  <div className="text-xs text-gray-600">{entreprise.ville}</div>
                  <div className="text-xs text-gray-500">
                    {entreprise.effectif} employés
                    {entreprise.latitude && entreprise.longitude && (
                      <span className="ml-2 text-green-600">• GPS ✓</span>
                    )}
                  </div>
                </div>
              ))}
              
              {entreprisesNonAssignees.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Toutes les entreprises sont assignées
                </p>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Circle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="text-xl font-bold text-green-600">{zones.length}</div>
                  <div className="text-xs text-gray-600">Zones</div>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-red-600" />
                <div>
                  <div className="text-xl font-bold text-red-600">{entreprisesNonAssignees.length}</div>
                  <div className="text-xs text-gray-600">Non assignées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarteZonesBurkinaFaso;
