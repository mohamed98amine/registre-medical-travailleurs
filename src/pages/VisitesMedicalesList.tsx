import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { visiteMedicaleAPI } from '../services/api';
import { VisiteMedicale } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, User, Eye, Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const VisitesMedicalesList: React.FC = () => {
  const { user } = useAuth();
  const [visites, setVisites] = useState<VisiteMedicale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchVisites();
  }, []);

  const fetchVisites = async () => {
    try {
      const response = await visiteMedicaleAPI.getAll();
      setVisites(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des visites');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette visite ?')) {
      try {
        await visiteMedicaleAPI.delete(id);
        toast.success('Visite supprimée avec succès');
        fetchVisites();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'PLANIFIEE': return 'bg-yellow-100 text-yellow-800';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800';
      case 'TERMINEE': return 'bg-green-100 text-green-800';
      case 'ANNULEE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAptitudeColor = (aptitude: string) => {
    switch (aptitude) {
      case 'APTE': return 'bg-green-100 text-green-800';
      case 'INAPTE': return 'bg-red-100 text-red-800';
      case 'APTE_AVEC_RESTRICTIONS': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVisites = visites.filter(visite => {
    const matchesSearch = 
      visite.travailleur?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visite.travailleur?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visite.travailleur?.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === '' || visite.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Visites Médicales</h1>
        {user?.role === 'EMPLOYEUR' && (
          <Link
            to="/visites-medicales/nouvelle"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Visite
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom, prénom ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de visite
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="EMBAUCHE">Embauche</option>
              <option value="PERIODIQUE">Périodique</option>
              <option value="FIN_CONTRAT">Fin de contrat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des visites */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {visite.travailleur?.nom} {visite.travailleur?.prenom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visite.travailleur?.matricule}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {visite.type === 'EMBAUCHE' && 'Embauche'}
                      {visite.type === 'PERIODIQUE' && 'Périodique'}
                      {visite.type === 'FIN_CONTRAT' && 'Fin de contrat'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {format(new Date(visite.date), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Dr. {visite.medecin?.nom} {visite.medecin?.prenom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(visite.statut)}`}>
                      {visite.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {visite.aptitude && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAptitudeColor(visite.aptitude)}`}>
                        {visite.aptitude === 'APTE' && 'Apte'}
                        {visite.aptitude === 'INAPTE' && 'Inapte'}
                        {visite.aptitude === 'APTE_AVEC_RESTRICTIONS' && 'Apte avec restrictions'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/visites-medicales/${visite.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {(user?.role === 'MEDECIN' || user?.role === 'EMPLOYEUR') && (
                        <Link
                          to={`/visites-medicales/${visite.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                      {user?.role === 'EMPLOYEUR' && (
                        <button
                          onClick={() => handleDelete(visite.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredVisites.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune visite trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer une nouvelle visite.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VisitesMedicalesList;