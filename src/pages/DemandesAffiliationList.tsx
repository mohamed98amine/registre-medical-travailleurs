import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Plus,
  MapPin,
  FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { demandeAffiliationAPI } from '../services/api';
import { DemandeAffiliation } from '../types';
// import { localStorageService } from '../services/localStorage'; // Plus utilisé

// Plus utilisé - migration vers backend
// const convertToLocalStorageType = (demande: DemandeAffiliation) => ({
//   ...demande,
//   employeurId: 1, // ID par défaut
//   directeurRegionalId: 1 // ID par défaut
// });

const DemandesAffiliationList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<DemandeAffiliation | null>(null);
  const [action, setAction] = useState<'VALIDER' | 'REJETER' | 'ASSIGNER' | 'CONTRAT'>('VALIDER');
  const [motifRejet, setMotifRejet] = useState('');
  const [commentaires, setCommentaires] = useState('');
  const [zoneSelectionnee, setZoneSelectionnee] = useState('');

  // Utiliser l'API réelle pour récupérer les demandes
  const { data: demandesResponse, isLoading: demandesLoading, error: demandesError } = useQuery({
    queryKey: ['demandes-affiliation'],
    queryFn: () => demandeAffiliationAPI.getAll(),
    retry: 1,
  });

  // S'assurer que demandes est toujours un tableau
  const demandes = useMemo(() => {
    if (Array.isArray(demandesResponse)) {
      return demandesResponse;
    }
    if (demandesResponse && typeof demandesResponse === 'object' && 'data' in demandesResponse && Array.isArray(demandesResponse.data)) {
      return demandesResponse.data;
    }
    return [];
  }, [demandesResponse]);

  // Zones disponibles pour l'assignation
  const zonesDisponibles = [
    "Zone Nord",
    "Zone Sud", 
    "Zone Est",
    "Zone Ouest",
    "Zone Centre"
  ];

  // Mutations pour valider/rejeter
  const validerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      demandeAffiliationAPI.valider(id, data),
    onSuccess: () => {
      toast.success('Demande validée avec succès');
      queryClient.invalidateQueries({ queryKey: ['demandes-affiliation'] });
      setShowModal(false);
      resetModal();
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la validation: ' + (error.response?.data?.message || error.message));
    }
  });

  const rejeterMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      demandeAffiliationAPI.rejeter(id, data),
    onSuccess: () => {
      toast.success('Demande rejetée');
      queryClient.invalidateQueries({ queryKey: ['demandes-affiliation'] });
      setShowModal(false);
      resetModal();
    },
    onError: (error: any) => {
      toast.error('Erreur lors du rejet: ' + (error.response?.data?.message || error.message));
    }
  });

  const resetModal = () => {
    setSelectedDemande(null);
    setAction('VALIDER');
    setMotifRejet('');
    setCommentaires('');
    setZoneSelectionnee('');
  };

  const handleAction = (demande: DemandeAffiliation, actionType: 'VALIDER' | 'REJETER' | 'ASSIGNER' | 'CONTRAT') => {
    setSelectedDemande(demande);
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedDemande) return;

    if (action === 'VALIDER') {
      const data = {
        commentaires: commentaires.trim()
      };
      validerMutation.mutate({ id: selectedDemande.id, data });
    } else if (action === 'REJETER') {
      if (!motifRejet.trim()) {
        toast.error('Le motif de rejet est obligatoire');
        return;
      }
      const data = {
        commentaires: commentaires.trim(),
        motifRejet: motifRejet.trim()
      };
      rejeterMutation.mutate({ id: selectedDemande.id, data });
    } else if (action === 'ASSIGNER') {
      if (!zoneSelectionnee) {
        toast.error('Veuillez sélectionner une zone');
        return;
      }
      try {
        await demandeAffiliationAPI.assignZone(selectedDemande.id, zoneSelectionnee);
        toast.success(`Zone "${zoneSelectionnee}" assignée à la demande ${selectedDemande.raisonSociale}`);
        queryClient.invalidateQueries({ queryKey: ['demandes-affiliation'] }); // Invalidate to refresh data
        queryClient.invalidateQueries({ queryKey: ['dashboard-directeur'] }); // Invalidate dashboard stats
        setShowModal(false);
        resetModal();
      } catch (error) {
        toast.error('Erreur lors de l\'assignation de la zone');
        console.error('Erreur assignation:', error);
      }
    } else if (action === 'CONTRAT') {
      // Rediriger vers le formulaire de création de contrat
      navigate(`/contrats/nouveau?demandeId=${selectedDemande.id}`);
      setShowModal(false);
      resetModal();
    }
  };

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = demande.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demande.secteurActivite.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || demande.statut === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'NOUVELLE':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">En attente</span>;
      case 'EN_COURS':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">En cours</span>;
      case 'VALIDEE':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Validée</span>;
      case 'REJETEE':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Rejetée</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{statut}</span>;
    }
  };

  // Gestion du loading et des erreurs
  if (demandesLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600">Chargement des demandes...</div>
      </div>
    );
  }

  if (demandesError) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-red-600">Erreur lors du chargement des demandes</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes d'Affiliation</h1>
          <p className="text-gray-600">Gérez les demandes d'affiliation des entreprises</p>
        </div>
        <button
          onClick={() => navigate('/demande-affiliation')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-xl font-semibold">
                {demandes.filter(d => d.statut === 'NOUVELLE').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-xl font-semibold">
                {demandes.filter(d => d.statut === 'EN_COURS').length}
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
                placeholder="Rechercher par entreprise ou secteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="nouvelle">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="validee">Validées</option>
              <option value="rejetee">Rejetées</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des demandes */}
      <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
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
                  Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                      <div className="text-sm font-medium text-gray-900">{demande.raisonSociale}</div>
                      <div className="text-sm text-gray-500">{demande.representantLegal}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.secteurActivite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.effectif} employés
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(demande.statut)}
                    {demande.commentaires && demande.commentaires.includes('ZONE=') && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          <MapPin className="w-3 h-3 mr-1" />
                          {demande.commentaires.split('ZONE=')[1]?.split('|')[0]?.trim() || 'Zone assignée'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => navigate(`/demandes-affiliation/${demande.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      
                      {demande.statut === 'NOUVELLE' && (
                          <>
                            <button 
                              onClick={() => handleAction(demande, 'VALIDER')}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Valider"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(demande, 'REJETER')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Rejeter"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      
                      {/* Boutons toujours disponibles */}
                      <button
                        onClick={() => handleAction(demande, 'ASSIGNER')}
                        className="text-purple-600 hover:text-purple-900 p-1"
                        title="Assigner une zone"
                      >
                        <MapPin className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(demande, 'CONTRAT')}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Générer contrat"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Modal pour les actions */}
      {showModal && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'VALIDER' && 'Valider la demande'}
              {action === 'REJETER' && 'Rejeter la demande'}
              {action === 'ASSIGNER' && 'Assigner une zone'}
              {action === 'CONTRAT' && 'Générer le contrat'}
              </h3>
              
              <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Entreprise:</p>
              <p className="font-medium">{selectedDemande.raisonSociale}</p>
              </div>

              {action === 'REJETER' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif de rejet *
                  </label>
                  <textarea
                    value={motifRejet}
                    onChange={(e) => setMotifRejet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Expliquez pourquoi la demande est rejetée..."
                  />
                </div>
              )}

            {action === 'ASSIGNER' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone à assigner *
                </label>
                <select
                  value={zoneSelectionnee}
                  onChange={(e) => setZoneSelectionnee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une zone...</option>
                  {zonesDisponibles.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            )}

            {action === 'CONTRAT' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone assignée
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    <MapPin className="w-3 h-3 mr-1" />
{selectedDemande.commentaires && selectedDemande.commentaires.includes('ZONE=') 
                      ? selectedDemande.commentaires.split('ZONE=')[1]?.split('|')[0]?.trim() 
                      : 'Aucune zone assignée'}
                  </span>
                </div>
              </div>
            )}

            {(action === 'VALIDER' || action === 'REJETER' || action === 'CONTRAT') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires
                </label>
                <textarea
                  value={commentaires}
                  onChange={(e) => setCommentaires(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Ajoutez des commentaires..."
                />
              </div>
            )}

              <div className="flex justify-end gap-3">
                <button
                onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitAction}
                disabled={validerMutation.isPending || rejeterMutation.isPending}
                  className={`px-4 py-2 rounded-lg text-white ${
                    action === 'VALIDER' 
                      ? 'bg-green-600 hover:bg-green-700' 
                    : action === 'ASSIGNER'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : action === 'CONTRAT'
                    ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                {(validerMutation.isPending || rejeterMutation.isPending) 
                    ? 'Traitement...' 
                  : action === 'VALIDER' ? 'Valider' 
                  : action === 'ASSIGNER' ? 'Assigner'
                  : action === 'CONTRAT' ? 'Générer & Envoyer'
                  : 'Rejeter'
                  }
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandesAffiliationList;