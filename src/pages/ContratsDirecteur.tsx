import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Download,
  Plus,
  Mail,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Contrat {
  id: number;
  numeroContrat: string;
  dateSignature: string;
  tarifAnnuel: number;
  actif: boolean;
  demandeAffiliation: {
    id: number;
    raisonSociale: string;
    effectif: number;
    secteurActivite: string;
    email: string;
  };
  zone?: {
    id: number;
    nom: string;
  };
}

const ContratsDirecteur: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);
  const [action, setAction] = useState<'ACTIVER' | 'DESACTIVER' | 'ENVOYER'>('ACTIVER');

  // Récupérer les contrats générés depuis l'API backend
  const { data: contratsData = [], isLoading: contratsLoading, error: contratsError } = useQuery({
    queryKey: ['contrats-pdf-directeur'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:8080/api/contrats/pdf/directeur', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          return data.data || [];
        }
        return [];
      } catch (error) {
        console.error('Erreur lors du chargement des contrats PDF:', error);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Convertir les données de l'API en format Contrat
  const contrats: Contrat[] = useMemo(() => {
    return contratsData.map((contratData: any) => ({
      id: contratData.contratId || contratData.id || 0,
      numeroContrat: contratData.numeroContrat,
      dateSignature: contratData.dateGeneration,
      tarifAnnuel: contratData.montant,
      actif: true,
      demandeAffiliation: {
        id: contratData.demandeId || 1,
        raisonSociale: contratData.raisonSociale,
        effectif: Math.round(contratData.montant / 15000), // Estimation basée sur le tarif
        secteurActivite: 'Non spécifié',
        email: contratData.email
      },
      zone: {
        id: 1,
        nom: contratData.zone
      },
      pdfData: contratData // Garder les données PDF pour téléchargement
    }));
  }, [contratsData]);

  // Filtrer les contrats
  const filteredContrats = contrats.filter((contrat) => {
    const matchesSearch = contrat.numeroContrat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contrat.demandeAffiliation.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'actif' && contrat.actif) ||
                         (statusFilter === 'inactif' && !contrat.actif);
    
    return matchesSearch && matchesStatus;
  });

  // Fonction pour télécharger un contrat
  const downloadContrat = (contrat: any) => {
    try {
      const pdfData = atob(contrat.pdfData.pdfBase64);
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = contrat.pdfData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement du contrat');
    }
  };

  // Fonction pour consulter un contrat
  const viewContrat = (contrat: any) => {
    try {
      const pdfData = atob(contrat.pdfData.pdfBase64);
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture:', error);
      toast.error('Erreur lors de l\'ouverture du contrat');
    }
  };

  const handleAction = (contrat: Contrat, actionType: 'ACTIVER' | 'DESACTIVER' | 'ENVOYER') => {
    setSelectedContrat(contrat);
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmitAction = () => {
    if (!selectedContrat) return;

    if (action === 'ENVOYER') {
      // Simuler l'envoi par email
      toast.success(`Contrat ${selectedContrat.numeroContrat} envoyé par email à ${selectedContrat.demandeAffiliation.email}`);
    } else {
      // Simuler l'activation/désactivation
      const newStatus = action === 'ACTIVER' ? 'activé' : 'désactivé';
      toast.success(`Contrat ${selectedContrat.numeroContrat} ${newStatus} avec succès`);
    }
    
    setShowModal(false);
    setSelectedContrat(null);
  };

  const getStatusBadge = (actif: boolean) => {
    if (actif) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Inactif
        </span>
      );
    }
  };

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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Gestion des Contrats
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les contrats des entreprises affiliées
          </p>
        </div>
        <button
          onClick={() => navigate('/contrats/creation-avance')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Contrat
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total contrats</p>
              <p className="text-xl font-semibold">{contrats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contrats actifs</p>
              <p className="text-xl font-semibold">
                {contrats.filter(c => c.actif).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contrats inactifs</p>
              <p className="text-xl font-semibold">
                {contrats.filter(c => !c.actif).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chiffre d'affaires</p>
              <p className="text-xl font-semibold">
                {formatCurrency(contrats.reduce((sum, c) => sum + c.tarifAnnuel, 0))}
              </p>
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
                placeholder="Rechercher par numéro de contrat ou entreprise..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des contrats */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredContrats.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contrat trouvé</h3>
            <p className="text-gray-500">
              {contrats.length === 0 
                ? "Aucun contrat n'a encore été créé."
                : "Aucun contrat ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contrat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarif Annuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Signature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContrats.map((contrat) => (
                  <tr key={contrat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contrat.numeroContrat}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contrat.demandeAffiliation.raisonSociale}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contrat.demandeAffiliation.secteurActivite} • {contrat.demandeAffiliation.effectif} employés
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contrat.zone ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {contrat.zone.nom}
                        </span>
                      ) : (
                        <span className="text-gray-400">Non assigné</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(contrat.tarifAnnuel)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contrat.dateSignature)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contrat.actif)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => viewContrat(contrat)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Consulter le PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button 
                          onClick={() => downloadContrat(contrat)}
                          className="text-green-600 hover:text-green-900"
                          title="Télécharger le PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleAction(contrat, 'ENVOYER')}
                          className="text-purple-600 hover:text-purple-900"
                          title="Envoyer par email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'action */}
      {showModal && selectedContrat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {action === 'ENVOYER' ? 'Envoyer le contrat par email' : 
                 action === 'ACTIVER' ? 'Activer le contrat' : 'Désactiver le contrat'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Contrat:</strong> {selectedContrat.numeroContrat}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Entreprise:</strong> {selectedContrat.demandeAffiliation.raisonSociale}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedContrat.demandeAffiliation.email}
                </p>
              </div>

              {action === 'ENVOYER' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Le contrat sera envoyé par email à l'adresse de l'entreprise avec toutes les pièces jointes nécessaires.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedContrat(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitAction}
                  className={`px-4 py-2 rounded-lg text-white ${
                    action === 'ENVOYER' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : action === 'ACTIVER'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {action === 'ENVOYER' ? 'Envoyer' : 
                   action === 'ACTIVER' ? 'Activer' : 'Désactiver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratsDirecteur;
