import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Stethoscope, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface DemandeVisite {
  id: number;
  typeVisite: string;
  specialite: string;
  dateSouhaitee: string;
  motif: string;
  statut: string;
  commentaires?: string;
  nouvelleDateProposee?: string;
  createdAt: string;
  medecin?: {
    id: number;
    nom: string;
    prenom: string;
  };
  travailleurs: Array<{
    id: number;
    nom: string;
    prenom: string;
    poste: string;
  }>;
}

const STATUT_COLORS = {
  'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
  'ACCEPTEE': 'bg-green-100 text-green-800',
  'REFUSEE': 'bg-red-100 text-red-800',
  'NOUVELLE_DATE_PROPOSEE': 'bg-blue-100 text-blue-800',
  'INFOS_DEMANDEES': 'bg-purple-100 text-purple-800',
  'TERMINEE': 'bg-gray-100 text-gray-800',
  'ANNULEE': 'bg-gray-100 text-gray-800'
};

const STATUT_LABELS = {
  'EN_ATTENTE': 'En attente',
  'ACCEPTEE': 'Acceptée',
  'REFUSEE': 'Refusée',
  'NOUVELLE_DATE_PROPOSEE': 'Nouvelle date proposée',
  'INFOS_DEMANDEES': 'Informations demandées',
  'TERMINEE': 'Terminée',
  'ANNULEE': 'Annulée'
};

const DemandesVisiteList: React.FC = () => {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState<DemandeVisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('TOUS');

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/demandes-visite/employeur', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDemandes(data);
      } else {
        toast.error('Erreur lors du chargement des demandes');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return <Clock className="w-4 h-4" />;
      case 'ACCEPTEE':
        return <CheckCircle className="w-4 h-4" />;
      case 'REFUSEE':
        return <XCircle className="w-4 h-4" />;
      case 'NOUVELLE_DATE_PROPOSEE':
        return <Calendar className="w-4 h-4" />;
      case 'INFOS_DEMANDEES':
        return <AlertCircle className="w-4 h-4" />;
      case 'TERMINEE':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredDemandes = filter === 'TOUS' 
    ? demandes 
    : demandes.filter(d => d.statut === filter);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Demandes de visite</h1>
          <button
            onClick={() => navigate('/demandes-visite/nouvelle')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Nouvelle demande
          </button>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('TOUS')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'TOUS' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({demandes.length})
          </button>
          {Object.entries(STATUT_LABELS).map(([key, label]) => {
            const count = demandes.filter(d => d.statut === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Liste des demandes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredDemandes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
              <p className="text-gray-500">
                {filter === 'TOUS' 
                  ? 'Vous n\'avez pas encore créé de demande de visite.'
                  : 'Aucune demande avec ce statut.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDemandes.map((demande) => (
                <div key={demande.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUT_COLORS[demande.statut as keyof typeof STATUT_COLORS]}`}>
                          {getStatutIcon(demande.statut)}
                          <span className="ml-1">{STATUT_LABELS[demande.statut as keyof typeof STATUT_LABELS]}</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {demande.typeVisite} - {demande.specialite}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Date souhaitée: {new Date(demande.dateSouhaitee).toLocaleDateString('fr-FR')}</span>
                        </div>

                        {demande.medecin && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Stethoscope className="w-4 h-4 mr-2" />
                            <span>Dr. {demande.medecin.prenom} {demande.medecin.nom}</span>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{demande.travailleurs.length} travailleur{demande.travailleurs.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{demande.motif}</p>

                      {demande.commentaires && (
                        <div className="bg-gray-50 p-3 rounded-md mb-3">
                          <p className="text-sm text-gray-700">
                            <strong>Commentaires du médecin:</strong> {demande.commentaires}
                          </p>
                        </div>
                      )}

                      {demande.nouvelleDateProposee && (
                        <div className="bg-blue-50 p-3 rounded-md mb-3">
                          <p className="text-sm text-blue-700">
                            <strong>Nouvelle date proposée:</strong> {new Date(demande.nouvelleDateProposee).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}

                      {/* Liste des travailleurs */}
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Travailleurs concernés:</h4>
                        <div className="flex flex-wrap gap-2">
                          {demande.travailleurs.map((travailleur) => (
                            <span
                              key={travailleur.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                            >
                              {travailleur.prenom} {travailleur.nom}
                              {travailleur.poste && (
                                <span className="ml-1 text-gray-500">({travailleur.poste})</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/demandes-visite/${demande.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandesVisiteList;
