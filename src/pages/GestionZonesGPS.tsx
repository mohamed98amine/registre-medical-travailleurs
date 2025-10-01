import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Target,
  Users,
  Building,
  Settings,
  Eye,
  Navigation,
  Circle
} from 'lucide-react';
import GoogleMap from '../components/GoogleMap';

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
  
  update: (id: number, data: any) => fetch(`/api/zones-medicales/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  delete: (id: number) => fetch(`/api/zones-medicales/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),
  
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
  })
};

const GestionZonesGPS: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<ZoneMedicale | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 12.2383, lng: -1.5616 }); // Ouagadougou, Burkina Faso
  const [mapZoom, setMapZoom] = useState(10); // Zoom plus élevé pour voir les villages
  const [mapType, setMapType] = useState<string>('satellite');

  // Formulaire de création de zone
  const [newZone, setNewZone] = useState({
    nom: '',
    description: '',
    latitude: mapCenter.lat,
    longitude: mapCenter.lng,
    rayonKm: 50,
    couleurCarte: '#3B82F6',
    capaciteMax: 100,
    region: 'Casablanca-Settat'
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
      setNewZone({
        nom: '',
        description: '',
        latitude: mapCenter.lat,
        longitude: mapCenter.lng,
        rayonKm: 50,
        couleurCarte: '#3B82F6',
        capaciteMax: 100,
        region: 'Casablanca-Settat'
      });
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

  const assignerManuelMutation = useMutation({
    mutationFn: ({ zoneId, entrepriseId }: { zoneId: number, entrepriseId: number }) => 
      zonesAPI.assignerManuel(zoneId, entrepriseId),
    onSuccess: () => {
      toast.success('Entreprise assignée avec succès');
      refetchZones();
      refetchEntreprises();
    },
    onError: () => {
      toast.error('Erreur lors de l\'assignation manuelle');
    }
  });

  // Géolocalisation de l'utilisateur
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setNewZone(prev => ({ ...prev, latitude, longitude }));
          toast.success('Position actuelle détectée');
        },
        (error) => {
          toast.error('Impossible d\'obtenir la position actuelle');
          console.error(error);
        }
      );
    } else {
      toast.error('Géolocalisation non supportée par ce navigateur');
    }
  };

  // Gestionnaire de clic sur la carte
  const handleMapClick = (position: google.maps.LatLngLiteral) => {
    if (showCreateForm) {
      setNewZone(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng
      }));
      toast.success('Position sélectionnée sur la carte');
    }
  };

  // Gestionnaire de clic sur une zone
  const handleZoneClick = (zone: ZoneMedicale) => {
    setSelectedZone(zone);
    setSelectedEntreprise(null);
  };

  // Gestionnaire de clic sur une entreprise
  const handleEntrepriseClick = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setSelectedZone(null);
  };

  // Générer une couleur aléatoire pour les nouvelles zones
  const generateRandomColor = () => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    createZoneMutation.mutate(newZone);
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
        <h1 className="text-3xl font-bold text-gray-900">Gestion des Zones Médicales GPS</h1>
        <div className="flex gap-3">
          <button
            onClick={getCurrentLocation}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Navigation className="h-4 w-4" />
            Ma Position
          </button>
          <button
            onClick={() => navigate('/zones-assignment')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Créer Zone & Assigner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte GPS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Carte Interactive
            </h2>
            
            <GoogleMap
              center={mapCenter}
              zoom={mapZoom}
              mapType={mapType}
            />

            {/* Contrôles du type de carte */}
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => setMapType('satellite')}
                className={`px-3 py-1 text-xs rounded ${
                  mapType === 'satellite'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🛰️ Satellite
              </button>
              <button
                onClick={() => setMapType('hybrid')}
                className={`px-3 py-1 text-xs rounded ${
                  mapType === 'hybrid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗺️ Hybride
              </button>
              <button
                onClick={() => setMapType('roadmap')}
                className={`px-3 py-1 text-xs rounded ${
                  mapType === 'roadmap'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🗺️ Plan
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded">
              {showCreateForm
                ? "Cliquez sur la carte pour placer la nouvelle zone médicale"
                : "Cliquez sur les marqueurs pour voir les détails"
              }
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Formulaire de création */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Créer une Zone</h3>
              <form onSubmit={handleCreateZone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la zone *
                  </label>
                  <input
                    type="text"
                    value={newZone.nom}
                    onChange={(e) => setNewZone(prev => ({ ...prev, nom: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newZone.description}
                    onChange={(e) => setNewZone(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newZone.latitude}
                      onChange={(e) => setNewZone(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newZone.longitude}
                      onChange={(e) => setNewZone(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rayon (km)
                    </label>
                    <input
                      type="number"
                      value={newZone.rayonKm}
                      onChange={(e) => setNewZone(prev => ({ ...prev, rayonKm: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur
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
                      onClick={() => setNewZone(prev => ({ ...prev, couleurCarte: generateRandomColor() }))}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Aléatoire
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={createZoneMutation.isPending}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createZoneMutation.isPending ? 'Création...' : 'Créer Zone'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
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

                {selectedZone.description && (
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <p className="text-sm mt-1">{selectedZone.description}</p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <button
                    onClick={() => assignerAutomatiqueMutation.mutate(selectedZone.id)}
                    disabled={assignerAutomatiqueMutation.isPending}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Assignation Auto
                  </button>
                  
                  <button
                    onClick={() => navigate(`/zones-medicales/${selectedZone.id}/edit`)}
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des entreprises non assignées */}
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
                  <div className="text-xs text-gray-500">{entreprise.effectif} employés</div>
                  
                  {selectedZone && selectedEntreprise?.id === entreprise.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        assignerManuelMutation.mutate({
                          zoneId: selectedZone.id,
                          entrepriseId: entreprise.id
                        });
                      }}
                      disabled={assignerManuelMutation.isPending}
                      className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      Assigner à {selectedZone.nom}
                    </button>
                  )}
                </div>
              ))}
              
              {entreprisesNonAssignees.length === 0 && (
                <p className="text-gray-500 text-center py-4">Toutes les entreprises sont assignées</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Circle className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{zones.length}</div>
              <div className="text-sm text-gray-600">Zones Actives</div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-600">{entreprisesNonAssignees.length}</div>
              <div className="text-sm text-gray-600">Non Assignées</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {zones.reduce((sum, zone) => sum + zone.nombreEntreprisesActuelles, 0)}
              </div>
              <div className="text-sm text-gray-600">Entreprises Assignées</div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {zones.reduce((sum, zone) => sum + zone.capaciteMax, 0)}
              </div>
              <div className="text-sm text-gray-600">Capacité Totale</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionZonesGPS;
