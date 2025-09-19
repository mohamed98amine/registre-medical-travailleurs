import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  AlertCircle,
  Calendar,
  Building,
  User,
  ArrowLeft
} from 'lucide-react';
import { DemandeAffiliation } from '../types';

// Import de l'API
import { demandeAffiliationAPI } from '../services/api';

const MesDemandesAffiliation: React.FC = () => {
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['mes-demandes-affiliation'],
    queryFn: () => demandeAffiliationAPI.getMy().then(r => r.data),
    retry: 1
  });

  // Extraire les demandes de la réponse
  const demandes = Array.isArray(response) ? response : [];

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'NOUVELLE':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: Clock,
          label: 'En attente'
        };
      case 'EN_COURS':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: AlertCircle,
          label: 'En cours d\'examen'
        };
      case 'VALIDEE':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircle,
          label: 'Validée'
        };
      case 'REJETEE':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: XCircle,
          label: 'Rejetée'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: Clock,
          label: statut
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de vos demandes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-600">Erreur lors du chargement des demandes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Demandes d'Affiliation</h1>
          <p className="mt-2 text-gray-600">
            Suivez le statut de vos demandes d'affiliation au système de registre médical
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {demandes.length} demande{demandes.length !== 1 ? 's' : ''} trouvée{demandes.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => navigate('/demande-affiliation')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Demande
          </button>
        </div>

        {/* Liste des demandes */}
        {demandes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande d'affiliation</h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore soumis de demande d'affiliation.
            </p>
            <button
              onClick={() => navigate('/demande-affiliation')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Créer ma première demande
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {demandes.map((demande) => {
              const status = getStatusBadge(demande.statut);
              const StatusIcon = status.icon;

              return (
                <div
                  key={demande.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {demande.raisonSociale}
                          </h3>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                            <StatusIcon className="h-4 w-4" />
                            {status.label}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4" />
                            <span>{demande.secteurActivite}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{demande.effectif} employés</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>RCCM: {demande.numeroRccm}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(demande.dateCreation)}</span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p><strong>Représentant légal:</strong> {demande.representantLegal}</p>
                          <p><strong>Contact:</strong> {demande.email} • {demande.telephone}</p>
                          {demande.adresse && (
                            <p><strong>Adresse:</strong> {demande.adresse}</p>
                          )}
                        </div>

                        {/* Messages spécifiques selon le statut */}
                        {demande.statut === 'VALIDEE' && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <p className="text-green-800 font-medium">Demande validée !</p>
                            </div>
                            <p className="text-green-700 text-sm mt-1">
                              Votre demande d'affiliation a été approuvée. Vous pouvez maintenant accéder 
                              à tous les services du système de registre médical.
                            </p>
                          </div>
                        )}

                        {demande.statut === 'REJETEE' && demande.motifRejet && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-5 w-5 text-red-600" />
                              <p className="text-red-800 font-medium">Demande rejetée</p>
                            </div>
                            <p className="text-red-700 text-sm mt-1">
                              <strong>Motif:</strong> {demande.motifRejet}
                            </p>
                            {demande.commentaires && (
                              <p className="text-red-700 text-sm mt-1">
                                <strong>Commentaires:</strong> {demande.commentaires}
                              </p>
                            )}
                          </div>
                        )}

                        {demande.statut === 'EN_COURS' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                              <p className="text-yellow-800 font-medium">Examen en cours</p>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1">
                              Votre demande est actuellement examinée par le directeur régional. 
                              Vous recevrez une notification dès qu'une décision sera prise.
                            </p>
                          </div>
                        )}

                        {demande.statut === 'NOUVELLE' && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <p className="text-blue-800 font-medium">En attente d'examen</p>
                            </div>
                            <p className="text-blue-700 text-sm mt-1">
                              Votre demande a été reçue et sera examinée prochainement par le directeur régional.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex flex-col gap-2">
                        <button
                          onClick={() => navigate(`/demande-affiliation/${demande.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg"
                          title="Voir les détails"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {/* Bouton Contrat pour les demandes validées */}
                        {demande.statut === 'VALIDEE' && (
                          <button
                            onClick={() => navigate(`/contrat-creation?demandeId=${demande.id}`)}
                            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg"
                            title="Créer un contrat"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timeline de statut */}
                  <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Créée le {formatDate(demande.dateCreation)}</span>
                      {demande.dateModification && demande.dateModification !== demande.dateCreation && (
                        <span>Modifiée le {formatDate(demande.dateModification)}</span>
                      )}
                      {demande.directeurRegional && (
                        <span>Assignée à {demande.directeurRegional.nom}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Aide et informations */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Informations utiles</h3>
              <div className="text-blue-800 text-sm space-y-1">
                <p>• Le délai d'examen d'une demande est généralement de 2 à 5 jours ouvrables</p>
                <p>• Vous recevrez une notification par email à chaque changement de statut</p>
                <p>• En cas de rejet, vous pouvez soumettre une nouvelle demande avec les corrections demandées</p>
                <p>• Pour toute question, contactez le service client au support@registremedical.bf</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesDemandesAffiliation;
