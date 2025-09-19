import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Map,
  Building2, 
  Users, 
  MapPin,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  Eye,
  Filter,
  Search,
  Plus,
  ArrowLeft,
  Settings,
  X,
  Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  effectif: number;
  secteur: string;
  latitude?: number;
  longitude?: number;
  zoneMedicale?: ZoneMedicale;
}

// API Functions
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
  
  assignerManuel: (zoneId: number, entrepriseId: number) => fetch(`/api/zones-medicales/${zoneId}/assigner-entreprise/${entrepriseId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }),
  
  assignerAutomatique: (zoneId: number) => fetch(`/api/zones-medicales/${zoneId}/assigner-automatique`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json())
};

const ZoneAssignment: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneMedicale | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCreateZoneForm, setShowCreateZoneForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('Toutes');

  // Formulaire création zone
  const [newZone, setNewZone] = useState({
    nom: '',
    description: '',
    latitude: 33.5731,
    longitude: -7.5898,
    rayonKm: 25,
    couleurCarte: '#3B82F6',
    capaciteMax: 100,
    region: 'Casablanca-Settat'
  });

  // Queries
  const { data: zones = [], isLoading: loadingZones, refetch: refetchZones } = useQuery({
    queryKey: ['zones-medicales'],
    queryFn: zonesAPI.getAll,
    retry: 1
  });

  const { data: entreprisesNonAssignees = [], isLoading: loadingEntreprises, refetch: refetchEntreprises } = useQuery({
    queryKey: ['entreprises-non-assignees'],
    queryFn: zonesAPI.getEntreprisesNonAssignees,
    retry: 1
  });

  // Mutations
  const createZoneMutation = useMutation({
    mutationFn: zonesAPI.create,
    onSuccess: () => {
      toast.success('Zone créée avec succès !');
      setShowCreateZoneForm(false);
      setNewZone({
        nom: '',
        description: '',
        latitude: 33.5731,
        longitude: -7.5898,
        rayonKm: 25,
        couleurCarte: '#3B82F6',
        capaciteMax: 100,
        region: 'Casablanca-Settat'
      });
      refetchZones();
    },
    onError: () => {
      toast.error('Erreur lors de la création de la zone');
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ zoneId, entrepriseId }: { zoneId: number, entrepriseId: number }) => 
      zonesAPI.assignerManuel(zoneId, entrepriseId),
    onSuccess: () => {
      toast.success('Entreprise assignée avec succès !');
      setShowAssignmentModal(false);
      setSelectedEntreprise(null);
      setSelectedZone(null);
      refetchZones();
      refetchEntreprises();
    },
    onError: () => {
      toast.error('Erreur lors de l\'assignation');
    }
  });

  const autoAssignMutation = useMutation({
    mutationFn: zonesAPI.assignerAutomatique,
    onSuccess: (data) => {
      toast.success(`${data.nombreAssignees} entreprises assignées automatiquement !`);
      refetchZones();
      refetchEntreprises();
    },
    onError: () => {
      toast.error('Erreur lors de l\'assignation automatique');
    }
  });

  // Filtres
  const regions = Array.from(new Set(zones.map(zone => zone.region)));
  
  const filteredEntreprises = entreprisesNonAssignees.filter(entreprise => {
    const matchesSearch = entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entreprise.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entreprise.secteur.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredZones = zones.filter(zone => 
    filterRegion === 'Toutes' || zone.region === filterRegion
  );

  // Handlers
  const handleAssignEntreprise = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setShowAssignmentModal(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedEntreprise || !selectedZone) return;
    
    assignMutation.mutate({
      entrepriseId: selectedEntreprise.id,
      zoneId: selectedZone.id
    });
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    createZoneMutation.mutate(newZone);
  };

  const getZoneStatusColor = (zone: ZoneMedicale) => {
    const percentage = (zone.nombreEntreprisesActuelles / zone.capaciteMax) * 100;
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loadingZones || loadingEntreprises) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/zones-gps')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-6 w-6" />
                Assignation des Zones Médicales
              </h1>
              <p className="text-gray-600 mt-1">
                Créez des zones et assignez des entreprises
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateZoneForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Zone
          </button>
          <button
            onClick={() => autoAssignMutation.mutate(zones[0]?.id)}
            disabled={autoAssignMutation.isPending || zones.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {autoAssignMutation.isPending ? 'Assignation...' : 'Assignation Auto'}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Zones Actives</p>
              <p className="text-2xl font-bold text-blue-600">{zones.length}</p>
            </div>
            <Map className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entreprises Non Assignées</p>
              <p className="text-2xl font-bold text-red-600">{entreprisesNonAssignees.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entreprises Assignées</p>
              <p className="text-2xl font-bold text-green-600">
                {zones.reduce((acc, zone) => acc + zone.nombreEntreprisesActuelles, 0)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Capacité Totale</p>
              <p className="text-2xl font-bold text-purple-600">
                {zones.reduce((acc, zone) => acc + zone.capaciteMax, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zones médicales */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Zones Médicales
              </h3>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                >
                  <option value="Toutes">Toutes les régions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredZones.map(zone => (
                <div
                  key={zone.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                    selectedZone?.id === zone.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: zone.couleurCarte }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{zone.nom}</h4>
                          <p className="text-sm text-gray-600">{zone.region}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getZoneStatusColor(zone)}`}>
                          {zone.nombreEntreprisesActuelles}/{zone.capaciteMax} entreprises
                        </span>
                        <span className="text-xs text-gray-500">{zone.rayonKm}km de rayon</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          autoAssignMutation.mutate(zone.id);
                        }}
                        disabled={autoAssignMutation.isPending}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                        title="Assignation automatique"
                      >
                        <Zap className="h-4 w-4" />
                      </button>
                      <span className="text-xs text-gray-400">
                        {((zone.nombreEntreprisesActuelles / zone.capaciteMax) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Entreprises non assignées */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Entreprises Non Assignées
              </h3>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 w-32"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEntreprises.map(entreprise => (
                <div
                  key={entreprise.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{entreprise.nom}</h4>
                      <p className="text-sm text-gray-600">{entreprise.ville} • {entreprise.secteur}</p>
                      <p className="text-xs text-gray-500">{entreprise.effectif} employés</p>
                    </div>
                    <button
                      onClick={() => handleAssignEntreprise(entreprise)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Target className="h-3 w-3" />
                      Assigner
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredEntreprises.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Aucune entreprise non assignée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création de zone */}
      {showCreateZoneForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Créer une Zone Médicale</h3>
              <button
                onClick={() => setShowCreateZoneForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la zone
                </label>
                <input
                  type="text"
                  value={newZone.nom}
                  onChange={(e) => setNewZone(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rayon (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newZone.rayonKm}
                    onChange={(e) => setNewZone(prev => ({ ...prev, rayonKm: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newZone.capaciteMax}
                    onChange={(e) => setNewZone(prev => ({ ...prev, capaciteMax: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Région
                </label>
                <select
                  value={newZone.region}
                  onChange={(e) => setNewZone(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Casablanca-Settat">Casablanca-Settat</option>
                  <option value="Rabat-Salé-Kénitra">Rabat-Salé-Kénitra</option>
                  <option value="Marrakech-Safi">Marrakech-Safi</option>
                  <option value="Fès-Meknès">Fès-Meknès</option>
                  <option value="Tanger-Tétouan-Al Hoceïma">Tanger-Tétouan-Al Hoceïma</option>
                  <option value="Oriental">Oriental</option>
                  <option value="Souss-Massa">Souss-Massa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <input
                  type="color"
                  value={newZone.couleurCarte}
                  onChange={(e) => setNewZone(prev => ({ ...prev, couleurCarte: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateZoneForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createZoneMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {createZoneMutation.isPending ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'assignation */}
      {showAssignmentModal && selectedEntreprise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assigner à une Zone</h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{selectedEntreprise.nom}</h4>
              <p className="text-sm text-gray-600">{selectedEntreprise.ville} • {selectedEntreprise.effectif} employés</p>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {zones.map(zone => (
                <div
                  key={zone.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedZone?.id === zone.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: zone.couleurCarte }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{zone.nom}</h4>
                        <p className="text-xs text-gray-600">{zone.region}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        {zone.nombreEntreprisesActuelles}/{zone.capaciteMax}
                      </span>
                      <p className="text-xs text-gray-500">{zone.rayonKm}km</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAssignment}
                disabled={!selectedZone || assignMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {assignMutation.isPending ? 'Assignation...' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneAssignment;