import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Stethoscope,
  FileText,
  Eye,
  Check,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
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
  employeur: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
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

const DashboardMedecin: React.FC = () => {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState<DemandeVisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('TOUS');
  const [selectedDemande, setSelectedDemande] = useState<DemandeVisite | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/demandes-visite/medecin', {
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

  const updateStatut = async (demandeId: number, statut: string, commentaires?: string, nouvelleDate?: string) => {
    setActionLoading(demandeId);
    try {
      const response = await fetch(`http://localhost:8080/api/demandes-visite/${demandeId}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          statut,
          commentaires,
          nouvelleDateProposee: nouvelleDate
        })
      });

      if (response.ok) {
        toast.success('Statut mis à jour avec succès');
        fetchDemandes();
        setSelectedDemande(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(null);
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

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
    acceptees: demandes.filter(d => d.statut === 'ACCEPTEE').length,
    refusees: demandes.filter(d => d.statut === 'REFUSEE').length,
    terminees: demandes.filter(d => d.statut === 'TERMINEE').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Chargement en cours...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Dashboard Médecin
          </h1>
          <p className="text-gray-600 mt-2">Gérez vos demandes de visite médicale</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total demandes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{stats.enAttente}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Acceptées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.acceptees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-red-100 text-red-600">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Refusées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.refusees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.terminees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filtrer les demandes</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('TOUS')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'TOUS' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({stats.total})
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
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Mes demandes</h2>
        </div>

        {filteredDemandes.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
            <p className="text-gray-500">
              {filter === 'TOUS' 
                ? 'Vous n\'avez pas encore de demandes assignées.'
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

                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Employeur: {demande.employeur.prenom} {demande.employeur.nom}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{demande.travailleurs.length} travailleur{demande.travailleurs.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{demande.motif}</p>

                    {demande.commentaires && (
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Commentaires:</strong> {demande.commentaires}
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
                    {demande.statut === 'EN_ATTENTE' && (
                      <>
                        <button
                          onClick={() => updateStatut(demande.id, 'ACCEPTEE')}
                          disabled={actionLoading === demande.id}
                          className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Accepter"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedDemande(demande)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="Proposer nouvelle date"
                        >
                          <CalendarIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateStatut(demande.id, 'REFUSEE')}
                          disabled={actionLoading === demande.id}
                          className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Refuser"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedDemande(demande)}
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

      {/* Modal pour actions détaillées */}
      {selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Action sur la demande
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires (optionnel)
                </label>
                <textarea
                  id="commentaires"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajoutez des commentaires..."
                />
        </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouvelle date proposée (optionnel)
                </label>
                <input
                  type="date"
                  id="nouvelleDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          </div>

            <div className="flex justify-end space-x-3 mt-6">
                        <button
                onClick={() => setSelectedDemande(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
                        <button
                          onClick={() => {
                  const commentaires = (document.getElementById('commentaires') as HTMLTextAreaElement).value;
                  const nouvelleDate = (document.getElementById('nouvelleDate') as HTMLInputElement).value;
                  updateStatut(selectedDemande.id, 'NOUVELLE_DATE_PROPOSEE', commentaires, nouvelleDate);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Proposer nouvelle date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMedecin;
