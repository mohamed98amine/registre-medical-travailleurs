import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Search, Eye, Edit, Trash2, Plus, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { visiteMedicaleAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Visite {
  id: number;
  type: string;
  date: string;
  heure: string;
  statut: string;
  aptitude: string | null;
  employeur: {
    id: number;
    nom: string;
    email?: string;
    telephone?: string;
    statut?: string;
  };
  medecin: {
    nom: string;
    prenom: string;
  };
}

const VisitesMedicales: React.FC = () => {
  const { user } = useAuth();
  const [visites, setVisites] = useState<Visite[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [notifyingVisites, setNotifyingVisites] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadVisites();
    // Auto-refresh every 10 seconds pour détection rapide
    const interval = setInterval(loadVisites, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Écouter les changements de localStorage pour détecter les nouvelles visites
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'visitesUpdated') {
        console.log('Détection nouvelle visite - rechargement immédiat');
        setTimeout(() => loadVisites(), 500); // Léger délai pour s’assurer que l’INSERT est terminé
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Écouter aussi les événements personnalisés pour le même onglet
  useEffect(() => {
    const handleVisiteCreated = () => {
      console.log('Visite créée dans le même onglet - rechargement');
      loadVisites();
    };
    
    window.addEventListener('visiteCreated', handleVisiteCreated);
    return () => window.removeEventListener('visiteCreated', handleVisiteCreated);
  }, []);

  const loadVisites = async () => {
    try {
      setLoading(true);
      
      // Utiliser nocache parameter pour éviter les données en cache
      const response = await fetch(`/api/visites-jdbc?nocache=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Données reçues:', data);
        setVisites(data);
        console.log('Visites chargées depuis MySQL:', data.length);

        // Vérifier si le tableau est vide et afficher message d'erreur
        if (data.length === 0) {
          console.error('Aucune donnée reçue de MySQL');
        }

        // Log détaillé pour débogage
        data.forEach((visite: any) => {
          console.log(`Visite ${visite.id}: Employeur = ${visite.employeur?.nom} ${visite.employeur?.prenom || ''}`);
        });
      } else {
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        toast.error('Erreur lors du chargement des visites');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      toast.error('Erreur de connexion à MySQL');
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id: number, newStatut: string) => {
    try {
      const response = await fetch(`/api/visites-jdbc/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut })
      });

      if (response.ok) {
        toast.success('Statut mis à jour');
        loadVisites(); // Recharger depuis MySQL
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const updateAptitude = async (id: number, newAptitude: string) => {
    try {
      const response = await fetch(`/api/visites-jdbc/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aptitude: newAptitude })
      });

      if (response.ok) {
        toast.success('Aptitude mise à jour');
        loadVisites();
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const deleteVisite = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) return;

    try {
      const response = await fetch(`/api/visites-jdbc/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Visite supprimée');
        loadVisites();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const sendNotifications = async (id: number) => {
    try {
      setNotifyingVisites(prev => new Set(prev).add(id));
      await visiteMedicaleAPI.sendNotifications(id);
      toast.success('Notifications envoyées avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi des notifications');
    } finally {
      setNotifyingVisites(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Prévue': return 'bg-blue-100 text-blue-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'Terminée': return 'bg-green-100 text-green-800';
      case 'Annulée': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAptitudeColor = (aptitude: string) => {
    switch (aptitude) {
      case 'Apte': return 'bg-green-100 text-green-800';
      case 'Inapte': return 'bg-red-100 text-red-800';
      case 'Apte avec restrictions': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVisites = visites.filter(visite => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (visite.employeur?.nom?.toLowerCase().includes(searchLower) || false) ||
      ((visite.employeur?.prenom || '').toLowerCase().includes(searchLower) || false) ||
      (visite.medecin?.nom?.toLowerCase().includes(searchLower) || false) ||
      ((visite.medecin?.prenom || '').toLowerCase().includes(searchLower) || false) ||
      visite.type.toLowerCase().includes(searchLower) ||
      visite.statut.toLowerCase().includes(searchLower)
    );

    const matchesDate = !dateFilter || visite.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  console.log('📊 Nombre de visites dans l\'état:', visites.length);
  console.log('📊 Visites filtrées:', filteredVisites.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visites Médicales</h1>
                <p className="text-gray-600">Données MySQL en temps réel ({visites.length} visites)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filtres
              </button>
              <button
                onClick={loadVisites}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                Actualiser
              </button>
              <button
                onClick={() => window.location.href = '/programmer-visite'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Programmer Visite
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, type, médecin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {setSearchTerm(''); setDateFilter('');}}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Effacer filtres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MySQL Status */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium">Connecté à MySQL</span>
            </div>
            <span className="text-green-600 text-sm">Dernière mise à jour: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médecin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aptitude
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisites.map((visite) => (
                    <tr key={visite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {visite.employeur?.nom}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{visite.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(visite.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {visite.heure}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Dr. {visite.medecin?.nom} {visite.medecin?.prenom || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={visite.statut}
                          onChange={(e) => updateStatut(visite.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatutColor(visite.statut)}`}
                        >
                          <option value="Prévue">Prévue</option>
                          <option value="En cours">En cours</option>
                          <option value="Terminée">Terminée</option>
                          <option value="Annulée">Annulée</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={visite.aptitude || ''}
                          onChange={(e) => updateAptitude(visite.id, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getAptitudeColor(visite.aptitude || '')}`}
                        >
                          <option value="">Non définie</option>
                          <option value="Apte">Apte</option>
                          <option value="Inapte">Inapte</option>
                          <option value="Apte avec restrictions">Apte avec restrictions</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {user?.role === 'CHEF_DE_ZONE' && (
                            <button
                              onClick={() => sendNotifications(visite.id)}
                              disabled={notifyingVisites.has(visite.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium disabled:opacity-50"
                            >
                              {notifyingVisites.has(visite.id) ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-700"></div>
                              ) : (
                                <Bell className="h-3 w-3" />
                              )}
                              Notifier
                            </button>
                          )}
                          {user?.role === 'MEDECIN' && visite.statut === 'Prévue' && (
                            <button
                              onClick={() => window.location.href = `/saisie-resultats/${visite.id}`}
                              className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium"
                            >
                              <Edit className="h-3 w-3" />
                              Saisir résultats
                            </button>
                          )}
                          {user?.role === 'MEDECIN' && (
                            <button
                              onClick={() => window.location.href = `/dossier-medical/${visite.employeur.id}`}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium"
                            >
                              <Eye className="h-3 w-3" />
                              Dossier
                            </button>
                          )}
                          <button
                            onClick={() => deleteVisite(visite.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredVisites.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune visite trouvée</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucune visite médicale ne correspond aux critères de recherche.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitesMedicales;