import React, { useState, useEffect } from 'react';
import { Building2, Users, Calendar, MapPin, Phone, Mail, Search } from 'lucide-react';

interface Entreprise {
  id: number;
  nom: string;
  secteurActivite: string;
  adresse: string;
  telephone: string;
  email: string;
  nombreEmployes: number;
  nombreVisites: number;
  derniereVisite?: string;
}

const EntreprisesMedecin: React.FC = () => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSecteur, setFilterSecteur] = useState('');

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    try {
      const response = await fetch('/api/entreprises');
      if (response.ok) {
        const data = await response.json();
        setEntreprises(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntreprises = entreprises.filter(entreprise => {
    const matchesSearch = 
      entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entreprise.secteurActivite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entreprise.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSecteur = filterSecteur === '' || entreprise.secteurActivite === filterSecteur;
    
    return matchesSearch && matchesSecteur;
  });

  const secteurs = [...new Set(entreprises.map(e => e.secteurActivite))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Entreprises</h1>
        <p className="text-gray-600">Liste des entreprises pour lesquelles vous effectuez des visites médicales</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, secteur ou adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterSecteur}
            onChange={(e) => setFilterSecteur(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les secteurs</option>
            {secteurs.map(secteur => (
              <option key={secteur} value={secteur}>{secteur}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des entreprises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntreprises.map((entreprise) => (
          <div key={entreprise.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{entreprise.nom}</h3>
                  <p className="text-sm text-gray-500">{entreprise.secteurActivite}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{entreprise.adresse}</span>
              </div>
              
              {entreprise.telephone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{entreprise.telephone}</span>
                </div>
              )}
              
              {entreprise.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{entreprise.email}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{entreprise.nombreEmployes} employés</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{entreprise.nombreVisites} visites effectuées</span>
              </div>
              
              {entreprise.derniereVisite && (
                <div className="text-sm text-gray-500">
                  Dernière visite: {new Date(entreprise.derniereVisite).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = `/visites-medicales?entreprise=${entreprise.id}`}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Voir visites
                </button>
                <button
                  onClick={() => window.location.href = `/travailleurs?entreprise=${entreprise.id}`}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Employés
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEntreprises.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune entreprise</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterSecteur ? 'Aucune entreprise ne correspond aux critères de recherche.' : 'Aucune entreprise trouvée.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EntreprisesMedecin;