import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Stethoscope, User, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  disponible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface MedecinFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  disponible: boolean;
}

const GestionMedecins: React.FC = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMedecin, setEditingMedecin] = useState<Medecin | null>(null);
  const [formData, setFormData] = useState<MedecinFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    disponible: true
  });

  const specialites = [
    'Médecine du travail',
    'Médecine générale',
    'Cardiologie',
    'Pneumologie',
    'Dermatologie',
    'Ophtalmologie',
    'ORL',
    'Autre'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Non authentifié');
        return;
      }

      const response = await fetch('/api/medecins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const medecinsData = await response.json();
        setMedecins(medecinsData);
      } else {
        toast.error('Erreur lors du chargement des médecins');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      toast.error('Erreur lors du chargement des médecins');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      specialite: '',
      disponible: true
    });
    setEditingMedecin(null);
  };

  const openModal = (medecin?: Medecin) => {
    if (medecin) {
      setEditingMedecin(medecin);
      setFormData({
        nom: medecin.nom,
        prenom: medecin.prenom || '',
        email: medecin.email,
        telephone: medecin.telephone || '',
        specialite: medecin.specialite || '',
        disponible: medecin.disponible
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

    if (!formData.nom || !formData.email || !formData.specialite) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = editingMedecin ? `/api/medecins/${editingMedecin.id}` : '/api/medecins';
      const method = editingMedecin ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (editingMedecin) {
          setMedecins(prev => prev.map(m => m.id === editingMedecin.id ? result : m));
          toast.success('Médecin modifié avec succès');
        } else {
          setMedecins(prev => [...prev, result]);
          toast.success(`Dr. ${result.prenom} ${result.nom} ajouté avec succès! Disponible dans Programmer Visite.`);
          console.log('Nouveau médecin créé:', result);
        }
        
        closeModal();
      } else {
        const error = await response.json();
        toast.error(`Erreur: ${error.message || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (medecin: Medecin) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer Dr. ${medecin.prenom} ${medecin.nom}?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/medecins/${medecin.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setMedecins(prev => prev.filter(m => m.id !== medecin.id));
        toast.success('Médecin supprimé avec succès');
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

  const filteredMedecins = medecins.filter(medecin =>
    medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medecin.prenom && medecin.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    medecin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medecin.specialite && medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Médecins</h1>
                <p className="text-gray-600">Gérer les médecins disponibles pour les visites</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Ajouter Médecin
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médecin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Liste des médecins */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Médecins ({filteredMedecins.length})
            </h2>
            
            {loading && medecins.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredMedecins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun médecin trouvé
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMedecins.map((medecin) => (
                  <div key={medecin.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Dr. {medecin.prenom} {medecin.nom}
                          </h3>
                          <p className="text-sm text-gray-600">{medecin.specialite}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(medecin)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medecin)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{medecin.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{medecin.telephone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          medecin.disponible 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {medecin.disponible ? 'Disponible' : 'Indisponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingMedecin ? 'Modifier le Médecin' : 'Ajouter un Médecin'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialité *
                </label>
                <select
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez une spécialité</option>
                  {specialites.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="disponible"
                  checked={formData.disponible}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Disponible pour les visites
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
                >
                  {loading ? 'Sauvegarde...' : (editingMedecin ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMedecins;