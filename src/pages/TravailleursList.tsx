import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { travailleurAPI } from '../services/api';
import { Travailleur } from '../types';
import { User, Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TravailleursList: React.FC = () => {
  const { user } = useAuth();
  const [travailleurs, setTravailleurs] = useState<Travailleur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPoste, setFilterPoste] = useState('');

  useEffect(() => {
    fetchTravailleurs();
  }, []);

  const fetchTravailleurs = async () => {
    try {
      const response = await travailleurAPI.getAll();
      setTravailleurs(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des travailleurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce travailleur ?')) {
      try {
        await travailleurAPI.delete(id);
        toast.success('Travailleur supprimé avec succès');
        fetchTravailleurs();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredTravailleurs = travailleurs.filter(travailleur => {
    const matchesSearch = 
      travailleur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      travailleur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      travailleur.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterPoste === '' || travailleur.poste === filterPoste;
    
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
        <h1 className="text-3xl font-bold text-gray-900">Travailleurs</h1>
        {user?.role === 'EMPLOYEUR' && (
          <Link
            to="/travailleurs/nouveau"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau travailleur
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nom, prénom ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poste
            </label>
            <select
              value={filterPoste}
              onChange={(e) => setFilterPoste(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les postes</option>
              <option value="Ouvrier">Ouvrier</option>
              <option value="Technicien">Technicien</option>
              <option value="Ingénieur">Ingénieur</option>
              <option value="Cadre">Cadre</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des travailleurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travailleur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'embauche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTravailleurs.map((travailleur) => (
                <tr key={travailleur.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {travailleur.nom} {travailleur.prenom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {travailleur.matricule}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{travailleur.poste}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {new Date(travailleur.dateEmbauche).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{travailleur.telephone}</div>
                    <div className="text-sm text-gray-500">{travailleur.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/travailleurs/${travailleur.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {user?.role === 'EMPLOYEUR' && (
                        <>
                          <Link
                            to={`/travailleurs/${travailleur.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(travailleur.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTravailleurs.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun travailleur trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterPoste ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter un nouveau travailleur.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TravailleursList;


