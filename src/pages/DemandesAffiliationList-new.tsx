import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Download,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { demandeAffiliationAPI } from '../services/api';
import { DemandeAffiliation } from '../types';

const DemandesAffiliationList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeAffiliation | null>(null);
  const [action, setAction] = useState<'VALIDER' | 'REJETER'>('VALIDER');
  const [motifRejet, setMotifRejet] = useState('');
  const [commentaires, setCommentaires] = useState('');

  // Récupérer les demandes d'affiliation
  const { data: demandes = [], isLoading, error } = useQuery({
    queryKey: ['demandes-affiliation'],
    queryFn: async () => {
      try {
        const response = await demandeAffiliationAPI.getAll();
        return response.data || [];
      } catch (error: any) {
        console.error('Erreur lors du chargement des demandes:', error);
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  // Mutation pour valider une demande
  const validerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await demandeAffiliationAPI.valider(id, data);
    },
    onSuccess: () => {
      toast.success('Demande validée avec succès !');
      queryClient.invalidateQueries(['demandes-affiliation']);
      setShowModal(false);
      resetModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  });

  // Mutation pour rejeter une demande
  const rejeterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return await demandeAffiliationAPI.rejeter(id, data);
    },
    onSuccess: () => {
      toast.success('Demande rejetée avec succès !');
      queryClient.invalidateQueries(['demandes-affiliation']);
      setShowModal(false);
      resetModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    }
  });

  // Filtrer les demandes
  const filteredDemandes = (demandes || []).filter((demande: DemandeAffiliation) => {
    if (!demande) return false;
    
    const matchesSearch = (demande.raisonSociale || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (demande.numeroRccm || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (demande.contactDrh || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || demande.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const resetModal = () => {
    setSelectedDemande(null);
    setMotifRejet('');
    setCommentaires('');
    setAction('VALIDER');
  };

  const handleAction = (demande: DemandeAffiliation, actionType: 'VALIDER' | 'REJETER') => {
    setSelectedDemande(demande);
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmitAction = () => {
    if (!selectedDemande) return;

    const data = {
      commentaires: commentaires.trim(),
      ...(action === 'REJETER' && { motifRejet: motifRejet.trim() })
    };

    if (action === 'VALIDER') {
      validerMutation.mutate({ id: selectedDemande.id, data });
    } else {
      if (!motifRejet.trim()) {
        toast.error('Le motif de rejet est obligatoire');
        return;
      }
      rejeterMutation.mutate({ id: selectedDemande.id, data });
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      'NOUVELLE': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'EN_COURS': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'VALIDEE': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'REJETEE': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig['NOUVELLE'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {statut}
      </span>
    );
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
        <p className="text-red-600">Erreur lors du chargement des demandes d'affiliation</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Demandes d'Affiliation
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les demandes d'affiliation des entreprises
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total demandes</p>
              <p className="text-xl font-semibold">{demandes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-xl font-semibold">
                {demandes.filter(d => d.statut === 'NOUVELLE' || d.statut === 'EN_COURS').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Validées</p>
              <p className="text-xl font-semibold">
                {demandes.filter(d => d.statut === 'VALIDEE').length}
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
              <p className="text-sm text-gray-600">Rejetées</p>
              <p className="text-xl font-semibold">
                {demandes.filter(d => d.statut === 'REJETEE').length}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="NOUVELLE">Nouvelles</option>
              <option value="EN_COURS">En cours</option>
              <option value="VALIDEE">Validées</option>
              <option value="REJETEE">Rejetées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredDemandes.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-500">
              {demandes.length === 0 
                ? "Aucune demande d'affiliation n'a encore été soumise."
                : "Aucune demande ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effectif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {filteredDemandes.map((demande: DemandeAffiliation) => (
                  <tr key={demande.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {demande.raisonSociale}
                        </div>
                        <div className="text-sm text-gray-500">
                          RCCM: {demande.numeroRccm}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.secteurActivite}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.effectif} employés
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{demande.contactDrh}</div>
                      <div className="text-sm text-gray-500">{demande.email}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(demande.dateCreation)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(demande.statut)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        {(demande.statut === 'NOUVELLE' || demande.statut === 'EN_COURS') && (
                          <>
                            <button 
                              onClick={() => handleAction(demande, 'VALIDER')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(demande, 'REJETER')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
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
        )}
      </div>

      {/* Modal de validation/rejet */}
      {showModal && selectedDemande && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {action === 'VALIDER' ? 'Valider la demande' : 'Rejeter la demande'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Entreprise:</strong> {selectedDemande.raisonSociale}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>RCCM:</strong> {selectedDemande.numeroRccm}
                </p>
              </div>

              {action === 'REJETER' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif de rejet *
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={motifRejet}
                    onChange={(e) => setMotifRejet(e.target.value)}
                    placeholder="Expliquez pourquoi cette demande est rejetée..."
                    required
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={commentaires}
                  onChange={(e) => setCommentaires(e.target.value)}
                  placeholder="Commentaires additionnels..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetModal();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitAction}
                  disabled={validerMutation.isLoading || rejeterMutation.isLoading}
                  className={`px-4 py-2 rounded-lg text-white ${
                    action === 'VALIDER' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {(validerMutation.isLoading || rejeterMutation.isLoading) 
                    ? 'Traitement...' 
                    : action === 'VALIDER' ? 'Valider' : 'Rejeter'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesAffiliationList;
