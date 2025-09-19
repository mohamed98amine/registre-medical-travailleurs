import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Building2, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  Eye,
  Download,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { demandeAffiliationAPI } from '../services/api';
import { DemandeAffiliation } from '../types';

const DemandeAffiliationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showActionModal, setShowActionModal] = useState(false);
  const [action, setAction] = useState<'VALIDER' | 'REJETER'>('VALIDER');
  const [motifRejet, setMotifRejet] = useState('');
  const [commentaires, setCommentaires] = useState('');

  // Récupérer les détails de la demande
  const { data: demande, isLoading, error } = useQuery({
    queryKey: ['demande-affiliation', id],
    queryFn: async () => {
      const response = await demandeAffiliationAPI.getById(parseInt(id!));
      return response.data;
    },
    enabled: !!id
  });

  // Mutation pour valider une demande
  const validerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await demandeAffiliationAPI.valider(parseInt(id!), data);
    },
    onSuccess: () => {
      toast.success('Demande validée avec succès !');
      queryClient.invalidateQueries(['demande-affiliation', id]);
      queryClient.invalidateQueries(['demandes-affiliation']);
      setShowActionModal(false);
      resetModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la validation');
    }
  });

  // Mutation pour rejeter une demande
  const rejeterMutation = useMutation({
    mutationFn: async (data: any) => {
      return await demandeAffiliationAPI.rejeter(parseInt(id!), data);
    },
    onSuccess: () => {
      toast.success('Demande rejetée avec succès !');
      queryClient.invalidateQueries(['demande-affiliation', id]);
      queryClient.invalidateQueries(['demandes-affiliation']);
      setShowActionModal(false);
      resetModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du rejet');
    }
  });

  const resetModal = () => {
    setMotifRejet('');
    setCommentaires('');
    setAction('VALIDER');
  };

  const handleAction = (actionType: 'VALIDER' | 'REJETER') => {
    setAction(actionType);
    setShowActionModal(true);
  };

  const handleSubmitAction = () => {
    const data = {
      commentaires: commentaires.trim(),
      ...(action === 'REJETER' && { motifRejet: motifRejet.trim() })
    };

    if (action === 'VALIDER') {
      validerMutation.mutate(data);
    } else {
      if (!motifRejet.trim()) {
        toast.error('Le motif de rejet est obligatoire');
        return;
      }
      rejeterMutation.mutate(data);
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-2" />
        {statut}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Données simulées pour l'historique des communications
  const historiqueEchanges = [
    {
      id: 1,
      date: '2025-09-12T14:30:00',
      type: 'SOUMISSION',
      description: 'Demande initiale soumise',
      auteur: 'Système',
      details: 'Demande d\'affiliation créée automatiquement'
    },
    {
      id: 2,
      date: '2025-09-13T09:15:00',
      type: 'EMAIL',
      description: 'Email de confirmation envoyé',
      auteur: 'Système',
      details: 'Accusé de réception envoyé à l\'entreprise'
    },
    {
      id: 3,
      date: '2025-09-13T11:45:00',
      type: 'DEMANDE_INFO',
      description: 'Demande de complément d\'info',
      auteur: 'Dr. KONE Amadou',
      details: 'Demande de précisions sur l\'effectif réel'
    },
    {
      id: 4,
      date: '2025-09-13T16:20:00',
      type: 'REPONSE',
      description: 'Réponse de l\'entreprise reçue',
      auteur: 'Jean OUEDRAOGO',
      details: 'Justificatifs d\'effectif fournis'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Erreur lors du chargement de la demande</p>
        <button 
          onClick={() => navigate('/demandes-affiliation')}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/demandes-affiliation')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour à la liste
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {demande.raisonSociale}
            </h1>
            <p className="text-gray-600">Demande d'affiliation #{demande.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(demande.statut)}
          {(demande.statut === 'NOUVELLE' || demande.statut === 'EN_COURS') && (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('VALIDER')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Valider
              </button>
              <button
                onClick={() => handleAction('REJETER')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rejeter
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fiche détaillée de l'entreprise */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations principales */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Fiche Entreprise - {demande.raisonSociale}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Secteur d'activité</p>
                    <p className="font-medium">{demande.secteurActivite}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Effectif</p>
                    <p className="font-medium">{demande.effectif} employés</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">N° RCCM</p>
                    <p className="font-medium">{demande.numeroRccm}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Phone className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact DRH</p>
                    <p className="font-medium">{demande.contactDrh}</p>
                    <p className="text-sm text-gray-500">{demande.telephone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Mail className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{demande.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium">{formatDate(demande.dateCreation)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Adresse</span>
                  </div>
                  <p className="text-sm text-gray-900">Zone industrielle, Ouagadougou</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Date création</span>
                  </div>
                  <p className="text-sm text-gray-900">1985</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">CA annuel</span>
                  </div>
                  <p className="text-sm text-gray-900">15 milliards FCFA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des échanges */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Historique des Communications
            </h3>
            
            <div className="space-y-4">
              {historiqueEchanges.map((echange) => (
                <div key={echange.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{echange.description}</p>
                      <span className="text-xs text-gray-500">{formatDate(echange.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{echange.details}</p>
                    <p className="text-xs text-gray-500">Par: {echange.auteur}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau d'actions */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Voir les documents</p>
                  <p className="text-sm text-gray-500">RCCM, Statuts, etc.</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border">
                <Download className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Télécharger le dossier</p>
                  <p className="text-sm text-gray-500">PDF complet</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border">
                <Send className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Demander des infos</p>
                  <p className="text-sm text-gray-500">Email à l'entreprise</p>
                </div>
              </button>
            </div>
          </div>

          {/* Informations de traitement */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de traitement</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Délai de traitement</p>
                <p className="font-medium">2 jours ouvrables</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Assigné à</p>
                <p className="font-medium">Dr. KONE Amadou</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Priorité</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Normale
                </span>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          {demande.commentaires && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commentaires</h3>
              <p className="text-gray-700">{demande.commentaires}</p>
            </div>
          )}

          {/* Motif de rejet si applicable */}
          {demande.motifRejet && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Motif de rejet</h3>
              <p className="text-red-700">{demande.motifRejet}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'action */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {action === 'VALIDER' ? 'Valider la demande' : 'Rejeter la demande'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Entreprise:</strong> {demande.raisonSociale}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>RCCM:</strong> {demande.numeroRccm}
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
                    setShowActionModal(false);
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

export default DemandeAffiliationDetail;
