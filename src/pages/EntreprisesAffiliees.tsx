import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  Users, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { contratAPI } from '../services/api';
import { Contrat } from '../types';

const EntreprisesAffiliees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [secteurFilter, setSecteurFilter] = useState<string>('all');

  // Récupérer les contrats actifs (entreprises affiliées)
  const { data: contrats = [], isLoading, error } = useQuery({
    queryKey: ['contrats-actifs'],
    queryFn: async () => {
      try {
        const response = await contratAPI.getAll();
        // Filtrer côté client pour les contrats actifs
        const data = response.data || [];
        return Array.isArray(data) ? data.filter((c: Contrat) => c && c.actif) : [];
      } catch (error: any) {
        console.error('Erreur lors du chargement des entreprises affiliées:', error);
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  // Extraire les secteurs uniques pour le filtre
  const secteurs = [...new Set(contrats.map((c: Contrat) => c.demandeAffiliation?.secteurActivite).filter(Boolean))];

  // Filtrer les entreprises
  const filteredEntreprises = contrats.filter((contrat: Contrat) => {
    const entreprise = contrat.demandeAffiliation;
    if (!entreprise) return false;

    const matchesSearch = entreprise.raisonSociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entreprise.numeroRccm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entreprise.contactDrh?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSecteur = secteurFilter === 'all' || entreprise.secteurActivite === secteurFilter;
    
    return matchesSearch && matchesSecteur;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erreur lors du chargement des entreprises affiliées</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Entreprises Affiliées
        </h1>
        <p className="text-gray-600 mt-1">
          Liste des entreprises ayant un contrat actif avec l'OST
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total entreprises</p>
              <p className="text-xl font-semibold">{filteredEntreprises.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total employés</p>
              <p className="text-xl font-semibold">
                {contrats.reduce((sum: number, c: Contrat) => sum + (c.demandeAffiliation?.effectif || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">CA total annuel</p>
              <p className="text-xl font-semibold">
                {formatCurrency(contrats.reduce((sum: number, c: Contrat) => sum + (c.tarifAnnuel || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Secteurs</p>
              <p className="text-xl font-semibold">{secteurs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, RCCM ou contact..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={secteurFilter}
              onChange={(e) => setSecteurFilter(e.target.value)}
            >
              <option value="all">Tous les secteurs</option>
              {secteurs.map((secteur) => (
                <option key={secteur} value={secteur}>
                  {secteur}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des entreprises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEntreprises.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
            <p className="text-gray-500">
              {contrats.length === 0 
                ? "Aucune entreprise n'est encore affiliée."
                : "Aucune entreprise ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          filteredEntreprises.map((contrat: Contrat) => {
            const entreprise = contrat.demandeAffiliation;
            if (!entreprise) return null;

            return (
              <div key={contrat.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* En-tête de la carte */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {entreprise.raisonSociale}
                      </h3>
                      <p className="text-sm text-gray-500">
                        RCCM: {entreprise.numeroRccm}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  </div>

                  {/* Informations principales */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{entreprise.secteurActivite}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{entreprise.effectif} employés</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{entreprise.adresse}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{entreprise.telephone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{entreprise.email}</span>
                    </div>
                  </div>

                  {/* Informations du contrat */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Contrat</p>
                        <p className="font-medium">{contrat.numeroContrat}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cotisation annuelle</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(contrat.tarifAnnuel)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date début</p>
                        <p className="font-medium">{formatDate(contrat.dateDebut)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date fin</p>
                        <p className="font-medium">{formatDate(contrat.dateFin)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end mt-4 pt-4 border-t">
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                      <Eye className="h-4 w-4" />
                      Voir détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EntreprisesAffiliees;
