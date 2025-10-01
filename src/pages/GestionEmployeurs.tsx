import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Building2, User, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Employeur {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  statut: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Entreprise {
  id: number;
  nom: string;
  secteurActivite: string;
}

interface EmployeurFormData {
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

const GestionEmployeurs: React.FC = () => {
  const [employeurs, setEmployeurs] = useState<Employeur[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployeur, setEditingEmployeur] = useState<Employeur | null>(null);
  const [formData, setFormData] = useState<EmployeurFormData>({
    nom: '',
    email: '',
    telephone: '',
    statut: 'Actif'
  });

  useEffect(() => {
    loadData();
  }, []);

  // Sauvegarder les employeurs dans localStorage à chaque changement
  useEffect(() => {
    if (employeurs.length > 0) {
      localStorage.setItem('employeurs', JSON.stringify(employeurs));
    }
  }, [employeurs]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger d'abord les données depuis localStorage (persistence)
      const cachedEmployeurs = localStorage.getItem('employeurs');
      if (cachedEmployeurs) {
        try {
          const parsedEmployeurs = JSON.parse(cachedEmployeurs);
          setEmployeurs(parsedEmployeurs);
        } catch (parseError) {
          console.warn('Erreur lors du parsing des données en cache:', parseError);
        }
      }

      // Charger les employeurs depuis l'API (données fraîches)
      const employeursResponse = await fetch('/api/employeurs');

      if (employeursResponse.ok) {
        const employeursData = await employeursResponse.json();
        setEmployeurs(employeursData);
        // Mettre à jour le cache avec les données fraîches
        localStorage.setItem('employeurs', JSON.stringify(employeursData));
      } else {
        // Si l'API échoue, garder les données en cache
        console.warn('API non disponible, utilisation des données en cache');
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Ne pas afficher d'erreur si on a des données en cache
      if (employeurs.length === 0) {
        toast.error('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      statut: 'Actif'
    });
    setEditingEmployeur(null);
  };

  const openModal = (employeur?: Employeur) => {
    if (employeur) {
      setEditingEmployeur(employeur);
      setFormData({
        nom: employeur.nom,
        email: employeur.email,
        telephone: employeur.telephone || '',
        statut: employeur.statut || 'Actif'
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      const url = editingEmployeur
        ? `/api/employeurs/${editingEmployeur.id}`
        : '/api/employeurs';

      const method = editingEmployeur ? 'PUT' : 'POST';

      const requestData = {
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        statut: formData.statut
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (editingEmployeur) {
          setEmployeurs(prev => prev.map(e => e.id === editingEmployeur.id ? result : e));
          toast.success('Employeur modifié avec succès');
        } else {
          setEmployeurs(prev => [...prev, result]);
          toast.success('Employeur ajouté avec succès - Disponible dans Programmer Visite');
          
          // Notifier les autres onglets/composants qu'un nouvel employeur a été ajouté
          localStorage.setItem('employeursUpdated', Date.now().toString());
        }

        closeModal();
        loadData();
      } else {
        const error = await response.json();
        toast.error(`Erreur: ${error.error || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeur: Employeur) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${employeur.nom}?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/employeurs/${employeur.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Employeur supprimé avec succès');
        // Supprimer de la liste locale immédiatement
        setEmployeurs(prev => {
          const updatedEmployeurs = prev.filter(e => e.id !== employeur.id);
          // Mettre à jour localStorage
          localStorage.setItem('employeurs', JSON.stringify(updatedEmployeurs));
          return updatedEmployeurs;
        });
        loadData();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployeurs = employeurs.filter(employeur =>
    employeur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employeur.prenom && employeur.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    employeur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employeur.entreprise && employeur.entreprise.nom && employeur.entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Employeurs</h1>
                <p className="text-gray-600">Gérer les employeurs des entreprises affiliées</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ajouter Employeur
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployeurs.map((employeur) => (
                    <tr key={employeur.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employeur.nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {employeur.email}
                          </div>
                          {employeur.telephone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="h-4 w-4 text-gray-400" />
                              {employeur.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employeur.statut === 'Actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employeur.statut || 'Actif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(employeur)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(employeur)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredEmployeurs.length === 0 && !loading && (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employeur trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter un employeur.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {editingEmployeur ? 'Modifier Employeur' : 'Ajouter Employeur'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NOM *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  STATUT
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EMAIL *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TELEPHONE
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>



              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {loading ? 'Enregistrement...' : (editingEmployeur ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEmployeurs;